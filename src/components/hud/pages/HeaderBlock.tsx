export const HeaderBlock = ({
  header,
}: // subHeader,
{
  header: string;
  // subHeader: string;
}) => {
  return (
    <div className="bg-space-900/85 backdrop-blur-sm border border-white/10 px-4 py-3 w-full">
      <p className="text-white/80 font-display font-semibold text-sm tracking-[0.2em] uppercase">
        {header}
      </p>
      {/* <p className="text-white/80 text-[10px] mt-1 tracking-wide">
        {subHeader}
      </p> */}
    </div>
  );
};
