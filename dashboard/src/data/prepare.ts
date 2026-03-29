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

// Create axios instance with proper User-Agent header for Wikidata API
// Wikidata requires a User-Agent to identify the application
const wikidataApi = axios.create({
  headers: {
    'User-Agent': 'OptiqDashboard/1.0 (https://github.com/optiq; contact@optiq.dev) axios',
  },
});

const cities: InputCity[] = [];

// Geographic boundaries for European/Mediterranean region (to filter out American cities with same names)
const GEO_BOUNDS = {
  minLng: -20,
  maxLng: 60,
  minLat: 6,
  maxLat: 63,
};

interface KnownCoordinates {
  lat: number;
  lng: number;
}

// Pre-built dictionary of city names to coordinates from raw data
const knownCityCoordinates = new Map<string, KnownCoordinates>();

/**
 * Extracts the city name from a Manuscript string (e.g., "Venice, Biblioteca Marciana, MS 123" -> "Venice")
 */
const extractCityName = (manuscript: string): string | null => {
  if (!manuscript) return null;
  const cityName = manuscript.split(',')[0].trim();
  return cityName || null;
};

/**
 * Parses GPS coordinates string from raw data (e.g., "45.433333, 12.316667" -> { lat: 45.433333, lng: 12.316667 })
 */
const parseGpsString = (gpsString: string): KnownCoordinates | null => {
  if (!gpsString || gpsString.trim() === '') return null;

  const parts = gpsString.split(',').map((p) => p.trim());
  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  if (isNaN(lat) || isNaN(lng)) return null;

  return { lat, lng };
};

/**
 * Checks if coordinates fall within the European/Mediterranean geographic bounds
 */
const isWithinGeoBounds = (lat: number, lng: number): boolean => {
  return (
    lng >= GEO_BOUNDS.minLng &&
    lng <= GEO_BOUNDS.maxLng &&
    lat >= GEO_BOUNDS.minLat &&
    lat <= GEO_BOUNDS.maxLat
  );
};

/**
 * Builds the known coordinates dictionary from raw TSV records.
 * Maps normalized city names to their GPS coordinates.
 */
const buildKnownCoordinatesDict = (records: Record[]): void => {
  for (const record of records) {
    const cityName = extractCityName(record.Manuscript);
    const gps = parseGpsString(record['Manuscript.GPS']);

    if (cityName && gps && !knownCityCoordinates.has(cityName.toLowerCase())) {
      knownCityCoordinates.set(cityName.toLowerCase(), gps);
    }
  }
  console.log(`Built known coordinates dictionary with ${knownCityCoordinates.size} cities`);
};

/**
 * Looks up coordinates for a city name from the pre-built dictionary
 */
const getKnownCoordinates = (cityName: string): KnownCoordinates | null => {
  return knownCityCoordinates.get(cityName.toLowerCase()) || null;
};

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
  precision?: number;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

// WikiData precision levels for dates
// 7 = century, 8 = decade, 9 = year, 10 = month, 11 = day
const WIKIDATA_YEAR_PRECISION = 9;

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

/**
 * Fetches coordinates for a Wikidata place ID from the API
 */
const fetchCoordinatesFromWikidata = async (
  placeId: string
): Promise<[number | false, number | false]> => {
  try {
    const response = await wikidataApi.get(`https://www.wikidata.org/w/api.php`, {
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
        return [parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))];
      }
    }
  } catch (error) {
    console.error(`Error fetching coordinates for ${placeId}:`, (error as Error).message);
  }
  return [false, false];
};

/**
 * Gets coordinates for a city, first checking the known coordinates dictionary,
 * then falling back to Wikidata API
 */
const geocodeCity = async (
  placeId: string,
  cityName?: string
): Promise<[number | false, number | false]> => {
  // First, check if we have known coordinates for this city
  if (cityName) {
    const known = getKnownCoordinates(cityName);
    if (known) {
      return [parseFloat(known.lat.toFixed(6)), parseFloat(known.lng.toFixed(6))];
    }
  }

  // Fall back to Wikidata API
  return fetchCoordinatesFromWikidata(placeId);
};

// Wikidata IDs for cities, towns, and settlements
const VALID_LOCATION_TYPES = [
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

/**
 * Checks if a Wikidata entity is a valid location type (city, town, etc.)
 */
const isValidLocationType = (claims: WikiDataClaims): boolean => {
  if (!claims?.P31) return false;

  const instanceOfIds = claims.P31.map(
    (claim: WikiDataClaim) => claim.mainsnak.datavalue?.value?.id
  ).filter(Boolean) as string[];

  return instanceOfIds.some((id: string) => VALID_LOCATION_TYPES.includes(id));
};

/**
 * Extracts coordinates from Wikidata claims
 */
const extractCoordinatesFromClaims = (
  claims: WikiDataClaims
): { lat: number; lng: number } | null => {
  const coordinates = claims.P625?.[0]?.mainsnak?.datavalue?.value;
  if (coordinates && typeof coordinates.latitude === 'number' && typeof coordinates.longitude === 'number') {
    return { lat: coordinates.latitude, lng: coordinates.longitude };
  }
  return null;
};

/**
 * Fetches entity data from Wikidata API (avoids 403 errors from Special:EntityData)
 */
const fetchEntityData = async (entityId: string): Promise<WikiDataEntity | null> => {
  try {
    const response = await wikidataApi.get('https://www.wikidata.org/w/api.php', {
      params: {
        action: 'wbgetentities',
        ids: entityId,
        format: 'json',
        languages: 'en',
        props: 'claims|labels',
      },
    });
    return response.data.entities[entityId] as WikiDataEntity;
  } catch (error) {
    console.error(`Error fetching entity ${entityId}:`, (error as Error).message);
    return null;
  }
};

/**
 * Searches for a city's Wikidata ID, filtering results to only include
 * places within the European/Mediterranean geographic bounds
 */
const searchCityId = async (cityName: string): Promise<string | null> => {
  // First check if we have known coordinates for this city - if so, we can verify bounds
  const knownCoords = getKnownCoordinates(cityName);
  if (knownCoords && !isWithinGeoBounds(knownCoords.lat, knownCoords.lng)) {
    console.warn(`City "${cityName}" coordinates are outside geographic bounds, skipping`);
    return null;
  }

  try {
    const response = await wikidataApi.get('https://www.wikidata.org/w/api.php', {
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

    const candidates: string[] = response.data.search.map((item: { id: string }) => item.id);

    for (const id of candidates) {
      const entityData = await fetchEntityData(id);
      if (!entityData) continue;

      const claims = entityData.claims;

      if (!isValidLocationType(claims)) continue;

      // Check if the location is within geographic bounds
      const coords = extractCoordinatesFromClaims(claims);
      if (coords) {
        if (!isWithinGeoBounds(coords.lat, coords.lng)) {
          console.log(
            `Skipping "${cityName}" candidate ${id} - outside bounds (${coords.lat}, ${coords.lng})`
          );
          continue;
        }
      }

      // If we have known coordinates, prefer candidates that match approximately
      if (knownCoords && coords) {
        const latDiff = Math.abs(knownCoords.lat - coords.lat);
        const lngDiff = Math.abs(knownCoords.lng - coords.lng);
        // Allow some tolerance (about 50km)
        if (latDiff > 0.5 || lngDiff > 0.5) {
          console.log(
            `Skipping "${cityName}" candidate ${id} - too far from known coordinates`
          );
          continue;
        }
      }

      return id;
    }
  } catch (error) {
    console.error('Error fetching city ID:', error);
  }

  return null;
};

/**
 * Adds a city to the cities list if not already present.
 * Uses known coordinates if available, otherwise fetches from Wikidata.
 */
const addCity = async (placeId: string): Promise<void> => {
  if (cities.find((city) => city.placeId === placeId)) return;

  const cityName = await getWikidataLabel(placeId);
  if (!cityName) return;

  // Check again after async call to avoid race conditions
  if (cities.find((city) => city.placeId === placeId)) return;

  const [x, y] = await geocodeCity(placeId, cityName);

  cities.push({
    id: cities.length + 1,
    placeId,
    cityLabel: cityName,
    x: x === false ? 0 : x,
    y: y === false ? 0 : y,
  });
};

// Helper function to fetch entity label from Wikidata
async function getWikidataLabel(entityId: string | null): Promise<string | null> {
  if (!entityId) return null;

  try {
    const response = await wikidataApi.get(`https://www.wikidata.org/w/api.php`, {
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

/**
 * Parses a year from WikiData date string, only if precision is year-level or better.
 * WikiData precision: 7=century, 8=decade, 9=year, 10=month, 11=day
 * We only accept precision >= 9 (year or more specific) as accurate enough.
 *
 * @param date - WikiData date string like "+1193-01-01T00:00:00Z"
 * @param precision - WikiData precision level
 * @returns Year number or null if date is missing or precision is too low
 */
const parseYear = (date: string | null, precision?: number): number | null => {
  if (!date) return null;

  // Ignore dates with century or decade precision (not accurate enough)
  if (precision !== undefined && precision < WIKIDATA_YEAR_PRECISION) {
    return null;
  }

  return Number(date.split('-')[0]);
};

// Helper function to fetch Wikidata information
async function fetchWikidataInfo(wikidataId: string): Promise<WikidataInfo | null> {
  if (!wikidataId) return null;

  try {
    const response = await wikidataApi.get(`https://www.wikidata.org/w/api.php`, {
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
        const dateValue = claim?.mainsnak?.datavalue?.value;
        return {
          value: parseYear(dateValue?.time ?? null, dateValue?.precision),
          rank: claim.rank,
        };
      }) ?? []
    );

    const deathDates = await Promise.all(
      claims.P570?.map(async (claim: WikiDataClaim) => {
        const dateValue = claim?.mainsnak?.datavalue?.value;
        return {
          value: parseYear(dateValue?.time ?? null, dateValue?.precision),
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
    const response = await wikidataApi.get(`https://www.wikidata.org/w/api.php`, {
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

    // Build the known coordinates dictionary from raw data BEFORE processing
    // This allows us to use existing GPS data and avoid incorrect Wikidata lookups
    buildKnownCoordinatesDict(records);

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
      // Extract library identifier (e.g., "Bern, Burgerbibliothek" from "Bern, Burgerbibliothek, MS 216")
      const manuscript = record['Manuscript'] || '';
      const libraryKey = manuscript.split(',').slice(0, 2).join(',').trim();
      const wikidataId = record['WikiData'] || '';
      const hasValidWikidata = wikidataId && wikidataId !== 'none';

      // Use WikiData ID as key if valid, otherwise use library name to avoid duplicates
      const locationKey = hasValidWikidata ? wikidataId : `library:${libraryKey}`;

      if (locationKey && !locationsMap.has(locationKey)) {
        // If WikiData is missing but we have a library match with WikiData, try to find it
        let locationInfo = null;
        if (hasValidWikidata) {
          locationInfo = await fetchLocationInfo(wikidataId, manuscript);
        }

        locationsMap.set(locationKey, {
          id: locationsMap.size + 1,
          nativeLabel: locationInfo?.nativeLabel || null,
          placeType: locationInfo?.placeType || null,
          cityId: locationInfo?.cityId || null,
          wikidataId: locationInfo?.wikidataId || null,
        });
      }

      // Process texts
      // Try to find location by WikiData first, then by library name
      let textLocationId: number | null = null;
      if (hasValidWikidata && locationsMap.has(wikidataId)) {
        textLocationId = locationsMap.get(wikidataId)!.id;
      } else if (locationsMap.has(`library:${libraryKey}`)) {
        textLocationId = locationsMap.get(`library:${libraryKey}`)!.id;
      } else {
        // Try to find a location with matching library by scanning existing entries
        for (const [key, loc] of locationsMap.entries()) {
          if (key.startsWith('Q') && loc.nativeLabel?.toLowerCase().includes(libraryKey.split(',')[1]?.trim().toLowerCase() || '')) {
            textLocationId = loc.id;
            break;
          }
        }
      }

      if (textLocationId) {
        texts.push({
          id: texts.length + 1,
          authorId: authorsMap.get(record.Author)!.id,
          locationId: textLocationId,
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
