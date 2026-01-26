/**
 * This script takes the raw CSV dataset (./raw.tsv) and converts them into 3 JSON datasets - Authors, Manuscripts, and Locations
 * 1. Create "authors" table based on the "Author" value; this table has the "Alternative.Name", "Origin" columns and Author.Wikidata column. For each author with "Author.Wikidata" column, parse `https://www.wikidata.org/wiki/${Author.Wikidata}` page and extract information of "date of birth", "place of birth", "place of death", "date of death", "occupation", and "religion or worldview", create new columns for these values
 * 2. Create "locations" table based on the unique "Manuscript.GPS" values in the raw dataset. Visit `https://www.wikidata.org/wiki/${Wikidata}` and extract native label, type of the place and city/town.
 * 3. Each non-empty row in the raw dataset converts to row in the new JSON dataset "texts", with the author and location ids so its possible to join the datasets. From the original dataset, to the new "texts" dataset, copy the columns: "Date", "Manuscript", "Universal.Incipit", "Sigla", "Title" and "Origin"
 */
import axios from 'axios';
import { CsvError, parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { InputAuthor, InputCity, InputLocation, InputText } from '../types/input';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cities: InputCity[] = [];

interface CityData {
  id: string | null;
  rank: string;
  label: string | null;
}

interface DateData {
  value: number | null;
  rank: string;
}

interface WikidataInfo {
  dateOfBirth?: DateData[];
  placeOfBirth?: CityData[];
  dateOfDeath?: DateData[];
  placeOfDeath?: CityData[];
  occupations?: string[];
  religion?: string | null;
  citizenships?: string[];
}

interface Record {
  Author: string;
  'Alternative.Name': string;
  Origin: string;
  Title: string;
  Sigla: string;
  'Universal.Incipit': string;
  Manuscript: string;
  Foliation: string;
  fol1: string;
  fol2: string;
  Scribe: string;
  Date: string;
  Date_alt: string;
  Note: string;
  Translator: string;
  'Translation.From': string;
  'Translation.To': string;
  Edition1: string;
  EditionLink1: string;
  Edition2: string;
  EditionLink2: string;
  Edition3: string;
  EditionLink3: string;
  Edition4: string;
  EditionLink4: string;
  Edition5: string;
  EditionLink5: string;
  Edition6: string;
  EditionLink6: string;
  Edition7: string;
  EditionLink7: string;
  Edition8: string;
  EditionLink8: string;
  Edition9: string;
  EditionLink9: string;
  Edition10: string;
  EditionLink10: string;
  Edition11: string;
  EditionLink11: string;
  Edition12: string;
  EditionLink12: string;
  Literature: string;
  Notes: string;
  'Manuscript.Catalogue': string;
  'Manuscript.Catalogue.Link': string;
  'Manuscript.DigitalCopy': string;
  'Manuscript.Facsimile': string;
  IIIF: string;
  IsExported: string;
  'Manuscript.GPS': string;
  GRID: string;
  WikiData: string;
  GND: string;
  'Author.Wikidata': string;
  'Translator.Wikidata': string;
}

interface ParseCallback<T> {
  (err: CsvError | undefined, records: T[]): void;
}

interface WikiDataValue {
  id?: string;
  time?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

interface WikiDataDataValue {
  value?: WikiDataValue;
  [key: string]: unknown;
}

interface WikiDataMainsnak {
  datavalue?: WikiDataDataValue;
  [key: string]: unknown;
}

interface WikiDataClaim {
  mainsnak: WikiDataMainsnak;
  rank: string;
  [key: string]: unknown;
}

interface WikiDataClaims {
  P625?: WikiDataClaim[];
  P27?: WikiDataClaim[];
  P19?: WikiDataClaim[];
  P20?: WikiDataClaim[];
  P569?: WikiDataClaim[];
  P570?: WikiDataClaim[];
  P106?: WikiDataClaim[];
  P140?: WikiDataClaim[];
  P159?: WikiDataClaim[];
  P131?: WikiDataClaim[];
  P276?: WikiDataClaim[];
  P31?: WikiDataClaim[];
  [key: string]: WikiDataClaim[] | undefined;
}

interface WikiDataEntity {
  claims: WikiDataClaims;
  labels?: {
    en?: {
      value: string;
    };
  };
  [key: string]: unknown;
}

const geoCodeCity = async (placeId: string): Promise<[number | false, number | false]> => {
  let x: number | false = false;
  let y: number | false = false;
  try {
    const response = await axios.get(`https://www.wikidata.org/w/api.php`, {
      params: {
        action: 'wbgetentities',
        ids: placeId,
        format: 'json',
        languages: 'en',
        props: 'claims',
      },
    });

    const entity = response.data.entities[placeId] as WikiDataEntity;
    const claims = entity.claims;

    const coordinates = claims.P625?.[0]?.mainsnak?.datavalue?.value;
    if (coordinates) {
      const lat = coordinates.latitude;
      const lng = coordinates.longitude;
      if (typeof lat === 'number' && typeof lng === 'number') {
        x = parseFloat(lat.toFixed(6));
        y = parseFloat(lng.toFixed(6));
      }
    }
  } catch (error) {
    console.error(`Error fetching coordinates for ${placeId}:`, (error as Error).message);
  }
  return [x, y];
};

const searchCityId = async (cityName: string): Promise<string | null> => {
  try {
    // Step 1: Search for the entity by name
    const response = await axios.get('https://www.wikidata.org/w/api.php', {
      params: {
        action: 'wbsearchentities',
        search: cityName,
        language: 'en',
        format: 'json',
        type: 'item',
        origin: '*',
        limit: 10,
      },
    });

    // Extract potential city IDs
    const candidates: string[] = response.data.search.map((item: { id: string }) => item.id);

    for (const id of candidates) {
      // Step 2: Check if the entity is a city or geographical location
      const entityResponse = await axios.get(
        `https://www.wikidata.org/wiki/Special:EntityData/${id}.json`
      );

      const entityData = entityResponse.data.entities[id] as WikiDataEntity;
      const claims = entityData.claims;

      if (claims && claims.P31) {
        const instanceOfIds = claims.P31.map(
          (claim: WikiDataClaim) => claim.mainsnak.datavalue?.value?.id
        ).filter(Boolean) as string[];

        // Wikidata IDs for cities, towns, and settlements
        const validLocationTypes = [
          'Q515', // City
          'Q3957', // Town
          'Q56061', // Municipality
          'Q532', // Village
          'Q1549591', // Human settlement
          'Q3024240', // Suburb
          'Q5119', // Metropolis
          'Q3184121', // Administrative territorial entity
          'Q123705', // Big city
        ];

        if (instanceOfIds.some((id: string) => validLocationTypes.includes(id))) {
          return id; // Return the first valid geographical entity
        }
      }
    }
  } catch (error) {
    console.error('Error fetching city ID:', error);
  }

  return null;
};

const addCity = async (placeId: string): Promise<void> => {
  if (!cities.find((city) => city.placeId === placeId)) {
    const cityName = await getWikidataLabel(placeId);
    const [x, y] = await geoCodeCity(placeId);

    if (cityName && !cities.find((city) => city.placeId === placeId)) {
      cities.push({
        id: cities.length + 1,
        placeId,
        cityLabel: cityName,
        x: x === false ? 0 : x,
        y: y === false ? 0 : y,
      });
    }
  }
};

// Helper function to fetch entity label from Wikidata
async function getWikidataLabel(entityId: string | null): Promise<string | null> {
  if (!entityId) return null;

  try {
    const response = await axios.get(`https://www.wikidata.org/w/api.php`, {
      params: {
        action: 'wbgetentities',
        ids: entityId,
        format: 'json',
        languages: 'en',
        props: 'labels',
      },
    });

    return response.data.entities[entityId]?.labels?.en?.value || null;
  } catch (error) {
    console.error(`Error fetching label for ${entityId}:`, (error as Error).message);
    return null;
  }
}

// return year from date string
// +1193-01-01T00:00:00Z -> 1193
// +1280-00-00T00:00:00Z -> 1280
const parseYear = (date: string | null): number | null => {
  if (!date) return null;
  return Number(date.split('-')[0]);
};

// Helper function to fetch Wikidata information
async function fetchWikidataInfo(wikidataId: string): Promise<WikidataInfo | null> {
  if (!wikidataId) return null;

  try {
    const response = await axios.get(`https://www.wikidata.org/w/api.php`, {
      params: {
        action: 'wbgetentities',
        ids: wikidataId,
        format: 'json',
        languages: 'en',
        props: 'claims|labels',
      },
    });

    const entity = response.data.entities[wikidataId] as WikiDataEntity;
    const claims = entity.claims;

    const citizenships = await Promise.all(
      claims.P27?.map(async (claim: WikiDataClaim) => {
        return {
          id: claim?.mainsnak?.datavalue?.value?.id ?? null,
          rank: claim.rank,
          label: await getWikidataLabel(claim?.mainsnak?.datavalue?.value?.id ?? null),
        };
      }) ?? []
    );

    const birthPlaces = await Promise.all(
      claims.P19?.map(async (claim: WikiDataClaim) => {
        return {
          id: claim?.mainsnak?.datavalue?.value?.id ?? null,
          rank: claim.rank,
          label: await getWikidataLabel(claim?.mainsnak?.datavalue?.value?.id ?? null),
        };
      }) ?? []
    );

    birthPlaces.forEach(async (birthPlace) => {
      if (birthPlace.id) {
        await addCity(birthPlace.id);
      }
    });

    // burial place :P119
    const deathPlaces = await Promise.all(
      claims.P20?.map(async (claim: WikiDataClaim) => {
        return {
          id: claim?.mainsnak?.datavalue?.value?.id ?? null,
          rank: claim.rank,
          label: await getWikidataLabel(claim?.mainsnak?.datavalue?.value?.id ?? null),
        };
      }) ?? []
    );

    deathPlaces.forEach(async (deathPlace) => {
      if (deathPlace.id) {
        await addCity(deathPlace.id);
      }
    });

    const birthDates = await Promise.all(
      claims.P569?.map(async (claim: WikiDataClaim) => {
        return {
          value: parseYear(claim?.mainsnak?.datavalue?.value?.time ?? null),
          rank: claim.rank,
        };
      }) ?? []
    );

    const deathDates = await Promise.all(
      claims.P570?.map(async (claim: WikiDataClaim) => {
        return {
          value: parseYear(claim?.mainsnak?.datavalue?.value?.time ?? null),
          rank: claim.rank,
        };
      }) ?? []
    );

    const occupations = await Promise.all(
      claims.P106?.map(async (claim: WikiDataClaim) => {
        return {
          id: claim?.mainsnak?.datavalue?.value?.id ?? null,
          label: await getWikidataLabel(claim?.mainsnak?.datavalue?.value?.id ?? null),
          rank: claim.rank,
        };
      }) ?? []
    );

    const religion = await getWikidataLabel(
      claims.P140?.[0]?.mainsnak?.datavalue?.value?.id ?? null
    );

    return {
      dateOfBirth: birthDates,
      placeOfBirth: birthPlaces,
      dateOfDeath: deathDates,
      placeOfDeath: deathPlaces,
      occupations: occupations.map((occupation) => occupation.label).filter(Boolean) as string[],
      religion,
      citizenships: citizenships
        .map((citizenship) => citizenship.label)
        .filter(Boolean) as string[],
    };
  } catch (error) {
    console.error(`Error fetching Wikidata for ${wikidataId}:`, (error as Error).message);
    return null;
  }
}

// Helper function to fetch location information from Wikidata
async function fetchLocationInfo(
  wikidataId: string,
  placeName: string
): Promise<InputLocation | null> {
  if (!wikidataId) return null;

  try {
    const response = await axios.get(`https://www.wikidata.org/w/api.php`, {
      params: {
        action: 'wbgetentities',
        ids: wikidataId,
        format: 'json',
        languages: 'en',
        props: 'claims|labels',
      },
    });

    const entity = response.data.entities[wikidataId] as WikiDataEntity;

    // Get IDs from claims
    const placeTypeId = entity.claims.P31?.[0]?.mainsnak?.datavalue?.value?.id;

    let cityName = placeName.split(',')[0];

    // handle exceptions
    if (cityName === 'Escorial') {
      cityName = 'San Lorenzo de El Escorial';
    }

    let placeId = await searchCityId(cityName);

    if (!placeId) {
      placeId =
        entity.claims.P159?.[0]?.mainsnak?.datavalue?.value?.id ||
        entity.claims.P131?.[0]?.mainsnak?.datavalue?.value?.id ||
        entity.claims.P276?.[0]?.mainsnak?.datavalue?.value?.id ||
        null;
    }

    if (placeId) {
      await addCity(placeId);
    }

    const cityId = cities.find((city) => city.placeId === placeId)?.id || null;

    // Fetch labels for place type and city
    const placeType = placeTypeId ? await getWikidataLabel(placeTypeId) : null;

    return {
      nativeLabel: entity.labels?.en?.value || null,
      placeType,
      cityId,
      id: parseInt(wikidataId),
      wikidataId: wikidataId,
    };
  } catch (error) {
    console.error(`Error fetching location data for ${wikidataId}:`, (error as Error).message);
    return null;
  }
}

const sortRank = <T extends { rank: string }>(array: T[] | undefined): T[] => {
  // if rank is "preferred", move it before normal
  if (!array || array.length === 0) return [];

  return array.sort((a, b) => {
    if (a.rank === 'preferred') return -1;
    if (b.rank === 'preferred') return 1;
    return 0;
  });
};

async function processData(): Promise<void> {
  try {
    // Read the raw TSV file
    const rawData = fs.readFileSync(path.join(__dirname, 'raw.tsv'), 'utf-8');

    // Parse TSV data with tab delimiter and relaxed quote handling
    const records: Record[] = await new Promise((resolve, reject) => {
      parse(
        rawData,
        {
          columns: true,
          delimiter: '\t',
          // from_line: 40,
          // to_line: 60,
          quote: false, // Disable quote processing
          relaxColumnCount: true, // Allow varying number of columns
        },
        ((err, records) => {
          if (err) reject(err);
          else resolve(records as Record[]);
        }) as ParseCallback<Record>
      );
    });

    const recordsToImport = records.filter((record) => record.IsExported === 'TRUE');

    // Process authors
    const authorsMap = new Map<string, InputAuthor>();
    const locationsMap = new Map<string, InputLocation>();
    const texts: InputText[] = [];

    // Process each record
    for (const record of recordsToImport) {
      // Skip empty rows
      if (!record.Author) continue;

      // Process authors
      if (!authorsMap.has(record.Author)) {
        const wikidataId = record['Author.Wikidata'] || '';

        const authorInfo: WikidataInfo =
          wikidataId && wikidataId !== 'none' ? (await fetchWikidataInfo(wikidataId)) || {} : {};

        sortRank(authorInfo?.placeOfBirth);
        sortRank(authorInfo?.placeOfDeath);
        sortRank(authorInfo?.dateOfBirth);
        sortRank(authorInfo?.dateOfDeath);

        const placeOfBirth: number[] = [];
        if (authorInfo?.placeOfBirth) {
          authorInfo.placeOfBirth.forEach((place) => {
            if (place.id) {
              const city = cities.find((city) => city.placeId === place.id);
              if (city?.id) placeOfBirth.push(city.id);
            }
          });
        }

        const placeOfDeath: number[] = [];
        if (authorInfo?.placeOfDeath) {
          authorInfo.placeOfDeath.forEach((place) => {
            if (place.id) {
              const city = cities.find((city) => city.placeId === place.id);
              if (city?.id) placeOfDeath.push(city.id);
            }
          });
        }

        const dateOfBirth: number[] = [];
        if (authorInfo?.dateOfBirth) {
          authorInfo.dateOfBirth.forEach((date) => {
            if (date.value !== null) dateOfBirth.push(date.value);
          });
        }

        const dateOfDeath: number[] = [];
        if (authorInfo?.dateOfDeath) {
          authorInfo.dateOfDeath.forEach((date) => {
            if (date.value !== null) dateOfDeath.push(date.value);
          });
        }

        authorsMap.set(record.Author, {
          id: authorsMap.size + 1,
          name: record.Author,
          alternativeName: record['Alternative.Name'] || '',
          wikidataId: wikidataId || '',
          placeOfBirth,
          placeOfDeath,
          dateOfBirth,
          dateOfDeath,
          occupations: authorInfo?.occupations || [],
          religion: authorInfo?.religion || '',
          citizenships: authorInfo?.citizenships || [],
        });
      }

      // Process locations
      if (record['WikiData'] && !locationsMap.has(record['WikiData'])) {
        const wikidataId = record['WikiData'] || '';
        const manuscript = record['Manuscript'] || '';

        const locationInfo =
          wikidataId && wikidataId !== 'none'
            ? await fetchLocationInfo(wikidataId, manuscript)
            : null;

        locationsMap.set(wikidataId || 'undefined', {
          id: locationsMap.size + 1,
          nativeLabel: locationInfo?.nativeLabel || null,
          placeType: locationInfo?.placeType || null,
          cityId: locationInfo?.cityId || null,
          wikidataId: locationInfo?.wikidataId || null,
        });
      }

      // Process texts
      if (record['WikiData']) {
        texts.push({
          id: texts.length + 1,
          authorId: authorsMap.get(record.Author)!.id,
          locationId: locationsMap.get(record['WikiData'])!.id,
          date: record.Date_alt || record.Date || '',
          location: record.Manuscript || '',
          universalIncipit: record['Universal.Incipit'] || '',
          sigla: record.Sigla || '',
          title: record.Title || '',
          manuscript: {
            location: record.Manuscript || '',
            catalogue: record['Manuscript.Catalogue'] || '',
            catalogueLink: record['Manuscript.Catalogue.Link'] || '',
            digitalCopy: record['Manuscript.DigitalCopy'] || '',
            facsimile: record['Manuscript.Facsimile'] || '',
          },
          translator: record.Translator || '',
          translatedFrom: record['Translation.From'] || '',
          translatedTo: record['Translation.To'] || '',
          editions: [
            {
              id: 1,
              title: record.Edition1 || '',
              link: record.EditionLink1 || '',
            },
            {
              id: 2,
              title: record.Edition2 || '',
              link: record.EditionLink2 || '',
            },
            {
              id: 3,
              title: record.Edition3 || '',
              link: record.EditionLink3 || '',
            },
            {
              id: 4,
              title: record.Edition4 || '',
              link: record.EditionLink4 || '',
            },
            {
              id: 5,
              title: record.Edition5 || '',
              link: record.EditionLink5 || '',
            },
            {
              id: 6,
              title: record.Edition6 || '',
              link: record.EditionLink6 || '',
            },
            {
              id: 7,
              title: record.Edition7 || '',
              link: record.EditionLink7 || '',
            },
            {
              id: 8,
              title: record.Edition8 || '',
              link: record.EditionLink8 || '',
            },
            {
              id: 9,
              title: record.Edition9 || '',
              link: record.EditionLink9 || '',
            },
            {
              id: 10,
              title: record.Edition10 || '',
              link: record.EditionLink10 || '',
            },
            {
              id: 11,
              title: record.Edition11 || '',
              link: record.EditionLink11 || '',
            },
            {
              id: 12,
              title: record.Edition12 || '',
              link: record.EditionLink12 || '',
            },
          ].filter((edition) => edition.title !== ''),
          literature: record.Literature || '',
        });
      }
    }

    // Write the processed data to JSON files
    fs.writeFileSync(
      path.join(__dirname, 'authors.json'),
      JSON.stringify(Array.from(authorsMap.values()), null, 2)
    );

    fs.writeFileSync(
      path.join(__dirname, 'locations.json'),
      JSON.stringify(Array.from(locationsMap.values()), null, 2)
    );

    fs.writeFileSync(path.join(__dirname, 'texts.json'), JSON.stringify(texts, null, 2));

    fs.writeFileSync(path.join(__dirname, 'cities.json'), JSON.stringify(cities, null, 2));

    console.log('Data processing completed successfully!');
    console.log(`
      Generated:
      - ${authorsMap.size} authors
      - ${locationsMap.size} locations
      - ${texts.length} texts
      - ${cities.length} cities
    `);
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

// Run the processing
processData();
