import { getColorClasses } from '@/config/colors';
import { BLOCK_PADDING_Y_PX } from '@/constants';
import { DataAuthor } from '@/types/data';
import { Filter } from '@/types/filter';
import 'leaflet/dist/leaflet.css';
import AuthorTag from './AuthorTag';
import LifeLine from './LifeLine';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface BlockAuthorListProps {
  data: DataAuthor[];
  onFilterChange: (filter: Filter) => void;
  filter: Filter;
  width: number;
  height: number;
}

export const BlockAuthorList = ({
  data,
  onFilterChange,
  filter,
  width,
  height,
}: BlockAuthorListProps) => {
  const columnNameW = 175;
  const columnTextsW = 50;
  const columnLifetimeW = width - columnNameW - columnTextsW - 60;

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

  const getRowColor = (author: DataAuthor) => {
    const colors = getColorClasses(author.state, filter);
    return `${colors.text} ${colors.fill} ${colors.bgLight} ${colors.bgLightHover}`;
  };

  return (
    <div className="bg-white overflow-hidden" style={{ height: height - BLOCK_PADDING_Y_PX }}>
      <div className="flex flex-col h-full">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead
                className={`w-[${columnSizes.texts}px] max-w-[${columnSizes.texts}px] text-right`}
              >
                No
              </TableHead>
              <TableHead className={`w-[${columnSizes.name}px]`}>Author</TableHead>
              <TableHead className={`w-[${columnSizes.lifetime}px] text-center`}>
                <div className="flex flex-row items-center justify-center gap-x-1 relative">
                  <div className="text-xs font-medium -mt-3">Timeline</div>
                  {[0, 500, 1000, 1500].map((axisValue) => (
                    <div
                      key={axisValue}
                      className="absolute text-xs font-medium top-1 text-gray-300 -translate-x-1/2"
                      style={{ left: valueToX(axisValue) }}
                    >
                      {axisValue}
                    </div>
                  ))}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {data.map((author) => {
              const color = getRowColor(author);
              return (
                <TableRow key={author.id} className={`border-0 ${color} `}>
                  <TableCell
                    className={`text-right w-[${columnSizes.texts}px] max-w-[${columnSizes.texts}px]`}
                  >
                    {noLabel(author)}
                  </TableCell>
                  <TableCell
                    className={`text-left w-[${columnSizes.name}px] max-w-[${columnSizes.name}px] truncate`}
                  >
                    <AuthorTag author={author} onFilterChange={onFilterChange} filter={filter} />
                  </TableCell>
                  <TableCell className={`text-left w-[${columnSizes.lifetime}px] truncate p-0 m-0`}>
                    <LifeLine
                      authorId={author.id}
                      width={columnSizes.lifetime}
                      height={38}
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
};
