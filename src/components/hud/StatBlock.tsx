export default function StatBlock({
  label,
  value,
  sub,
  accentColor,
  mono = false,
}: {
  label: string;
  value: string;
  sub: string;
  accentColor: string;
  mono?: boolean;
}) {
  return (
    <div
      className="bg-space-900/85 backdrop-blur-sm border border-white/10 px-4 py-3"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
    >
      <p
        className="text-[10px] tracking-widest uppercase mb-1"
        style={{ color: accentColor }}
      >
        {label}
      </p>
      <p
        className={`text-white font-semibold text-lg leading-none ${
          mono ? "font-mono" : "font-display"
        }`}
      >
        {value}
      </p>
      <p className="text-white/35 text-[10px] mt-1 tracking-wide">{sub}</p>
    </div>
  );
}
