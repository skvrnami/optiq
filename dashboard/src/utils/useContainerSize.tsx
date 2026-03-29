import { RefObject, useEffect, useRef, useState } from 'react';

// Minimum change in pixels required to trigger an update
const SIZE_CHANGE_THRESHOLD = 5;

export const useContainerSize = (containerRef: RefObject<HTMLDivElement | null>) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Throttle updates using requestAnimationFrame
      rafRef.current = requestAnimationFrame(() => {
        // Round to integers to avoid fractional pixel issues
        const newWidth = Math.round(container.clientWidth);
        const newHeight = Math.round(container.clientHeight);

        // Only update if change exceeds threshold (prevents constant updates from browser UI)
        const widthChanged = Math.abs(newWidth - lastSizeRef.current.width) >= SIZE_CHANGE_THRESHOLD;
        const heightChanged = Math.abs(newHeight - lastSizeRef.current.height) >= SIZE_CHANGE_THRESHOLD;

        if (widthChanged || heightChanged) {
          lastSizeRef.current = { width: newWidth, height: newHeight };
          if (widthChanged) setContainerWidth(newWidth);
          if (heightChanged) setContainerHeight(newHeight);
        }
      });
    };

    // Initial size (no threshold for first measurement)
    const initialWidth = Math.round(container.clientWidth);
    const initialHeight = Math.round(container.clientHeight);
    lastSizeRef.current = { width: initialWidth, height: initialHeight };
    setContainerWidth(initialWidth);
    setContainerHeight(initialHeight);

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [containerRef]);

  return [containerWidth, containerHeight];
};
