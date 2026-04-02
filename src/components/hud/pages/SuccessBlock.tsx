export const SuccessBlock = ({
  eyebrow,
  children,
}: {
  eyebrow: string | null;
  children: React.ReactNode;
}) => {
  return (
    <div className="bg-space-900/85 backdrop-blur-sm border border-white/10 px-4 py-3 w-full">
      {eyebrow && (
        <p className="text-[10px] tracking-widest font-mono uppercase">
          {eyebrow}
        </p>
      )}
      <p className={`text-[#39ff14]/90 text-[12px] leading-relaxed font-mono`}>
        {children}
      </p>
    </div>
  );
};
