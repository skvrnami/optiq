# LogiqVIS

- Visual dashboard for exploration of Logiq texts and their authors

## Data

Original data are normalized into 4 datasets exported in a form of JSON list.
The JSON lists are then augmented from external sources, including wikidata. For the wikidata format, a contradicting information items are ranked as "preferred" (recommended) or "normal" (not recommended when an "preferred" information exists).

### Manuscript

Lists all Logiq texts

- authorId: id of the text author
- locationId: a place where the text is deposed
- date: approximate date when the text was written
- universalIncipit: notable start of the text
- sigla: category of the text
- title: name of the namuscript

### Authors

- name:
- alternativeName: any other name, often a name in other languages
- origin: an approximate date
- wikidataId: linked wikidata identifier
- dateOfBirth: wikidata birth dates
- dateOfDeath: wikidata death dates
- placeOfBirth: wikidata birth places, the id correspondeds to the "cityId" attribute in cities.json list
- placeOfDeath: wikidata death places, the id correspondends to the "cityId" attribute in cities.json list
- occupations: a list of jobs, positions and titles of the author; taken from wikidata
- religion: religious affiliation; taken from wikidata; only one string
- citizenships: a list of nationalities; taken from wikidata

## Layout

- The layout consists of two sections - texts and authors

### Texts section

The top part of the the texts section is covered by a table
