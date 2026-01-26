import { Filter, FilterItemState, FilterType } from '@/types/filter';

// Unknown value colors - stone palette for neutral, muted appearance
const unknownColors = {
  textUnknown: 'text-stone-400',
  bgUnknown: 'bg-stone-300',
  bgLightUnknown: 'bg-stone-200/30',
};

export const colors = {
  primary: {
    text: 'text-orange-700',
    textHover: 'text-orange-800',
    textLink: 'text-orange-900',
    bg: 'bg-orange-700',
    bgHover: 'hover:bg-orange-700',
    bgLight: 'bg-orange-100',
    bgLightHover: 'hover:bg-orange-200',
    bgMiddle: 'bg-orange-500',
    bgMiddleHover: 'hover:bg-orange-500',
    fill: 'fill-orange-600',
    fillHover: 'fill-orange-700',
    stroke: 'stroke-orange-800',
    border: 'border-orange-700',
    borderHover: 'border-orange-800',
    ...unknownColors,
  },
  active: {
    text: 'text-gray-900',
    textHover: 'text-gray-950',
    textLink: 'text-amber-900',
    bg: 'bg-gray-900',
    bgHover: 'hover:bg-gray-950',
    bgLight: 'bg-gray-200',
    bgLightHover: 'hover:bg-gray-300',
    bgMiddle: 'bg-gray-400',
    bgMiddleHover: 'hover:bg-gray-500',
    fill: 'fill-amber-500',
    fillHover: 'fill-amber-600',
    border: 'border-gray-900',
    borderHover: 'border-gray-950',
    ...unknownColors,
  },
  default: {
    text: 'text-gray-700',
    textHover: 'text-gray-800',
    textLink: 'text-amber-900',
    bg: 'bg-gray-700',
    bgHover: 'hover:bg-gray-800',
    bgLight: 'bg-gray-100',
    bgLightHover: 'hover:bg-gray-200',
    bgMiddle: 'bg-gray-300',
    bgMiddleHover: 'hover:bg-gray-400',
    fill: 'fill-gray-700',
    fillHover: 'fill-gray-800',
    border: 'border-gray-700',
    borderHover: 'border-gray-800',
    ...unknownColors,
  },
  dimmed: {
    text: 'text-gray-500',
    textHover: 'text-gray-600',
    textLink: 'text-amber-900',
    bg: 'bg-gray-500',
    bgHover: 'hover:bg-gray-600',
    bgLight: 'bg-gray-50',
    bgLightHover: 'hover:bg-gray-100',
    bgMiddle: 'bg-gray-300',
    bgMiddleHover: 'hover:bg-gray-400',
    fill: 'fill-gray-500',
    fillHover: 'fill-gray-600',
    border: 'border-gray-500',
    borderHover: 'border-gray-600',
    ...unknownColors,
  },
};

export const getColorClasses = (state: FilterItemState, filter: Filter) => {
  // If nothing is selected (filter type is NONE), use default colors
  if (filter.type === FilterType.NONE) {
    return {
      text: colors.default.text,
      textHover: colors.default.textHover,
      textLink: colors.default.textLink,
      textUnknown: colors.default.textUnknown,
      bg: colors.default.bg,
      bgHover: colors.default.bgHover,
      bgLight: colors.default.bgLight,
      bgLightHover: colors.default.bgLightHover,
      bgUnknown: colors.default.bgUnknown,
      bgLightUnknown: colors.default.bgLightUnknown,
      bgMiddle: colors.default.bgMiddle,
      bgMiddleHover: colors.default.bgMiddleHover,
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
        textUnknown: colors.primary.textUnknown,
        bg: colors.primary.bg,
        bgHover: colors.primary.bgHover,
        bgLight: colors.primary.bgLight,
        bgLightHover: colors.primary.bgLightHover,
        bgUnknown: colors.primary.bgUnknown,
        bgLightUnknown: colors.primary.bgLightUnknown,
        bgMiddle: colors.primary.bgMiddle,
        bgMiddleHover: colors.primary.bgMiddleHover,
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
        textUnknown: colors.active.textUnknown,
        bg: colors.active.bg,
        bgHover: colors.active.bgHover,
        bgLight: colors.active.bgLight,
        bgLightHover: colors.active.bgLightHover,
        bgUnknown: colors.active.bgUnknown,
        bgLightUnknown: colors.active.bgLightUnknown,
        bgMiddle: colors.active.bgMiddle,
        bgMiddleHover: colors.active.bgMiddleHover,
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
        textUnknown: colors.dimmed.textUnknown,
        bg: colors.dimmed.bg,
        bgHover: colors.dimmed.bgHover,
        bgLight: colors.dimmed.bgLight,
        bgLightHover: colors.dimmed.bgLightHover,
        bgUnknown: colors.dimmed.bgUnknown,
        bgLightUnknown: colors.dimmed.bgLightUnknown,
        bgMiddle: colors.dimmed.bgMiddle,
        bgMiddleHover: colors.dimmed.bgMiddleHover,
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
        textUnknown: colors.default.textUnknown,
        bg: colors.default.bg,
        bgHover: colors.default.bgHover,
        bgLight: colors.default.bgLight,
        bgLightHover: colors.default.bgLightHover,
        bgUnknown: colors.default.bgUnknown,
        bgLightUnknown: colors.default.bgLightUnknown,
        bgMiddle: colors.default.bgMiddle,
        bgMiddleHover: colors.default.bgMiddleHover,
        fill: colors.default.fill,
        fillHover: colors.default.fillHover,
        border: colors.default.border,
        borderHover: colors.default.borderHover,
      };
  }
};
