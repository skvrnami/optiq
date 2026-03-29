import { MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import './App.css';
import AuthorTag from './components/AuthorTag';
import { BlockAuthorList } from './components/BlockAuthorList';
import { BlockDepositionMap } from './components/BlockDepositionMap';
import { BlockTextTable } from './components/BlockTextTable';
import DepositionTag from './components/DepositionTag';
import { IconClose } from './components/icons/Close';
import { LayoutBlock } from './components/LayoutBlock';
import { Button } from './components/ui/button';
import { DataAuthor, DataInstitute } from './types/data';
import { Filter, FilteredData, FilterType } from './types/filter';
import { filterData } from './utils/filterData';
import { useContainerSize } from './utils/useContainerSize';
import { LAYOUT } from './utils/layout';
import { useScreenSize, useLayoutDimensions } from './utils/useScreenSize';
import { cn } from './utils/utils';

function App() {
  const screen = useScreenSize();
  const { isMobile, isTablet, gap, padding } = screen;

  const [isDraggingV, setIsDraggingV] = useState(false);
  const [isDraggingH, setIsDraggingH] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, containerHeight] = useContainerSize(containerRef);

  const [hTopBlock, setHTopBlock] = useState<number>(400);
  const [wRightBlockState, setWRightBlock] = useState<number>(400);

  // Use centralized layout dimensions
  const layout = useLayoutDimensions(
    containerWidth,
    containerHeight,
    hTopBlock,
    wRightBlockState,
    screen
  );

  // Start vertical divider drag
  const handleMouseDownV = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsDraggingV(true);
  }, []);

  // Start horizontal divider drag
  const handleMouseDownH = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsDraggingH(true);
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingV) {
        const newWidth = Math.max(
          100,
          Math.min(containerWidth - e.clientX - padding, containerWidth - 200)
        );
        setWRightBlock(newWidth);
      }

      if (isDraggingH) {
        const newHeight = Math.max(
          100,
          Math.min(e.clientY - LAYOUT.headerHeight - padding, containerHeight - 200)
        );
        setHTopBlock(newHeight);
      }
    },
    [isDraggingV, isDraggingH, containerWidth, containerHeight, padding]
  );

  // End drag
  const handleMouseUp = useCallback(() => {
    setIsDraggingV(false);
    setIsDraggingH(false);
  }, []);

  // Mobile layout width
  const mobileBlockWidth = useMemo(
    () => containerWidth - padding * 2,
    [containerWidth, padding]
  );

  const [filter, setFilter] = useState<Filter>({
    type: FilterType.NONE,
    value: undefined,
  });

  const data = useMemo<FilteredData>(() => {
    return filterData(filter);
  }, [filter]);

  const filteredInstitute: DataInstitute | undefined = data.depositions
    .find((deposition) => deposition.institutes.some((institute) => institute.id === filter.value))
    ?.institutes.find((institute) => institute.id === filter.value);

  const filteredAuthor: DataAuthor | undefined = data.authors.find(
    (author) => author.id === filter.value
  );

  // Header component (shared between layouts)
  const renderHeader = () => (
    <div
      style={{ height: LAYOUT.headerHeight }}
      className="shrink-0 flex items-center justify-center"
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {filter.type === FilterType.NONE ? (
          <div className="text-sm">No active filter</div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-sm">Active filter:</span>
            <div className="text-sm flex items-center gap-2 text-center w-fit rounded-md">
              {filter.type === FilterType.AUTHOR && filteredAuthor ? (
                <AuthorTag author={filteredAuthor} onFilterChange={setFilter} filter={filter} />
              ) : filter.type === FilterType.DEPOSITION && filteredInstitute ? (
                <DepositionTag
                  institute={filteredInstitute}
                  onFilterChange={setFilter}
                  filter={filter}
                />
              ) : filter.type === FilterType.SIGLA ? (
                <div className="text-sm">Sigla: {filter.value}</div>
              ) : null}
              <Button
                variant="ghost"
                size="icon"
                className="size-5"
                onClick={() => setFilter({ type: FilterType.NONE, value: undefined })}
              >
                <IconClose className="size-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile layout - vertical stack with scroll
  if (isMobile) {
    return (
      <div
        className="min-h-screen bg-gray-50 overflow-auto"
        style={{ padding }}
        ref={containerRef}
      >
        {renderHeader()}
        <div className="flex flex-col" style={{ gap }}>
          <LayoutBlock id="texts" w={mobileBlockWidth} h={LAYOUT.mobileTextHeight} title="Texts">
            <BlockTextTable
              data={data}
              onFilterChange={setFilter}
              filter={filter}
              width={mobileBlockWidth}
              height={LAYOUT.mobileTextHeight}
            />
          </LayoutBlock>
          <LayoutBlock id="map" w={mobileBlockWidth} h={LAYOUT.mobileMapHeight} title="Depositions">
            <BlockDepositionMap
              data={data.depositions}
              onFilterChange={setFilter}
              filter={filter}
              width={mobileBlockWidth}
              height={LAYOUT.mobileMapHeight}
            />
          </LayoutBlock>
          <LayoutBlock id="authors" w={mobileBlockWidth} h={LAYOUT.mobileAuthorsHeight} title="Authors">
            <BlockAuthorList
              data={data.authors}
              onFilterChange={setFilter}
              filter={filter}
              width={mobileBlockWidth}
              height={LAYOUT.mobileAuthorsHeight}
            />
          </LayoutBlock>
        </div>
      </div>
    );
  }

  // Desktop/Tablet layout - grid with resizable panels
  return (
    <div
      className="h-screen w-screen bg-gray-50 relative overflow-hidden"
      style={{ padding }}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {renderHeader()}
      <div
        className="relative overflow-hidden"
        style={{
          display: 'grid',
          gap: `${gap}px`,
          gridTemplateColumns: `${layout.leftColumnWidth}px ${layout.rightColumnWidth}px`,
          gridTemplateRows: `${layout.textBlockHeight}px ${layout.mapBlockHeight}px`,
          maxHeight: layout.availableGridHeight,
        }}
      >
        <LayoutBlock id="top-left" w={layout.leftColumnWidth} h={layout.textBlockHeight} title="Texts">
          <BlockTextTable
            data={data}
            onFilterChange={setFilter}
            filter={filter}
            width={layout.leftColumnWidth}
            height={layout.textBlockHeight}
          />
        </LayoutBlock>
        <LayoutBlock id="top-right" w={layout.rightColumnWidth} h={layout.authorsBlockHeight} title="Authors">
          <BlockAuthorList
            data={data.authors}
            onFilterChange={setFilter}
            filter={filter}
            width={layout.rightColumnWidth}
            height={layout.authorsBlockHeight}
          />
        </LayoutBlock>
        <LayoutBlock id="bottom-left" w={layout.leftColumnWidth} h={layout.mapBlockHeight} title="Depositions">
          <BlockDepositionMap
            data={data.depositions}
            onFilterChange={setFilter}
            filter={filter}
            width={layout.leftColumnWidth}
            height={layout.mapBlockHeight}
          />
        </LayoutBlock>

        {/* Vertical divider for column resizing (hidden on tablet for simpler UX) */}
        {!isTablet && (
          <div
            className={cn(
              'absolute cursor-col-resize bg-transparent hover:bg-stone-500/50 z-10 transition-colors',
              isDraggingV && 'bg-stone-500/50'
            )}
            style={{
              left: layout.leftColumnWidth + gap / 2 - LAYOUT.dividerWidth / 2,
              top: 0,
              width: LAYOUT.dividerWidth,
              height: '100%',
            }}
            onMouseDown={handleMouseDownV}
          />
        )}

        {/* Horizontal divider for row resizing */}
        <div
          className={cn(
            'absolute cursor-row-resize bg-transparent hover:bg-stone-500/50 z-10 transition-colors',
            isDraggingH && 'bg-stone-500/50'
          )}
          style={{
            left: 0,
            top: layout.textBlockHeight + gap / 2 - LAYOUT.dividerWidth / 2,
            height: LAYOUT.dividerWidth,
            width: layout.leftColumnWidth,
          }}
          onMouseDown={handleMouseDownH}
        />
      </div>
    </div>
  );
}

export default App;
