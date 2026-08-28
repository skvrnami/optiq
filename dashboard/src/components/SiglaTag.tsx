import { badgeVariants } from './ui/badge';
import { getColorClasses } from '@/config/colors';
import { Filter, FilterItemState, FilterType } from '@/types/filter';
import { cn } from '@/utils/utils';

interface SiglaTagProps {
  sigla: string;
  state?: FilterItemState;
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

/**
 * A sigla, and the control that filters by it.
 *
 * Unlike an author or a deposition there is no detail to show behind a sigla,
 * so it filters on a single click rather than through a card. It renders as a
 * button carrying the badge's own styling rather than a badge inside a button,
 * because a div is not valid content for a button.
 */
const SiglaTag = ({
  sigla,
  state = FilterItemState.INACTIVE,
  filter,
  onFilterChange,
}: SiglaTagProps) => {
  const isSelected = filter.type === FilterType.SIGLA && filter.value === sigla;
  const colors = getColorClasses(isSelected ? FilterItemState.SELECTED : state, filter);

  const handleClick = () => {
    onFilterChange(
      isSelected
        ? { type: FilterType.NONE, value: undefined }
        : { type: FilterType.SIGLA, value: sigla }
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSelected}
      title={isSelected ? `Clear the ${sigla} filter` : `Show only texts with sigla ${sigla}`}
      className={cn(
        badgeVariants({ variant: 'secondary' }),
        'cursor-pointer px-1 py-0 text-sm tabular-nums',
        'focus-visible:ring-ring focus-visible:ring-[3px]',
        colors.bgMiddle,
        colors.text,
        colors.bgMiddleHover
      )}
    >
      {sigla}
    </button>
  );
};

export default SiglaTag;
