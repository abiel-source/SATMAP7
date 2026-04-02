"use client";

import { TrailToggle } from "./TrailToggle";

export function BottomBar() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
      style={{
        background:
          "linear-gradient(to top, rgba(2,4,8,0.90) 0%, transparent 100%)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 items-end px-6 py-4">
        {/* Controls hint */}
        <div className="pointer-events-none hidden lg:flex gap-5">
          {[
            { key: "DRAG", action: "Rotate" },
            { key: "SCROLL", action: "Zoom" },
            { key: "HOVER", action: "Preview" },
            { key: "CLICK", action: "Select" },
          ].map(({ key, action }) => (
            <span key={key} className="text-[10px] tracking-wide text-white/25">
              <span className="text-white/50 border border-white/20 px-1 py-0.5 font-mono text-[9px] mr-1">
                {key}
              </span>
              {action}
            </span>
          ))}
        </div>

        {/* Trail toggle */}
        <div className="flex justify-center">
          <TrailToggle />
        </div>

        {/* Data attribution */}
        <div className="pointer-events-none hidden lg:block text-right">
          <p className="text-[10px] text-white/25 tracking-wide">
            Data: <span className="text-white/40">celestrak.org</span>
          </p>
          <p className="text-[10px] text-white/20 tracking-wide">
            Propagation: SGP4 via satellite.js
          </p>
        </div>
      </div>
    </div>
  );
}
