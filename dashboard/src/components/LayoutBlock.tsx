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
  return (
    <div
      key={id}
      style={{ width: w, height: h }}
      className="bg-white rounded-md p-4 shadow-lg overflow-hidden"
    >
      <div className="flex-none pb-2 px-1 ">
        <h3 className="text-xl font-medium text-left">{title}</h3>
      </div>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
};
