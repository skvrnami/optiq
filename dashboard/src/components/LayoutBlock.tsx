import { useScreenSize } from '@/utils/useScreenSize';

interface LayoutBlockProps {
  id: string;
  w: number;
  h: number;
  children: React.ReactNode;
  title: string;
}

export const LayoutBlock: React.FC<LayoutBlockProps> = ({
  id,
  w,
  h,
  children,
  title,
}: LayoutBlockProps) => {
  const { screenType, blockPadding } = useScreenSize();
  const isCompact = screenType !== 'desktop';

  return (
    <div
      key={id}
      style={{
        width: w,
        height: h,
        padding: isCompact ? blockPadding.x / 2 : blockPadding.x,
      }}
      className="bg-white rounded-md shadow-lg overflow-hidden"
    >
      <div className="flex-none px-1">
        <h3 className={`font-medium text-left ${isCompact ? 'text-base' : 'text-lg'}`}>
          {title}
        </h3>
      </div>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
};
