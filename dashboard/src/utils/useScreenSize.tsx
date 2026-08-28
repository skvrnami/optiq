import { useEffect, useMemo, useState } from 'react';
import { BREAKPOINTS, LAYOUT, ScreenSize, ScreenType, LayoutDimensions } from './layout';

const getScreenType = (width: number): ScreenType => {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

const getLayoutValues = (screenType: ScreenType) => {
  switch (screenType) {
    case 'mobile':
      return { gap: 8, padding: 8, blockPadding: { x: 16, y: 36 } };
    case 'tablet':
      return { gap: 10, padding: 10, blockPadding: { x: 20, y: 40 } };
    default:
      return { gap: 16, padding: 16, blockPadding: { x: 24, y: 48 } };
  }
};

/**
 * The hook is called from roughly 88 places - once per author row, among
 * others - so what it stores decides what a resize costs.
 *
 * It used to hold { width, height }. That is a fresh object on every resize
 * event, so Object.is never matched, React's bail-out never fired, and every
 * subscriber re-rendered even when the viewport had not changed at all. No
 * consumer ever read either field: they all take screenType, blockPadding,
 * gap, padding or the isMobile/isTablet flags.
 *
 * Holding the breakpoint itself makes the common case free. A resize that does
 * not cross 768 or 1024 sets the same string, React bails out before
 * rendering, and the mobile URL bar - which changes only innerHeight - can
 * never cause a render at all.
 */
export const useScreenSize = (): ScreenSize => {
  const [screenType, setScreenType] = useState<ScreenType>(() =>
    getScreenType(typeof window !== 'undefined' ? window.innerWidth : 1200)
  );

  useEffect(() => {
    const handleResize = () => setScreenType(getScreenType(window.innerWidth));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useMemo(() => {
    const layoutValues = getLayoutValues(screenType);
    return {
      screenType,
      isMobile: screenType === 'mobile',
      isTablet: screenType === 'tablet',
      isDesktop: screenType === 'desktop',
      ...layoutValues,
    };
  }, [screenType]);
};

export const useLayoutDimensions = (
  containerWidth: number,
  containerHeight: number,
  hTopBlock: number,
  wRightBlockState: number,
  screen: ScreenSize
): LayoutDimensions => {
  return useMemo(() => {
    const { gap, padding, isTablet } = screen;
    const availableGridHeight = Math.max(0, containerHeight - LAYOUT.headerHeight - padding * 2);

    let rightColumnWidth = wRightBlockState;
    if (containerWidth > 0) {
      if (isTablet) {
        rightColumnWidth = Math.min(300, Math.max(250, containerWidth * 0.35));
      } else {
        rightColumnWidth = Math.min(wRightBlockState, containerWidth * 0.4);
        rightColumnWidth = Math.max(rightColumnWidth, 280);
      }
    }

    const leftColumnWidth = Math.max(200, containerWidth - rightColumnWidth - gap - padding * 2);
    const maxTextHeight = availableGridHeight - LAYOUT.minMapBlockHeight - gap;
    const textBlockHeight = Math.max(LAYOUT.minTextBlockHeight, Math.min(hTopBlock, maxTextHeight));
    const mapBlockHeight = Math.max(LAYOUT.minMapBlockHeight, availableGridHeight - textBlockHeight - gap);
    const authorsBlockHeight = Math.min(textBlockHeight + mapBlockHeight + gap, availableGridHeight);

    return { textBlockHeight, mapBlockHeight, authorsBlockHeight, leftColumnWidth, rightColumnWidth, availableGridHeight };
  }, [containerWidth, containerHeight, hTopBlock, wRightBlockState, screen]);
};
