"use client";

import { useSatMapStore } from "@/store/satmapStore";
import { CATEGORY_META } from "@/types/satellite";
import type { SatelliteCategory } from "@/types/satellite";

const CATEGORIES = Object.keys(CATEGORY_META) as SatelliteCategory[];

export const MobileCategorySidebar = () => {
  const categories = useSatMapStore((s) => s.categories);
  const toggleCategoryVisibility = useSatMapStore(
    (s) => s.toggleCategoryVisibility
  );
  const totalVisible = useSatMapStore((s) => s.totalVisible);

  return (
    <div className="bg-space-900/90 backdrop-blur-sm border border-white/10">
      {CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat];
        const state = categories[cat];
        const isVisible = state.visible;
        const isLoading = state.loading;

        return (
          <button
            key={cat}
            onClick={() => toggleCategoryVisibility(cat)}
            className="w-full flex items-center justify-between px-4 py-2.5
                    border-b border-white/5 last:border-0
                    hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full shrink-0 transition-opacity"
                style={{
                  background: meta.color,
                  boxShadow: isVisible ? `0 0 6px ${meta.color}` : "none",
                  opacity: isVisible ? 1 : 0.2,
                }}
              />
              <span
                className={`text-xs tracking-wide transition-colors ${
                  isVisible ? "text-white/80" : "text-white/30"
                }`}
              >
                {meta.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isLoading && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse-slow" />
              )}
              <span className="text-[10px] font-mono text-white/30">
                {state.loaded ? state.records.length.toLocaleString() : "—"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
