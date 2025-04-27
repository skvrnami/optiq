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
    <Badge variant="secondary" className={`${colors.bgLight} ${colors.text}`}>
      {sigla}
    </Badge>
  );
};

export default SiglaTag;
