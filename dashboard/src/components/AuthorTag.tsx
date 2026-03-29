import { getColorClasses } from '@/config/colors';
import { DataAuthor } from '@/types/data';
import { Filter, FilterItemState, FilterType } from '@/types/filter';
import inputCities from '@data/cities.json';
import { IconAuthor } from './icons/Author';
import SelectButton from './SelectButton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/card';
import { Separator } from './ui/separator';
import { CardSection, CardLink, UnknownValue } from './ui/card-section';
interface AuthorTagProps {
  author: DataAuthor;
  onFilterChange: (filter: Filter) => void;
  filter: Filter;
}

const AuthorTag = ({ author, onFilterChange, filter }: AuthorTagProps) => {
  const cityOfBirth = inputCities.find((city) => author.placeOfBirth.includes(city.id));
  const cityOfDeath = inputCities.find((city) => author.placeOfDeath.includes(city.id));

  const colors = getColorClasses(author.state, filter);

  const formatDate = (date: number[]) => {
    if (!date || date.length === 0) return null;
    return date.join('|');
  };

  const isDateUnknown = (date: number[]) => !date || date.length === 0;

  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className={`flex items-center gap-1 cursor-pointer ${colors.text} ${colors.fill}`}>
          <IconAuthor className={`size-5 ${colors.fill} shrink-0`} />
          <div className={`text-sm font-medium truncate ${colors.text} ${colors.fill}`}>
            {author.name}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <IconAuthor className={`size-5 ${colors.fill} shrink-0`} />
              <div className="min-w-0">
                <h4 className={`text-sm font-semibold truncate ${colors.text}`}>{author.name}</h4>
                {author.alternativeName && (
                  <p className="text-sm text-gray-500 truncate">{author.alternativeName}</p>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <SelectButton
                id={author.id}
                type={FilterType.AUTHOR}
                onFilterChange={onFilterChange}
                isSelected={author.state === FilterItemState.SELECTED}
              />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <CardSection label="Birth">
              <div className="flex flex-col gap-1">
                {cityOfBirth?.cityLabel ? (
                  <span className={`font-medium truncate ${colors.text}`}>
                    {cityOfBirth.cityLabel}
                  </span>
                ) : (
                  <UnknownValue
                    textUnknownClass={colors.textUnknown}
                    placeholder="Unknown location"
                  />
                )}
                {isDateUnknown(author.dateOfBirth) ? (
                  <UnknownValue textUnknownClass={colors.textUnknown} placeholder="Unknown date" />
                ) : (
                  <span className="text-sm text-gray-500">{formatDate(author.dateOfBirth)}</span>
                )}
              </div>
            </CardSection>
            <CardSection label="Death">
              <div className="flex flex-col gap-1">
                {cityOfDeath?.cityLabel ? (
                  <span className={`font-medium truncate ${colors.text}`}>
                    {cityOfDeath.cityLabel}
                  </span>
                ) : (
                  <UnknownValue
                    textUnknownClass={colors.textUnknown}
                    placeholder="Unknown location"
                  />
                )}
                {isDateUnknown(author.dateOfDeath) ? (
                  <UnknownValue textUnknownClass={colors.textUnknown} placeholder="Unknown date" />
                ) : (
                  <span className="text-sm text-gray-500">{formatDate(author.dateOfDeath)}</span>
                )}
              </div>
            </CardSection>
          </div>
          {author.occupations && author.occupations.length > 0 && (
            <>
              <Separator />
              <CardSection label="Occupations">
                <div className="flex flex-wrap gap-1">
                  {author.occupations.map((occupation, index) => (
                    <span
                      key={index}
                      className={`text-sm ${colors.bgLight} ${colors.text} px-2 py-0.5 rounded-full`}
                    >
                      {occupation}
                    </span>
                  ))}
                </div>
              </CardSection>
            </>
          )}
          {author.religion && (
            <>
              <Separator />
              <CardSection label="Religion">
                <span className={`text-sm truncate ${colors.text}`}>{author.religion}</span>
              </CardSection>
            </>
          )}
          {author.citizenships && author.citizenships.length > 0 && (
            <>
              <Separator />
              <CardSection label="Citizenships">
                <div className="flex flex-wrap gap-1">
                  {author.citizenships.map((citizenship, index) => (
                    <span
                      key={index}
                      className={`text-sm ${colors.bgLight} ${colors.text} px-2 py-0.5 rounded-full`}
                    >
                      {citizenship}
                    </span>
                  ))}
                </div>
              </CardSection>
            </>
          )}
          {author.wikidataId && (
            <>
              <Separator />
              <CardSection label="Wikidata">
                <CardLink
                  href={`https://www.wikidata.org/wiki/${author.wikidataId}`}
                  colorClasses={colors}
                >
                  View on Wikidata
                </CardLink>
              </CardSection>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default AuthorTag;
