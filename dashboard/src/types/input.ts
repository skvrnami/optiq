export interface InputCity {
  id: number;
  placeId: string;
  cityLabel: string;
  x: number;
  y: number;
}

export interface InputLocation {
  id: number;
  nativeLabel: string | null;
  placeType: string | null;
  cityId: number | null;
  wikidataId: string | null;
}

export interface InputAuthor {
  id: number;
  name: string;
  alternativeName: string;
  wikidataId: string;
  placeOfBirth: number[];
  placeOfDeath: number[];
  dateOfBirth: number[];
  dateOfDeath: number[];
  occupations: string[];
  religion: string;
  citizenships: string[];
}

export interface InputTextEdition {
  id: number;
  title: string;
  link: string;
}

export interface InputTextManuscript {
  location: string;
  catalogue: string;
  catalogueLink: string;
  digitalCopy: string;
  facsimile: string;
}

export interface InputText {
  id: number;
  authorId: number;
  locationId: number;
  date: string;
  location: string;
  universalIncipit: string;
  sigla: string;
  title: string;
  manuscript: InputTextManuscript;
  translator: string;
  translatedFrom: string;
  translatedTo: string;
  editions: InputTextEdition[];
  literature: string;
}
