import { Filter, FilterType } from '@/types/filter';
import { Button } from './ui/button';
import { colors } from '@/config/colors';

interface SelectButtonProps {
  id: number;
  type: FilterType;
  onFilterChange: (filter: Filter) => void;
  className?: string;
  isSelected?: boolean;
}

const SelectButton = ({ id, type, onFilterChange, className, isSelected }: SelectButtonProps) => {
  const handleClick = () => {
    if (isSelected) {
      onFilterChange({ type: FilterType.NONE, value: undefined });
    } else {
      onFilterChange({ type, value: id });
    }
  };

  return (
    <Button
      variant={isSelected ? 'default' : 'ghost'}
      size="sm"
      onClick={handleClick}
      className={`
        ${
          isSelected
            ? `text-white ${colors.primary.bg} ${colors.primary.bgHover} hover:shadow-md transition-shadow`
            : `${colors.primary.text} ${colors.primary.textHover} hover:${colors.primary.bgLight} transition-colors`
        }
        ${className}
        min-w-[60px]
        font-medium
        text-sm
        px-3
        py-1
        rounded-md
        transition-all
        duration-200
        ease-in-out
      `}
    >
      {isSelected ? 'Unselect' : 'Select'}
    </Button>
  );
};

export default SelectButton;
