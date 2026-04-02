"use client";

import { useSatMapStore } from "@/store/satmapStore";
import type { TrailMode } from "@/types/satellite";

const TRAIL_OPTIONS: {
  value: TrailMode;
  label: string;
  description: string;
}[] = [
  { value: "none", label: "None", description: "No orbit trail" },
  { value: "history", label: "History", description: "Past 90 min track" },
  {
    value: "full-orbit",
    label: "Full Orbit",
    description: "One complete revolution",
  },
  { value: "both", label: "Both", description: "History + full orbit" },
];

export function TrailToggle() {
  const trailMode = useSatMapStore((s) => s.trailMode);
  const setTrailMode = useSatMapStore((s) => s.setTrailMode);
  const selected = useSatMapStore((s) => s.selectedSatellite);

  return (
    <div className="pointer-events-auto">
      <p className="text-[10px] tracking-widest text-white/30 uppercase mb-1.5 text-center">
        Orbital Trail
      </p>
      <div className="flex gap-1">
        {TRAIL_OPTIONS.map((opt) => {
          const active = trailMode === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTrailMode(opt.value)}
              title={opt.description}
              className={`px-2.5 py-1.5 text-[10px] tracking-wide uppercase border transition-all ${
                active
                  ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan"
                  : "bg-space-900/80 border-white/10 text-white/40 hover:text-white/70 hover:border-white/25"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {!selected && (
        <p className="text-[9px] text-white/20 text-center mt-1 tracking-wide">
          Select a satellite to show trail
        </p>
      )}
    </div>
  );
}
