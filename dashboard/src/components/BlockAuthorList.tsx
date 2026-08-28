import { colors, getColorClasses } from '@/config/colors';
import { DataAuthor } from '@/types/data';
import { Filter, FilterItemState, FilterType } from '@/types/filter';
import 'leaflet/dist/leaflet.css';
import { memo, useRef, type CSSProperties } from 'react';
import AuthorTag from './AuthorTag';
import LifeLine from './LifeLine';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useScreenSize } from '@/utils/useScreenSize';
import { useContainerSize } from '@/utils/useContainerSize';

interface BlockAuthorListProps {
  data: DataAuthor[];
  onFilterChange: (filter: Filter) => void;
  filter: Filter;
  width: number;
  height: number;
}

export const BlockAuthorList = memo(
  ({ data, onFilterChange, filter, width, height }: BlockAuthorListProps) => {
    const { screenType, blockPadding } = useScreenSize();

    // Measured rather than derived. Computing the available width from the block
    // width meant guessing at the block's padding and at whether a vertical
    // scrollbar was taking space; it was 31px out, which is what pushed the
    // table wider than its container and produced a horizontal scrollbar.
    // clientWidth already excludes the scrollbar, so this is the real space.
    const scrollRef = useRef<HTMLDivElement>(null);
    const [availableWidth] = useContainerSize(scrollRef);

    const columnNameW = screenType === 'desktop' ? 150 : 100;
    // Wide enough for the column label as well as its values ("149", "3 / 149");
    // the timeline column absorbs whatever is left.
    const columnTextsW = filter.type === FilterType.NONE ? 70 : 86;
    const columnLifetimeW = Math.max(
      80,
      (availableWidth || width - blockPadding.x * 2) - columnNameW - columnTextsW
    );

    const columnSizes = {
      name: columnNameW,
      texts: columnTextsW,
      lifetime: columnLifetimeW,
    };

    const padding = 20;
    const lifeLineValueMin = -200; // x 0 + padding
    const lifeLineValueMax = 1600; // x width - padding

    const valueToX = (value: number): number => {
      const x =
        padding +
        ((value - lifeLineValueMin) / (lifeLineValueMax - lifeLineValueMin)) *
          (columnLifetimeW - 2 * padding);
      return x ?? 0;
    };

    const noLabel = (author: DataAuthor) => {
      const noAll = author.noTextsActive + author.noTextsInactive;

      if (author.noTextsInactive === 0) {
        return `${author.noTextsActive}`;
      }
      return `${author.noTextsActive} / ${noAll}`;
    };

    // Matching authors are pulled to the top, the way the texts table already
    // orders its rows. Array.sort is stable, so the original order survives
    // within each group and an unfiltered view is left untouched.
    const stateRank = (state: FilterItemState) => {
      if (state === FilterItemState.SELECTED) return 0;
      if (state === FilterItemState.ACTIVE) return 1;
      return 2;
    };

    const sortedAuthors = [...data].sort(
      (a, b) => stateRank(a.state) - stateRank(b.state)
    );

    const getRowColor = (author: DataAuthor) => {
      const colors = getColorClasses(author.state, filter);
      return `${colors.text} ${colors.fill} ${colors.bgLight} ${colors.bgLightHover}`;
    };

    return (
      <div className="bg-white overflow-hidden" style={{ height: height - blockPadding.y }}>
        <div ref={scrollRef} className="flex flex-col h-full overflow-y-auto overflow-x-hidden scrollbar-slim">
          {/* The author rows are denser than the texts table's: override the
              padding token rather than fight the !important on .table-td-padding */}
          <Table
            // table-fixed makes the specified column widths authoritative. Under
            // the default auto layout the browser widens a column to its
            // min-content width -- and the cells are whitespace-nowrap -- so a
            // long author name pushed the table past its container no matter
            // what width was asked for.
            className="table-fixed"
            // Not overflow-x-hidden: per the CSS overflow spec, setting one axis
            // to a non-visible value promotes `visible` on the other axis to
            // `auto`, which turned this div into a second vertical scroller and
            // cost 15px to its scrollbar. Left visible, the wrapper above is the
            // only scroll container.
            containerClassName="overflow-x-visible"
            style={{ '--table-td-padding': '0.3rem' } as CSSProperties}
          >
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead
                  className="text-right"
                  style={{ width: columnSizes.texts, maxWidth: columnSizes.texts }}
                >
                  Texts
                </TableHead>
                <TableHead style={{ width: columnSizes.name }}>Author</TableHead>
                <TableHead className="text-center" style={{ width: columnSizes.lifetime }}>
                  <div
                    className="flex flex-row items-center justify-center gap-x-1 relative"
                    aria-hidden="true"
                  >
                    <div className="-mt-3">Timeline</div>
                    {[500, 1500].map((axisValue) => (
                      <div
                        key={axisValue}
                        className={`absolute top-1 -translate-x-1/2 font-sans text-[10px] font-medium tracking-normal tabular-nums ${colors.dimmed.text}`}
                        style={{ left: valueToX(axisValue) }}
                      >
                        {axisValue}
                      </div>
                    ))}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAuthors.map((author) => {
                const color = getRowColor(author);
                return (
                  <TableRow key={author.id} className={`border-0 ${color}`}>
                    <TableCell
                      className="text-right tabular-nums"
                      style={{ width: columnSizes.texts, maxWidth: columnSizes.texts }}
                    >
                      {noLabel(author)}
                    </TableCell>
                    <TableCell
                      className="text-left truncate"
                      style={{ width: columnSizes.name, maxWidth: columnSizes.name }}
                    >
                      <AuthorTag author={author} onFilterChange={onFilterChange} filter={filter} />
                    </TableCell>
                    <TableCell
                      className="text-left truncate p-0 m-0"
                      style={{ width: columnSizes.lifetime }}
                    >
                      <LifeLine
                        authorId={author.id}
                        width={columnSizes.lifetime}
                        valueToX={valueToX}
                        state={author.state}
                        filter={filter}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
);
