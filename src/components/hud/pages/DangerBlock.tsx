export const DangerBlock = ({
  header,
  subHeader,
}: {
  header: string;
  subHeader: string;
}) => {
  return (
    <div className="bg-space-900/85 backdrop-blur-sm border border-white/10 px-4 py-3">
      {/* <p
            className="text-[10px] tracking-widest uppercase mb-1"
            style={{ color: accentColor }}
          >
            {label}
          </p> */}
      <p
        className={`text-white font-semibold text-lg leading-none font-display`}
      >
        {header}
      </p>
      <p className="text-white/35 text-[10px] mt-1 tracking-wide">
        {subHeader}
      </p>
    </div>
  );
};
