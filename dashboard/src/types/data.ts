/**
 * Data types for the display components
 */

import { FilterItemState } from './filter';
import { InputAuthor, InputCity, InputLocation, InputText } from './input';

export interface DataText extends InputText {
  state: FilterItemState;
}

export interface DataAuthor extends InputAuthor {
  state: FilterItemState;
  noTextsInactive: number;
  noTextsActive: number;
}

export interface DataInstitute extends InputLocation {
  state: FilterItemState;
  noTextsActive: number;
  noTextsInactive: number;
}

export interface DataDeposition extends InputCity {
  noTextsActive: number;
  noTextsInactive: number;
  institutes: DataInstitute[];
  state: FilterItemState;
}
