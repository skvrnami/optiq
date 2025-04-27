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
import { cn } from './utils/utils';

const LAYOUT_GAP = 16;
const LAYOUT_PADDING = 16;
const LAYOUT_HEADER_HEIGHT = 70;
const LAYOUT_DIVIDER_WIDTH = 4;

function App() {
  const [isDraggingV, setIsDraggingV] = useState(false);
  const [isDraggingH, setIsDraggingH] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const [containerWidth, containerHeight] = useContainerSize(containerRef);

  const [hTopBlock, setHTopBlock] = useState<number>(500);
  const [wRightBlock, setWRightBlock] = useState<number>(500);

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
          Math.min(containerWidth - e.clientX - LAYOUT_PADDING, containerWidth - 200)
        );
        setWRightBlock(newWidth);
      }

      if (isDraggingH) {
        const newHeight = Math.max(
          100,
          Math.min(e.clientY - LAYOUT_HEADER_HEIGHT - LAYOUT_PADDING, containerHeight - 200)
        );
        setHTopBlock(newHeight);
      }
    },
    [isDraggingV, isDraggingH, containerWidth, containerHeight]
  );

  // End drag
  const handleMouseUp = useCallback(() => {
    setIsDraggingV(false);
    setIsDraggingH(false);
  }, []);

  const hBottomBlock =
    containerHeight - (hTopBlock + LAYOUT_HEADER_HEIGHT + LAYOUT_GAP + LAYOUT_PADDING * 2);
  const wLeftBlock = containerWidth - (wRightBlock + LAYOUT_GAP + LAYOUT_PADDING * 2);

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

  return (
    <div
      className="min-h-screen bg-gray-50 max-w-screen max-h-screen relative"
      style={{ padding: LAYOUT_PADDING }}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={{ height: LAYOUT_HEADER_HEIGHT }}>
        <div className="text-xl font-medium text-center uppercase">
          Logiq texts and their depositions
        </div>
        <div className="flex items-center justify-center gap-2">
          {filter.type === FilterType.NONE ? (
            <div className="text-sm ">No active filter</div>
          ) : (
            <div className="flex items-center gap-2">
              Active filter:
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
                  className="size-4"
                  onClick={() => setFilter({ type: FilterType.NONE, value: undefined })}
                >
                  <IconClose className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className="relative"
        style={{
          display: 'grid',
          gap: `${LAYOUT_GAP}px`,
          gridTemplateColumns: `${wLeftBlock}px ${wRightBlock}px`,
          gridTemplateRows: `${hTopBlock}px ${hBottomBlock}px`,
        }}
      >
        <LayoutBlock id="top-left" w={wLeftBlock} h={hTopBlock} title="Texts">
          <BlockTextTable
            data={data}
            onFilterChange={setFilter}
            filter={filter}
            width={wLeftBlock}
            height={hTopBlock}
          />
        </LayoutBlock>
        <LayoutBlock
          id="top-right"
          w={wRightBlock}
          h={hTopBlock + hBottomBlock + LAYOUT_PADDING}
          title="Authors"
        >
          <BlockAuthorList
            data={data.authors}
            onFilterChange={setFilter}
            filter={filter}
            width={wRightBlock}
            height={hTopBlock + hBottomBlock + LAYOUT_PADDING}
          />
        </LayoutBlock>
        <LayoutBlock id="bottom-left" w={wLeftBlock} h={hBottomBlock} title="Depositions">
          <BlockDepositionMap
            data={data.depositions}
            onFilterChange={setFilter}
            filter={filter}
            width={wLeftBlock}
            height={hBottomBlock}
          />
        </LayoutBlock>
        {/* <LayoutBlock
          id="bottom-right"
          w={wRightBlock}
          h={hBottomBlock}
          title="Bottom Right Block">
          <BlockBirthDeathsMap
            dataBirths={data.births}
            dataDeaths={data.deaths}
            onFilterChange={setFilter}
            width={wRightBlock}
            height={hBottomBlock}
          />
        </LayoutBlock> */}

        {/* Vertical divider for column resizing */}
        <div
          className={cn(
            'absolute cursor-col-resize bg-transparent hover:bg-stone-500/50 z-10 transition-colors',
            isDraggingV && 'bg-stone-500/50'
          )}
          style={{
            left: wLeftBlock + LAYOUT_GAP / 2 - LAYOUT_DIVIDER_WIDTH / 2,
            top: 0,
            width: LAYOUT_DIVIDER_WIDTH,
            height: '100%',
          }}
          onMouseDown={handleMouseDownV}
        />

        {/* Horizontal divider for row resizing */}
        <div
          className={cn(
            'absolute cursor-row-resize bg-transparent hover:bg-stone-500/50 z-10 transition-colors',
            isDraggingH && 'bg-stone-500/50'
          )}
          style={{
            left: 0,
            top: hTopBlock + LAYOUT_GAP / 2 - LAYOUT_DIVIDER_WIDTH / 2,
            height: LAYOUT_DIVIDER_WIDTH,
            width: wLeftBlock,
          }}
          onMouseDown={handleMouseDownH}
        />
      </div>
    </div>
  );
}

export default App;
