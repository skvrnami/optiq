/**
 * This script takes the raw CSV dataset (./raw.tsv) and converts them into 3 JSON datasets - Authors, Manucripts, and Locations
 * 1. Create "authors" table based on the "Author" value; this table has the "Alternative.Name", "Origin" columns and Author.Wikidata column. For each author with "Author.Wikidata" column, parse `https://www.wikidata.org/wiki/${Author.Wikidata}` page and extract information of "date of birth", "place of birth", "place of death", "date of death", "occupation", and "religion or worldview", create new columns for these values
 * 2. Create "locations" table based on the unique "Manuscript.GPS" values in the raw dataset. Visit `https://www.wikidata.org/wiki/${Wikidata}` and extract native label, type of the place and city/town.
 * 3. Each non-empty row in the raw dataset converts to row in the new JSON dataset "texts", with the author and location ids so its possible to join the datasets. From the original dataset, to the new "texts" dataset, copy the columns: "Date", "Manuscript", "Universal.Incipit", "Sigla", "Title" and "Origin"
 */
const fs = require("fs");
const csv = require("csv-parse");
const axios = require("axios");
const path = require("path");

const cities = [];

const geoCodeCity = async (placeId) => {
  let x = false;
  let y = false;
  try {
    const response = await axios.get(`https://www.wikidata.org/w/api.php`, {
      params: {
        action: "wbgetentities",
        ids: placeId,
        format: "json",
        languages: "en",
        props: "claims",
      },
    });

    const entity = response.data.entities[placeId];
    const claims = entity.claims;

    const coordinates = claims.P625?.[0]?.mainsnak?.datavalue?.value;
    if (coordinates) {
      x = coordinates.latitude.toFixed(6);
      y = coordinates.longitude.toFixed(6);
    }
  } catch (error) {
    console.error(`Error fetching coordinates for ${cityId}:`, error.message);
  }
  return [x, y];
};

const searchCityId = async (cityName) => {
  try {
    // Step 1: Search for the entity by name
    const response = await axios.get("https://www.wikidata.org/w/api.php", {
      params: {
        action: "wbsearchentities",
        search: cityName,
        language: "en",
        format: "json",
        type: "item",
        origin: "*",
        limit: 10,
      },
    });

    // Extract potential city IDs
    const candidates = response.data.search.map((item) => item.id);

    for (const id of candidates) {
      // Step 2: Check if the entity is a city or geographical location
      const entityResponse = await axios.get(
        `https://www.wikidata.org/wiki/Special:EntityData/${id}.json`
      );

      const entityData = entityResponse.data.entities[id];
      const claims = entityData.claims;

      if (claims && claims.P31) {
        const instanceOfIds = claims.P31.map(
          (claim) => claim.mainsnak.datavalue?.value?.id
        );

        // Wikidata IDs for cities, towns, and settlements
        const validLocationTypes = [
          "Q515", // City
          "Q3957", // Town
          "Q56061", // Municipality
          "Q532", // Village
          "Q1549591", // Human settlement
          "Q3024240", // Suburb
          "Q5119", // Metropolis
          "Q3184121", // Administrative territorial entity
          "Q123705", // Big city
        ];

        if (instanceOfIds.some((id) => validLocationTypes.includes(id))) {
          return id; // Return the first valid geographical entity
        }
      }
    }
  } catch (error) {
    console.error("Error fetching city ID:", error);
  }

  return null;
};

const addCity = async (placeId) => {
  if (!cities.find((city) => city.placeId === placeId)) {
    const cityName = await getWikidataLabel(placeId);
    const [x, y] = await geoCodeCity(placeId);

    if (cityName && !cities.find((city) => city.placeId === placeId)) {
      cities.push({
        id: cities.length + 1,
        placeId,
        cityLabel: cityName,
        x,
        y,
      });
    }
  }
};

// Helper function to fetch entity label from Wikidata
async function getWikidataLabel(entityId) {
  if (!entityId) return null;

  try {
    const response = await axios.get(`https://www.wikidata.org/w/api.php`, {
      params: {
        action: "wbgetentities",
        ids: entityId,
        format: "json",
        languages: "en",
        props: "labels",
      },
    });

    return response.data.entities[entityId]?.labels?.en?.value || null;
  } catch (error) {
    console.error(`Error fetching label for ${entityId}:`, error.message);
    return null;
  }
}

// return year from date string
// +1193-01-01T00:00:00Z -> 1193
// +1280-00-00T00:00:00Z -> 1280
const parseYear = (date) => {
  if (!date) return null;
  return Number(date.split("-")[0]);
};

// Helper function to fetch Wikidata information
async function fetchWikidataInfo(wikidataId) {
  if (!wikidataId) return null;

  try {
    const response = await axios.get(`https://www.wikidata.org/w/api.php`, {
      params: {
        action: "wbgetentities",
        ids: wikidataId,
        format: "json",
        languages: "en",
        props: "claims|labels",
      },
    });

    const entity = response.data.entities[wikidataId];
    const claims = entity.claims;

    // if (wikidataId === "Q710858") {
    //   console.log(wikidataId, claims);
    // }

    const citizenships = await Promise.all(
      claims.P27?.map(async (claim) => {
        return {
          id: claim?.mainsnak?.datavalue?.value?.id ?? null,
          rank: claim.rank,
          label: await getWikidataLabel(
            claim?.mainsnak?.datavalue?.value?.id ?? null
          ),
        };
      }) ?? []
    );

    const birthPlaces = await Promise.all(
      claims.P19?.map(async (claim) => {
        return {
          id: claim?.mainsnak?.datavalue?.value?.id ?? null,
          rank: claim.rank,
          label: await getWikidataLabel(
            claim?.mainsnak?.datavalue?.value?.id ?? null
          ),
        };
      }) ?? []
    );

    birthPlaces.forEach(async (birthPlace) => {
      if (birthPlace.id) {
        await addCity(birthPlace.id);
      }
    });

    const deathPlaces = await Promise.all(
      claims.P20?.map(async (claim) => {
        return {
          id: claim?.mainsnak?.datavalue?.value?.id ?? null,
          rank: claim.rank,
          label: await getWikidataLabel(
            claim?.mainsnak?.datavalue?.value?.id ?? null
          ),
        };
      }) ?? []
    );

    deathPlaces.forEach(async (deathPlace) => {
      if (deathPlace.id) {
        await addCity(deathPlace.id);
      }
    });

    const birthDates = await Promise.all(
      claims.P569?.map(async (claim) => {
        return {
          value: parseYear(claim?.mainsnak?.datavalue?.value?.time ?? null),
          rank: claim.rank,
        };
      }) ?? []
    );

    const deathDates = await Promise.all(
      claims.P570?.map(async (claim) => {
        return {
          value: parseYear(claim?.mainsnak?.datavalue?.value?.time ?? null),
          rank: claim.rank,
        };
      }) ?? []
    );

    const occupations = await Promise.all(
      claims.P106?.map(async (claim) => {
        return {
          id: claim?.mainsnak?.datavalue?.value?.id ?? null,
          label: await getWikidataLabel(
            claim?.mainsnak?.datavalue?.value?.id ?? null
          ),
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
      occupations: occupations.map((occupation) => occupation.label),
      religion: religion,
      citizenships: citizenships.map((citizenship) => citizenship.label),
    };
  } catch (error) {
    console.error(`Error fetching Wikidata for ${wikidataId}:`, error.message);
    return null;
  }
}

// Helper function to fetch location information from Wikidata
async function fetchLocationInfo(wikidataId, placeName) {
  if (!wikidataId) return null;

  try {
    const response = await axios.get(`https://www.wikidata.org/w/api.php`, {
      params: {
        action: "wbgetentities",
        ids: wikidataId,
        format: "json",
        languages: "en",
        props: "claims|labels",
      },
    });

    const entity = response.data.entities[wikidataId];

    // Get IDs from claims
    const placeTypeId = entity.claims.P31?.[0]?.mainsnak?.datavalue?.value?.id;

    let cityName = placeName.split(",")[0];

    // handle exceptions
    if (cityName === "Escorial") {
      cityName = "San Lorenzo de El Escorial";
    }

    const placeId = await searchCityId(cityName);

    if (!placeId) {
      placeId =
        entity.claims.P159?.[0]?.mainsnak?.datavalue?.value?.id ||
        entity.claims.P131?.[0]?.mainsnak?.datavalue?.value?.id ||
        entity.claims.P276?.[0]?.mainsnak?.datavalue?.value?.id;
    }

    if (placeId) {
      await addCity(placeId);
    } else {
      // console.log(
      //   `City not found for ${placeName}`,
      //   entity.claims.P276,
      //   entity.claims.P131,
      //   entity.claims.P159
      // );
    }

    const cityId = cities.find((city) => city.placeId === placeId)?.id;

    // Fetch labels for place type and city
    const [placeType] = await Promise.all([getWikidataLabel(placeTypeId)]);
    console.log(`City found for ${placeName}`);

    return {
      nativeLabel: entity.labels?.en?.value,
      placeType: placeType,
      cityId: cityId,
    };
  } catch (error) {
    console.error(
      `Error fetching location data for ${wikidataId}:`,
      error.message
    );
    return null;
  }
}

const sortRank = (array) => {
  // if rank is "preferred", move it before normal

  if (!array || array.length === 0) return [];

  return array.sort((a, b) => {
    if (a.rank === "preferred") return -1;
    if (b.rank === "preferred") return 1;
    return 0;
  });
};

async function processData() {
  try {
    // Read the raw TSV file
    const rawData = fs.readFileSync(path.join(__dirname, "raw.tsv"), "utf-8");

    // Parse TSV data with tab delimiter and relaxed quote handling
    const records = await new Promise((resolve, reject) => {
      csv.parse(
        rawData,
        {
          columns: true,
          delimiter: "\t",
          // from_line: 40,
          // to_line: 60,
          // toLine: 60,
          quote: false, // Disable quote processing
          relaxColumnCount: true, // Allow varying number of columns
        },
        (err, records) => {
          if (err) reject(err);
          else resolve(records);
        }
      );
    });

    const recordsToImport = records.filter(
      (record) => record.IsExported === "TRUE"
    );

    // Process authors
    const authorsMap = new Map();
    const locationsMap = new Map();
    const texts = [];

    // Process each record
    for (const record of recordsToImport) {
      // Skip empty rows
      if (!record.Author) continue;

      // Process authors
      if (!authorsMap.has(record.Author)) {
        const wikidataId = record["Author.Wikidata"];

        const authorInfo =
          wikidataId && wikidataId !== "none"
            ? await fetchWikidataInfo(record["Author.Wikidata"])
            : {};

        sortRank(authorInfo?.placeOfBirth);
        sortRank(authorInfo?.placeOfDeath);
        sortRank(authorInfo?.dateOfBirth);
        sortRank(authorInfo?.dateOfDeath);

        if (authorInfo) {
          authorInfo.placeOfBirth =
            authorInfo?.placeOfBirth?.map((place) => {
              const city = cities.find((city) => city.placeId === place.id);
              return city?.id;
            }) ?? [];
          authorInfo.placeOfDeath =
            authorInfo?.placeOfDeath?.map((place) => {
              const city = cities.find((city) => city.placeId === place.id);
              return city?.id;
            }) ?? [];

          authorInfo.dateOfBirth =
            authorInfo?.dateOfBirth?.map((date) => {
              return date.value;
            }) ?? [];
          authorInfo.dateOfDeath =
            authorInfo?.dateOfDeath?.map((date) => {
              return date.value;
            }) ?? [];
        }

        authorsMap.set(record.Author, {
          id: authorsMap.size + 1,
          name: record.Author,
          alternativeName: record["Alternative.Name"],
          wikidataId: record["Author.Wikidata"],
          ...authorInfo,
        });
      }

      // Process locations
      if (
        record["Manuscript.GPS"] &&
        !locationsMap.has(record["Manuscript.GPS"])
      ) {
        const wikidataId = record["WikiData"];

        const locationInfo =
          wikidataId && wikidataId !== "none"
            ? await fetchLocationInfo(record["WikiData"], record["Manuscript"])
            : null;

        const [x, y] = record["Manuscript.GPS"].split(",");
        locationsMap.set(record["Manuscript.GPS"], {
          id: locationsMap.size + 1,
          ...locationInfo,
        });
      }

      // Process texts
      texts.push({
        id: texts.length + 1,
        authorId: authorsMap.get(record.Author).id,
        locationId: record["Manuscript.GPS"]
          ? locationsMap.get(record["Manuscript.GPS"]).id
          : null,
        date: record.Date_alt || record.Date,
        location: record.Manuscript,
        universalIncipit: record["Universal.Incipit"],
        sigla: record.Sigla,
        title: record.Title,
      });
    }

    // Write the processed data to JSON files
    fs.writeFileSync(
      path.join(__dirname, "authors.json"),
      JSON.stringify(Array.from(authorsMap.values()), null, 2)
    );

    fs.writeFileSync(
      path.join(__dirname, "locations.json"),
      JSON.stringify(Array.from(locationsMap.values()), null, 2)
    );

    fs.writeFileSync(
      path.join(__dirname, "texts.json"),
      JSON.stringify(texts, null, 2)
    );

    fs.writeFileSync(
      path.join(__dirname, "cities.json"),
      JSON.stringify(cities, null, 2)
    );

    console.log("Data processing completed successfully!");
    console.log(`
      Generated:
      - ${authorsMap.size} authors
      - ${locationsMap.size} locations
      - ${texts.length} texts
      - ${cities.length} cities
    `);
  } catch (error) {
    console.error("Error processing data:", error);
  }
}

// Run the processing
processData();
