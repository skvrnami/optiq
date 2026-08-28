import { DataDeposition, DataText } from '@/types/data';
import { Filter, FilteredData, FilterItemState, FilterType } from '@/types/filter';
import { InputCity, InputLocation, InputText } from '@/types/input';
import inputAuthors from '@data/authors.json';
import inputCities from '@data/cities.json';
import inputLocations from '@data/locations.json';

const getAuthorNumberTexts = (authorId: number, texts: DataText[]): [number, number] => {
  const allAuthorTexts = texts.filter((text) => text.authorId === authorId);

  const numberTextsInactive = allAuthorTexts.filter(
    (text) => text.state === FilterItemState.INACTIVE
  ).length;
  const numberTextsActive = allAuthorTexts.filter(
    (text) => text.state === FilterItemState.ACTIVE || text.state === FilterItemState.SELECTED
  ).length;
  return [numberTextsInactive, numberTextsActive];
};

const getInstituteNumberTexts = (instituteId: number, texts: DataText[]): [number, number] => {
  const allInstituteTexts = texts.filter((text) => text.locationId === instituteId);
  const numberTextsInactive = allInstituteTexts.filter(
    (text) => text.state === FilterItemState.INACTIVE
  ).length;
  const numberTextsActive = allInstituteTexts.filter(
    (text) => text.state === FilterItemState.ACTIVE || text.state === FilterItemState.SELECTED
  ).length;
  return [numberTextsInactive, numberTextsActive];
};

const constructCityInstitutes = (
  city: InputCity,
  texts: DataText[],
  selectedInstituteId?: number
): DataDeposition => {
  const cityInstitutes: InputLocation[] = inputLocations.filter((l) => l.cityId === city.id);

  const allDepositionTexts = texts.filter((text) =>
    cityInstitutes.some((l) => l.id === text.locationId)
  );

  const noCityTextsInactive = allDepositionTexts.filter(
    (text) => text.state === FilterItemState.INACTIVE
  ).length;

  const noCityTextsActive = allDepositionTexts.filter(
    (text) => text.state === FilterItemState.ACTIVE || text.state === FilterItemState.SELECTED
  ).length;

  return {
    ...city,
    state:
      noCityTextsActive > 0
        ? FilterItemState.ACTIVE
        : noCityTextsInactive > 0
          ? FilterItemState.INACTIVE
          : FilterItemState.INACTIVE,
    institutes: cityInstitutes.map((l) => {
      const isSelected = selectedInstituteId === l.id;
      const [noTextsInactive, noTextsActive] = getInstituteNumberTexts(l.id, allDepositionTexts);
      return {
        ...l,
        state: isSelected
          ? FilterItemState.SELECTED
          : noTextsActive > 0
            ? FilterItemState.ACTIVE
            : FilterItemState.INACTIVE,
        noTextsActive,
        noTextsInactive,
      };
    }),
    noTextsActive: noCityTextsActive,
    noTextsInactive: noCityTextsInactive,
  };
};

export const filterData = (filter: Filter, inputTexts: InputText[]): FilteredData => {
  const filterType = filter.type as FilterType;
  const filterValue = filter.value;

  // Built on demand: only the unfiltered paths below return this, and building
  // it eagerly walked every city and every text on each filter change.
  const buildDefaultData = (): FilteredData => {
    const texts = inputTexts.map((text) => ({
      ...text,
      state: FilterItemState.INACTIVE,
    }));

    return {
      texts: texts as DataText[],
      authors: inputAuthors.map((author) => ({
        ...author,
        state: FilterItemState.INACTIVE,
        noTextsInactive: 0,
        noTextsActive: inputTexts.filter((text) => text.authorId === author.id).length,
      })),
      depositions: inputCities.map((city) => {
        return constructCityInstitutes(city, texts as DataText[]);
      }),
    };
  };

  if (!filterValue || filterType === FilterType.NONE) {
    return buildDefaultData();
  }

  switch (filterType) {
    // Author
    case FilterType.AUTHOR: {
      const texts = inputTexts.map((text) => {
        if (text.authorId === filterValue) {
          return { ...text, state: FilterItemState.ACTIVE };
        } else {
          return { ...text, state: FilterItemState.INACTIVE };
        }
      });
      const authors = inputAuthors.map((author) => {
        const [noTextsInactive, noTextsActive] = getAuthorNumberTexts(
          author.id,
          texts as DataText[]
        );
        if (author.id === filterValue) {
          return {
            ...author,
            state: FilterItemState.SELECTED,
            noTextsInactive,
            noTextsActive,
          };
        } else {
          return {
            ...author,
            state: FilterItemState.INACTIVE,
            noTextsInactive,
            noTextsActive,
          };
        }
      });
      const depositions = inputCities.map((city) => {
        return constructCityInstitutes(city, texts as DataText[]);
      });
      return {
        authors,
        texts: texts as DataText[],
        depositions,
      };
    }

    // Deposition
    case FilterType.DEPOSITION: {
      const texts = inputTexts.map((text) => {
        if (text.locationId === filter.value) {
          return { ...text, state: FilterItemState.ACTIVE };
        } else {
          return { ...text, state: FilterItemState.INACTIVE };
        }
      });
      const depositions = inputCities.map((city) => {
        const institutes = constructCityInstitutes(
          city,
          texts as DataText[],
          Number(filter.value) as number
        );
        return {
          ...institutes,
          state: institutes.institutes.some((l) => l.id === filter.value)
            ? FilterItemState.ACTIVE
            : FilterItemState.INACTIVE,
        };
      });
      const authors = inputAuthors.map((author) => {
        const [noTextsInactive, noTextsActive] = getAuthorNumberTexts(
          author.id,
          texts as DataText[]
        );
        return {
          ...author,
          noTextsActive,
          noTextsInactive,
          state: noTextsActive > 0 ? FilterItemState.ACTIVE : FilterItemState.INACTIVE,
        };
      });

      return {
        authors,
        texts: texts as DataText[],
        depositions,
      };
    }

    // Sigla
    case FilterType.SIGLA: {
      const texts = inputTexts.map((text) => {
        // Exact, not a substring test: 546 pairs of sigla in this corpus have
        // one contained in the other, so `includes` would make "10" match 100,
        // 101, 102/A and dozens more.
        if (text.sigla === filter.value) {
          return { ...text, state: FilterItemState.ACTIVE };
        } else {
          return { ...text, state: FilterItemState.INACTIVE };
        }
      });
      const authors = inputAuthors.map((author) => {
        const [noTextsInactive, noTextsActive] = getAuthorNumberTexts(
          author.id,
          texts as DataText[]
        );
        return {
          ...author,
          state: noTextsActive > 0 ? FilterItemState.ACTIVE : FilterItemState.INACTIVE,
          noTextsInactive,
          noTextsActive,
        };
      });
      const depositions = inputCities.map((city) => {
        return constructCityInstitutes(city, texts as DataText[]);
      });

      return {
        authors,
        texts: texts as DataText[],
        depositions,
      };
    }

    default:
      return buildDefaultData();
  }
};
