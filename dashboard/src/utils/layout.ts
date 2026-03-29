// Breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

// Layout constants
export const LAYOUT = {
  headerHeight: 40,
  dividerWidth: 4,
  // Min block heights
  minTextBlockHeight: 200,
  minMapBlockHeight: 200,
  minAuthorsBlockHeight: 200,
  // Mobile fixed heights
  mobileTextHeight: 400,
  mobileMapHeight: 350,
  mobileAuthorsHeight: 500,
} as const;

export type ScreenType = 'mobile' | 'tablet' | 'desktop';

export interface ScreenSize {
  width: number;
  height: number;
  screenType: ScreenType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  gap: number;
  padding: number;
  blockPadding: { x: number; y: number };
}

export interface LayoutDimensions {
  textBlockHeight: number;
  mapBlockHeight: number;
  authorsBlockHeight: number;
  leftColumnWidth: number;
  rightColumnWidth: number;
  availableGridHeight: number;
}
