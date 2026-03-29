import { Badge } from './ui/badge';
import { getColorClasses } from '@/config/colors';
import { Filter, FilterItemState } from '@/types/filter';

interface SiglaTagProps {
  sigla: string;
  state?: FilterItemState;
  filter: Filter;
}

const SiglaTag = ({ sigla, state = FilterItemState.INACTIVE, filter }: SiglaTagProps) => {
  const colors = getColorClasses(state, filter);
  return (
    <Badge
      variant="secondary"
      className={`text-sm px-1 py-0 ${colors.bgMiddle} ${colors.text} ${colors.bgMiddleHover}`}
    >
      {sigla}
    </Badge>
  );
};

export default SiglaTag;
