import { getColorClasses } from '@/config/colors';
import { DataAuthor } from '@/types/data';
import { Filter, FilterItemState, FilterType } from '@/types/filter';
import inputCities from '@data/cities.json';
import { IconAuthor } from './icons/Author';
import { IconExternalLink } from './icons/ExternalLink';
import SelectButton from './SelectButton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/card';
import { Separator } from './ui/separator';
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
    if (!date || date.length === 0) return 'Unknown';
    return date.join('|');
  };

  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className={`flex items-center gap-1 cursor-pointer ${colors.text} ${colors.fill}`}>
          <div className="min-w-6 size-6">
            <IconAuthor className="size-6" />
          </div>
          <div className={`text-sm font-medium truncate ${colors.text} ${colors.fill}`}>
            {author.name}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <IconAuthor className={`size-5 ${colors.fill} shrink-0`} />
              <div className="min-w-0">
                <h4 className={`text-sm font-semibold truncate ${colors.text}`}>{author.name}</h4>
                {author.alternativeName && (
                  <p className="text-xs text-gray-500 truncate">{author.alternativeName}</p>
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
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray-500">Place of Birth</span>
              <span className={`font-medium truncate ${colors.text}`}>
                {cityOfBirth?.cityLabel || 'Unknown'}
              </span>
              <span className="text-xs text-gray-500">{formatDate(author.dateOfBirth)}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray-500">Place of Death</span>
              <span className={`font-medium truncate ${colors.text}`}>
                {cityOfDeath?.cityLabel || 'Unknown'}
              </span>
              <span className="text-xs text-gray-500">{formatDate(author.dateOfDeath)}</span>
            </div>
          </div>
          {author.occupations && author.occupations.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Occupations</span>
                <div className="flex flex-wrap gap-1">
                  {author.occupations.map((occupation, index) => (
                    <span
                      key={index}
                      className={`text-xs ${colors.bgLight} ${colors.text} px-2 py-0.5 rounded-full`}
                    >
                      {occupation}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
          {author.religion && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Religion</span>
                <span className={`text-sm truncate ${colors.text}`}>{author.religion}</span>
              </div>
            </>
          )}
          {author.citizenships && author.citizenships.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Citizenships</span>
                <div className="flex flex-wrap gap-1">
                  {author.citizenships.map((citizenship, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                    >
                      {citizenship}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
          {author.wikidataId && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Wikidata</span>
                <a
                  href={`https://www.wikidata.org/wiki/${author.wikidataId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${colors.text} ${colors.textHover} flex items-center gap-1`}
                >
                  <span className="text-sm">View on Wikidata</span>
                  <IconExternalLink className="size-4" />
                </a>
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default AuthorTag;
