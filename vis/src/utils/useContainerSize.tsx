import { RefObject, useEffect, useState } from "react";

export const useContainerSize = (
  containerRef: RefObject<HTMLDivElement | null>
) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerWidth(container.clientWidth);
      setContainerHeight(container.clientHeight);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return [containerWidth, containerHeight];
};
