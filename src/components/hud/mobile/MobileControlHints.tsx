export const MobileControlHints = () => {
  return (
    <div className="flex flex-col gap-2.5 pointer-events-auto">
      <div className="bg-space-900/90 backdrop-blur-sm border border-white/10 px-4 py-2.5">
        <span className="text-xs tracking-wide text-white/80 font-mono">
          Desktop/Tablet:
        </span>
        <div className="pointer-events-none flex flex-col gap-2.5 p-2.5">
          {[
            { key: "DRAG", action: "Rotate globe" },
            { key: "SCROLL", action: "Zoom in or out" },
            { key: "HOVER", action: "Preview satellite" },
            { key: "CLICK", action: "Select satellite" },
          ].map(({ key, action }) => (
            <span key={key} className="text-[10px] tracking-wide text-white/80">
              <span className="text-white/80 border border-white/30 px-1 py-0.5 font-mono text-[9px] mr-1">
                {key}
              </span>
              {action}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-space-900/90 backdrop-blur-sm border border-white/10 px-4 py-2.5">
        <span className="text-xs tracking-wide text-white/80 font-mono">
          Mobile/Tablet:
        </span>
        <div className="pointer-events-none flex flex-col gap-2.5 p-2.5">
          {[
            { key: "DRAG", action: "Rotate Globe" },
            { key: "PINCH", action: "Zoom in or out" },
            { key: "TAP", action: "(De)Select satellite" },
          ].map(({ key, action }) => (
            <span key={key} className="text-[10px] tracking-wide text-white/80">
              <span className="text-white/80 border border-white/30 px-1 py-0.5 font-mono text-[9px] mr-1">
                {key}
              </span>
              {action}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
