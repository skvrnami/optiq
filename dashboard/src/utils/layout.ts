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
  // Derived from the data: the depositions span 37.23°N to 57.14°N, which at
  // MIN_ZOOM (the furthest the map can zoom out) projects to 339px of Mercator.
  // Leaflet's own chrome overlays another 91px - 74 for the zoom control and its
  // margin, 17 for the attribution strip. Below 430 there is no zoom level at
  // which the whole distribution is visible clear of the controls. This is the
  // only place the map's minimum height is defined.
  minMapBlockHeight: 430,
  minAuthorsBlockHeight: 200,
  // Mobile fixed heights
  mobileTextHeight: 400,
  mobileMapHeight: 430,
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
