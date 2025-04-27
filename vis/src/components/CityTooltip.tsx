import { getColorClasses } from '@/config/colors';
import { DataDeposition } from '@/types/data';
import { Filter, FilterItemState, FilterType } from '@/types/filter';
import 'leaflet/dist/leaflet.css';
import { Popup } from 'react-leaflet';
import { IconCity } from './icons/City';
import { IconDeposition } from './icons/Deposition';
import SelectButton from './SelectButton';
import { Separator } from './ui/separator';

interface CityTooltipProps {
  city: DataDeposition;
  onFilterChange: (filter: Filter) => void;
  filter: Filter;
}

export const CityTooltip = ({ city, onFilterChange, filter }: CityTooltipProps) => {
  if (!city) return null;

  const colors = getColorClasses(city.state, filter);

  const isSomethingSelected = city.institutes.some(
    (institute) => institute.state === FilterItemState.INACTIVE
  );

  return (
    <Popup className="w-96">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <IconCity className={`size-5 ${colors.fill} shrink-0`} />
            <div className="min-w-0">
              <h4 className={`text-sm font-semibold truncate ${colors.text}`}>{city.cityLabel}</h4>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-500">Institutes</span>
          <div className="flex flex-col gap-2">
            {city.institutes.map((institute) => {
              const locationColors = getColorClasses(institute.state, filter);
              return (
                <div key={institute.id} className="flex items-start justify-between gap-2 w-full">
                  <div className="flex items-start gap-2 min-w-0">
                    <IconDeposition className={`size-4 ${locationColors.fill} shrink-0`} />
                    <div className="min-w-0 ">
                      <div className={`text-sm font-medium truncate ${locationColors.text}`}>
                        {institute.nativeLabel}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isSomethingSelected
                          ? `${institute.noTextsActive}/${
                              institute.noTextsInactive + institute.noTextsActive
                            } texts`
                          : `${institute.noTextsActive} texts`}
                      </div>
                    </div>
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
              );
            })}
          </div>
        </div>
      </div>
    </Popup>
  );
};
