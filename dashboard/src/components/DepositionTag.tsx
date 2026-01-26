import { getColorClasses } from '@/config/colors';
import { DataInstitute } from '@/types/data';
import { Filter, FilterItemState, FilterType } from '@/types/filter';
import inputCities from '@data/cities.json';
import { IconDeposition } from './icons/Deposition';
import SelectButton from './SelectButton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/card';
import { Separator } from './ui/separator';
import { CardSection, CardLink, UnknownValue } from './ui/card-section';
interface DepositionTagProps {
  institute: DataInstitute;
  onFilterChange: (filter: Filter) => void;
  filter: Filter;
}

const DepositionTag = ({ institute, onFilterChange, filter }: DepositionTagProps) => {
  const city = inputCities.find((city) => city.id === institute.cityId);
  const colors = getColorClasses(institute.state, filter);

  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className={`flex items-center gap-1 cursor-pointer ${colors.text} ${colors.fill}`}>
          <div className="min-w-6 size-6">
            <IconDeposition className="size-6" />
          </div>
          <div className={`text-sm font-medium truncate ${colors.text} ${colors.fill}`}>
            {institute.nativeLabel}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <IconDeposition className={`size-5 ${colors.fill} shrink-0`} />
              <h4 className={`text-sm font-semibold truncate ${colors.text}`}>
                {institute.nativeLabel}
              </h4>
            </div>
            <div className="shrink-0">
              <SelectButton
                id={institute.id}
                type={FilterType.DEPOSITION}
                onFilterChange={onFilterChange}
                isSelected={institute.state === FilterItemState.SELECTED}
              />
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 text-sm">
            <CardSection label="Type">
              {institute.placeType ? (
                <span className={`font-medium truncate ${colors.text}`}>
                  {institute.placeType}
                </span>
              ) : (
                <UnknownValue textUnknownClass={colors.textUnknown} />
              )}
            </CardSection>
            <CardSection label="City">
              {city?.cityLabel ? (
                <span className={`font-medium truncate ${colors.text}`}>{city.cityLabel}</span>
              ) : (
                <UnknownValue textUnknownClass={colors.textUnknown} />
              )}
            </CardSection>
          </div>
          {institute.wikidataId && (
            <>
              <Separator />
              <CardSection label="Wikidata">
                <CardLink
                  href={`https://www.wikidata.org/wiki/${institute.wikidataId}`}
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

export default DepositionTag;
