import { Filter, FilterItemState, FilterType } from '@/types/filter';

export const colors = {
  primary: {
    text: 'text-orange-700',
    textHover: 'text-orange-800',
    textLink: 'text-orange-900',
    bg: 'bg-orange-700',
    bgHover: 'hover:bg-orange-800',
    bgLight: 'bg-orange-100',
    bgLightHover: 'hover:bg-orange-200',
    fill: 'fill-orange-600',
    fillHover: 'fill-orange-700',
    stroke: 'stroke-orange-800',
    border: 'border-orange-700',
    borderHover: 'border-orange-800',
  },
  active: {
    text: 'text-gray-900',
    textHover: 'text-gray-950',
    textLink: 'text-orange-900',
    bg: 'bg-gray-900',
    bgHover: 'hover:bg-gray-950',
    bgLight: 'bg-gray-200',
    bgLightHover: 'hover:bg-gray-300',
    fill: 'fill-orange-500',
    fillHover: 'fill-orange-600',
    border: 'border-gray-900',
    borderHover: 'border-gray-950',
  },
  default: {
    text: 'text-gray-700',
    textHover: 'text-gray-800',
    textLink: 'text-orange-900',
    bg: 'bg-gray-700',
    bgHover: 'hover:bg-gray-800',
    bgLight: 'bg-gray-100',
    bgLightHover: 'hover:bg-gray-200',
    fill: 'fill-gray-700',
    fillHover: 'fill-gray-800',
    border: 'border-gray-700',
    borderHover: 'border-gray-800',
  },
  dimmed: {
    text: 'text-gray-500',
    textHover: 'text-gray-600',
    textLink: 'text-orange-900',
    bg: 'bg-gray-500',
    bgHover: 'hover:bg-gray-600',
    bgLight: 'bg-gray-50',
    bgLightHover: 'hover:bg-gray-100',
    fill: 'fill-gray-500',
    fillHover: 'fill-gray-600',
    border: 'border-gray-500',
    borderHover: 'border-gray-600',
  },
};

export const getColorClasses = (state: FilterItemState, filter: Filter) => {
  // If nothing is selected (filter type is NONE), use default colors
  if (filter.type === FilterType.NONE) {
    return {
      text: colors.default.text,
      textHover: colors.default.textHover,
      textLink: colors.default.textLink,
      bg: colors.default.bg,
      bgHover: colors.default.bgHover,
      bgLight: colors.default.bgLight,
      bgLightHover: colors.default.bgLightHover,
      fill: colors.default.fill,
      fillHover: colors.default.fillHover,
      border: colors.default.border,
      borderHover: colors.default.borderHover,
    };
  }

  switch (state) {
    case FilterItemState.SELECTED:
      return {
        text: colors.primary.text,
        textHover: colors.primary.textHover,
        textLink: colors.primary.textLink,
        bg: colors.primary.bg,
        bgHover: colors.primary.bgHover,
        bgLight: colors.primary.bgLight,
        bgLightHover: colors.primary.bgLightHover,
        fill: colors.primary.fill,
        fillHover: colors.primary.fillHover,
        border: colors.primary.border,
        borderHover: colors.primary.borderHover,
      };
    case FilterItemState.ACTIVE:
      return {
        text: colors.active.text,
        textHover: colors.active.textHover,
        textLink: colors.active.textLink,
        bg: colors.active.bg,
        bgHover: colors.active.bgHover,
        bgLight: colors.active.bgLight,
        bgLightHover: colors.active.bgLightHover,
        fill: colors.active.fill,
        fillHover: colors.active.fillHover,
        border: colors.active.border,
        borderHover: colors.active.borderHover,
      };
    case FilterItemState.INACTIVE:
      return {
        text: colors.dimmed.text,
        textHover: colors.dimmed.textHover,
        textLink: colors.dimmed.textLink,
        bg: colors.dimmed.bg,
        bgHover: colors.dimmed.bgHover,
        bgLight: colors.dimmed.bgLight,
        bgLightHover: colors.dimmed.bgLightHover,
        fill: colors.dimmed.fill,
        fillHover: colors.dimmed.fillHover,
        border: colors.dimmed.border,
        borderHover: colors.dimmed.borderHover,
      };
    default:
      return {
        text: colors.default.text,
        textHover: colors.default.textHover,
        textLink: colors.default.textLink,
        bg: colors.default.bg,
        bgHover: colors.default.bgHover,
        bgLight: colors.default.bgLight,
        bgLightHover: colors.default.bgLightHover,
        fill: colors.default.fill,
        fillHover: colors.default.fillHover,
        border: colors.default.border,
        borderHover: colors.default.borderHover,
      };
  }
};
