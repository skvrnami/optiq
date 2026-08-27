import { getColorClasses } from '@/config/colors';
import { Filter, FilterItemState } from '@/types/filter';
import { useScreenSize } from '@/utils/useScreenSize';
import authors from '@data/authors.json';
import { useMemo } from 'react';

interface LifeLineProps {
  authorId: number;
  width: number;
  valueToX: (value: number) => number;
  state?: FilterItemState;
  filter: Filter;
}

const LifeLine = ({
  authorId,
  width,
  valueToX,
  state = FilterItemState.INACTIVE,
  filter,
}: LifeLineProps) => {
  const { screenType } = useScreenSize();

  // Row height and the bar drawn inside it. Taken from screenType rather than
  // re-derived from the width: the hook puts the desktop boundary at >= 1024,
  // and the copy here used > 1024, so a 1024px window was desktop everywhere
  // else in the app and fell into the gap between these branches here.
  const { height, lifeLineH } = useMemo(() => {
    if (screenType === 'mobile') return { height: 16, lifeLineH: 12 };
    if (screenType === 'tablet') return { height: 20, lifeLineH: 16 };
    return { height: 24, lifeLineH: 20 };
  }, [screenType]);

  const topPadding = useMemo(() => {
    return (height - lifeLineH) / 2;
  }, [lifeLineH, height]);

  const author = authors.find((author) => author.id === authorId);
  const births = author?.dateOfBirth ?? [];
  const deaths = author?.dateOfDeath ?? [];

  const mostProbableBirth = births[0];
  const mostProbableDeath = deaths[0];

  let birthX: number = valueToX(mostProbableBirth) || 0;
  let deathX: number = valueToX(mostProbableDeath) || 0;

  const isBirthUnknown = !birthX || births.length === 0;
  const isDeathUnknown = !deathX || deaths.length === 0;

  const defaultWidth = valueToX(100) - valueToX(0);

  // if birthX is not assigned, set it to the default width
  if (isBirthUnknown) {
    birthX = deathX - defaultWidth;
  }

  // if deathX is not assigned, set it to the default width
  if (isDeathUnknown) {
    deathX = birthX + defaultWidth;
  }

  const lifeLineW = deathX - birthX || 0;

  const isInLeftPart = birthX < width / 2;

  const leftStartX = birthX;

  const isYearsUnknown = isBirthUnknown && isDeathUnknown;

  const leftTextX = useMemo<number>(() => {
    if (isYearsUnknown) {
      return width / 2;
    }
    return isInLeftPart ? birthX + lifeLineW : birthX;
  }, [isYearsUnknown, isInLeftPart, birthX, lifeLineW, width]);

  const colorClasses = getColorClasses(state, filter);

  return (
    <div
      className={`w-full h-full relative inset-0 ${
        isYearsUnknown
          ? `${colorClasses.bgLightUnknown} ${colorClasses.bgLightHover} rounded-md`
          : ''
      }`}
      style={{
        width: width,
        height: height,
        left: 0,
        top: 0,
      }}
    >
      {/* AXES */}
      <div
        className="absolute top-0 h-full border-l border-gray-300 border-dashed"
        style={{ left: valueToX(0) }}
      ></div>
      <div
        className="absolute top-0 h-full border-l border-gray-300 border-dashed"
        style={{ left: valueToX(500) }}
      ></div>
      <div
        className="absolute top-0 h-full border-l border-gray-300 border-dashed"
        style={{ left: valueToX(1000) }}
      ></div>
      <div
        className="absolute top-0 h-full border-l border-gray-300 border-dashed"
        style={{ left: valueToX(1500) }}
      ></div>

      <div
        style={{
          width: lifeLineW,
          height: lifeLineH,
          left: leftStartX,
          top: topPadding,
        }}
        className={`absolute rounded-md bg-linear-to-r ${
          !isBirthUnknown ? colorClasses.bg : 'from-transparent'
        } ${!isDeathUnknown ? colorClasses.bg : 'to-transparent'}`}
      ></div>
      <div
        style={{
          left: isYearsUnknown ? 0 : leftTextX,
          transform: isInLeftPart ? 'translateX(0)' : 'translateX(-100%)',
          top: topPadding + 1,
          width: isYearsUnknown ? width : undefined,
        }}
        className={`
            absolute
            top-0 
            flex flex-row 
            items-center gap-x-1 pr-1
            text-xs font-medium ${colorClasses.text}
          `}
      >
        {isYearsUnknown ? (
          <div
            className={`w-full h-full text-center justify-center items-center font-light italic ${colorClasses.textUnknown}`}
          >
            unknown
          </div>
        ) : (
          <>
            <div className="w-7 text-center">{mostProbableBirth ?? '?'}</div>
            <div className="w-3 text-center">→</div>
            <div className="w-7 text-center">{mostProbableDeath ?? '?'}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default LifeLine;
