import authors from '@data/authors.json';
import { useMemo } from 'react';
import { getColorClasses } from '@/config/colors';
import { FilterItemState, Filter } from '@/types/filter';

interface LifeLineProps {
  authorId: number;
  width: number;
  height: number;
  valueToX: (value: number) => number;
  state?: FilterItemState;
  filter: Filter;
}

const LifeLine = ({
  authorId,
  width,
  height,
  valueToX,
  state = FilterItemState.INACTIVE,
  filter,
}: LifeLineProps) => {
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
  const lifeLineH = height / 2;

  if (birthX > width || deathX > width) {
    console.log(author?.name, births, birthX, deaths, deathX);
  }

  const isInLeftPart = birthX < width / 2;

  const leftStartX = birthX;

  const isYearsUnknown = isBirthUnknown && isDeathUnknown;

  const leftTextX = useMemo<number>(() => {
    if (isYearsUnknown) {
      return width / 2;
    }
    return isInLeftPart ? birthX + lifeLineW : birthX;
  }, [isYearsUnknown, isInLeftPart, birthX, lifeLineW, width]);

  const colors = getColorClasses(state, filter);

  return (
    <div
      className="w-full h-full relative inset-0"
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
        style={{ width: lifeLineW, height: lifeLineH, left: leftStartX, top: 7 }}
        className={`absolute rounded-md bg-gradient-to-r ${
          !isBirthUnknown ? colors.bg : 'from-transparent'
        } ${!isDeathUnknown ? colors.bg : 'to-transparent'}`}
      ></div>
      <div
        style={{
          left: leftTextX,
          transform: isInLeftPart ? 'translateX(0)' : 'translateX(-100%)',
          top: 7,
        }}
        className={`
            absolute 
            top-0 
            flex flex-row 
            items-center gap-x-1 pr-1
            text-xs font-medium ${colors.text}
          `}
      >
        {isYearsUnknown ? (
          <div className="w-7 text-center font-light">unknown</div>
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
