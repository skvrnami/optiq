import { DataDeposition, DataAuthor, DataText } from './data';

export enum FilterType {
  DEPOSITION = 'deposition',
  SIGLA = 'sigla',
  AUTHOR = 'author',
  // PLACE_BIRTH = "place_birth",
  // PLACE_DEATH = "place_death",
  NONE = 'none',
}

export interface Filter {
  type: FilterType;
  value: number | string | undefined;
}

export enum FilterItemState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SELECTED = 'selected',
}

export interface FilteredData {
  texts: DataText[];
  authors: DataAuthor[];
  depositions: DataDeposition[];
  // deaths: DataDeath[];
  // births: DataBirth[];
}
