"use client";

import { useState, useEffect } from "react";
import { useSatMapStore } from "@/store/satmapStore";
import { CATEGORY_META, CATEGORY_IMAGES } from "@/types/satellite";
import type { SatelliteMediaPayload } from "@/app/api/satellite-media/route";

export function MobileSatelliteMediaPanel() {
  const selected = useSatMapStore((s) => s.selectedSatellite);
  const [media, setMedia] = useState<SatelliteMediaPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) {
      setMedia(null);
      return;
    }

    setLoading(true);
    fetch(`/api/satellite-media?noradId=${selected.noradId}`)
      .then((res) => res.json())
      .then((data) => {
        setMedia(data);
        setLoading(false);
      })
      .catch(() => {
        setMedia(null);
        setLoading(false);
      });
  }, [selected?.noradId]);

  if (!selected) return null;

  const catColor = CATEGORY_META[selected.category].color;
  const catImage = CATEGORY_IMAGES[selected.category];

  return (
    <div className="pointer-events-auto flex flex-col gap-2.5">
      {/* Description */}
      <div className="bg-space-900/90 backdrop-blur-sm border border-white/10 flex flex-col">
        <div className="px-4 py-3 max-h-48 overflow-y-auto">
          {loading && (
            <p className="text-white/30 text-[10px] tracking-wide font-mono">
              Scanning satellite...
            </p>
          )}
          {!loading && media?.description && (
            <p className="text-white/60 text-[10px] leading-relaxed font-mono">
              {media.description}
            </p>
          )}
          {!loading && !media?.description && (
            <p className="text-white/20 text-[10px] italic font-mono">
              No description detected.
            </p>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="bg-space-900/90 backdrop-blur-sm border border-white/10 overflow-hidden px-4 py-3">
        <img
          src={catImage}
          alt={CATEGORY_META[selected.category].label}
          className="w-full object-cover"
          style={{ maxHeight: "150px", opacity: 0.75 }}
        />
      </div>
    </div>
  );
}
