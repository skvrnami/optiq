import { getColorClasses } from '@/config/colors';
import { BLOCK_PADDING_Y_PX } from '@/constants';
import type { DataAuthor, DataDeposition, DataText } from '@/types/data';
import { Filter, FilterItemState } from '@/types/filter';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import AuthorTag from './AuthorTag';
import DepositionTag from './DepositionTag';
import SiglaTag from './SiglaTag';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import TextTag from './TextTag';

interface BlockTextTableProps {
  data: {
    texts: DataText[];
    authors: DataAuthor[];
    depositions: DataDeposition[];
  };
  onFilterChange: (filter: Filter) => void;
  filter: Filter;
  width: number;
  height: number;
}

export const BlockTextTable = ({ data, onFilterChange, filter, height }: BlockTextTableProps) => {
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null);

  const columnSizes = {
    title: 0,
    author: 125,
    deposition: 150,
    sigla: 50,
    date: 50,
  };

  const getRowColor = (text: DataText) => {
    const colors = getColorClasses(text.state, filter);
    return `${colors.text} ${colors.fill} ${colors.bgLight} ${colors.bgLightHover}`;
  };

  // Sort texts by state (active first, then inactive)
  const sortedTexts = [...data.texts].sort((a, b) => {
    if (a.state === FilterItemState.ACTIVE && b.state !== FilterItemState.ACTIVE) return -1;
    if (a.state !== FilterItemState.ACTIVE && b.state === FilterItemState.ACTIVE) return 1;
    return 0;
  });

  columnSizes.title = sortedTexts
    .map((text) => text.title.length)
    .reduce((a, b) => Math.max(a, b), 0);

  // Scroll to top when filter changes
  useEffect(() => {
    if (tableHeaderRef.current) {
      const containerRect = tableHeaderRef.current.closest('[data-slot="table-container"]');

      if (containerRect) {
        setTimeout(() => {
          containerRect.scrollTo({ top: 0 });
        }, 1000);
      }
    }
  }, [filter.value]);

  return (
    <div className="bg-white overflow-hidden" style={{ height: height - BLOCK_PADDING_Y_PX }}>
      <div className="flex flex-col h-full overflow-auto">
        <Table>
          <TableHeader ref={tableHeaderRef} className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead>Text</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Institute</TableHead>
              <TableHead>Sigla</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {sortedTexts.map((text) => {
              const color = getRowColor(text);
              const author = data.authors.find((author) => author.id === text.authorId);
              const city = data.depositions.find((deposition) =>
                deposition.institutes.some((institute) => institute.id === text.locationId)
              );
              const institute = city?.institutes.find(
                (institute) => institute.id === text.locationId
              );

              return (
                <TableRow key={text.id} className={`border-0 ${color}`}>
                  <TableCell className={`text-left max-w-[${columnSizes.title}px] truncate`}>
                    <TextTag text={text} filter={filter} />
                  </TableCell>
                  <TableCell className={`text-left max-w-[${columnSizes.author}px] truncate`}>
                    {author && (
                      <AuthorTag author={author} onFilterChange={onFilterChange} filter={filter} />
                    )}
                  </TableCell>
                  <TableCell className={`text-left max-w-[${columnSizes.deposition}px] truncate`}>
                    {institute && (
                      <DepositionTag
                        institute={institute}
                        onFilterChange={onFilterChange}
                        filter={filter}
                      />
                    )}
                  </TableCell>
                  <TableCell className={`text-left max-w-[${columnSizes.sigla}px] truncate`}>
                    <SiglaTag sigla={text.sigla} state={text.state} filter={filter} />
                  </TableCell>
                  <TableCell className={`text-left max-w-[${columnSizes.date}px] truncate`}>
                    {text.date}
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
