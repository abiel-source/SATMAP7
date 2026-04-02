"use client";

import { useSatMapStore } from "@/store/satmapStore";

export function DeselectionChip() {
  const selectedSatellite = useSatMapStore((s) => s.selectedSatellite);
  const setSelected = useSatMapStore((s) => s.setSelected);

  if (!selectedSatellite) return null;

  return (
    <div className="fixed top-16 right-6 z-20 pointer-events-auto flex items-center">
      <button
        onClick={() => setSelected(null)}
        className="text-white/50 hover:text-white/80 transition-colors"
      >
        <span className="text-white/50 hover:text-white/80 text-[10px] tracking-[0.2em] uppercase">
          [Exit Details Mode]
        </span>
      </button>
    </div>
  );
}
