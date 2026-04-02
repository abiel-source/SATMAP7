"use client";

import { useEffect, useState } from "react";
import { useSatMapStore } from "@/store/satmapStore";
import { classifyOrbit } from "@/lib/satellite/propagation";
import type { PropagatedSatellite } from "@/types/satellite";
import StatBlock from "@/components/hud/StatBlock";
import { CATEGORY_META } from "@/types/satellite";

export function MobileSatelliteInfoPanel() {
  const selected = useSatMapStore((s) => s.selectedSatellite);
  const propagated = useSatMapStore((s) => s.propagated);
  const setSelected = useSatMapStore((s) => s.setSelected);

  const activeSat = selected;
  const [liveData, setLiveData] = useState<PropagatedSatellite | null>(null);

  useEffect(() => {
    if (!activeSat) {
      setLiveData(null);
      return;
    }
    const data = propagated.get(activeSat.noradId);
    if (data) setLiveData(data);
  }, [activeSat, propagated]);

  if (!activeSat) return null;

  const catMeta = CATEGORY_META[activeSat.category];
  const orbitClass = liveData ? classifyOrbit(liveData.altKm) : "—";

  return (
    // DEV NOTES:
    // maybe remove animate-slide-up???

    <div className="animate-slide-up pointer-events-auto flex flex-col gap-2.5">
      {/* Header */}
      {/* <div className="bg-space-900/85 backdrop-blur-sm border border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: catMeta.color }}
          >
            {catMeta.label}
          </p>
          <h3 className="font-display font-semibold text-white text-sm mt-0.5 truncate">
            {activeSat.name}
          </h3>
        </div>
        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="shrink-0 text-space-700 hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div> */}

      {/* Data rows */}
      <div className="bg-space-900/90 backdrop-blur-sm border border-white/5 border-t-0">
        <Row label="NORAD ID" value={String(activeSat.noradId)} />
        <Row
          label="ALTITUDE"
          value={liveData ? `${liveData.altKm.toFixed(0)} km` : "—"}
        />
        <Row
          label="VELOCITY"
          value={liveData ? `${liveData.velocityKmS.toFixed(2)} km/s` : "—"}
        />
        <Row
          label="LATITUDE"
          value={liveData ? `${liveData.latDeg.toFixed(4)}°` : "—"}
        />
        <Row
          label="LONGITUDE"
          value={liveData ? `${liveData.lonDeg.toFixed(4)}°` : "—"}
        />
        <Row
          label="INCLINATION"
          value={`${activeSat.inclination.toFixed(2)}°`}
        />
        <Row label="ORBIT CLASS" value={orbitClass} accent />
        <Row label="ECCENTRICITY" value={activeSat.eccentricity.toFixed(6)} />
        <Row label="MEAN MOTION" value={`${activeSat.meanMotion.toFixed(4)}`} />
        <Row label="EPOCH" value={activeSat.epoch.slice(0, 10)} />
      </div>

      {/* TLE snippet */}
      <div className="bg-space-900/90 backdrop-blur-sm border border-white/5 border-t-0 px-3 py-2">
        <p className="text-[10px] tracking-widest text-white/30 mb-1">TLE</p>
        <p className="font-mono text-[9px] text-white/40 truncate">
          {activeSat.tle1}
        </p>
        <p className="font-mono text-[9px] text-white/40 truncate">
          {activeSat.tle2}
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between items-center px-4 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[10px] tracking-widest text-white/40 uppercase">
        {label}
      </span>
      <span
        className={`font-mono text-xs ${
          accent ? "text-accent-cyan" : "text-white/80"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
