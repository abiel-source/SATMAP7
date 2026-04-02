"use client";

import { useEffect, useState } from "react";
import { useSatMapStore } from "@/store/satmapStore";

export function MobileStatsBar() {
  const selected = useSatMapStore((s) => s.selectedSatellite);

  const [utc, setUtc] = useState("");
  const totalVisible = useSatMapStore((s) => s.totalVisible);
  const categories = useSatMapStore((s) => s.categories);

  const loadedCount = Object.values(categories).filter((c) => c.loaded).length;
  const allLoaded = loadedCount === Object.keys(categories).length;

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getUTCHours().toString().padStart(2, "0");
      const m = now.getUTCMinutes().toString().padStart(2, "0");
      const s = now.getUTCSeconds().toString().padStart(2, "0");
      setUtc(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (selected) return null;

  return (
    <div className="flex flex-col gap-2.5 pointer-events-none">
      <MobileStatBlock
        label="Tracked Objects"
        value={totalVisible.toLocaleString() || "—"}
        sub="active satellites visible"
        accentColor="#00c8ff"
      />
      <MobileStatBlock
        label="UTC Time"
        value={utc}
        sub="propagation epoch"
        // accentColor="#39ff14"
        accentColor="#00c8ff"
        mono
      />
      <MobileStatBlock
        label="Data Source"
        value="CELESTRAK"
        sub="GP/TLE — SGP4 propagation"
        // accentColor="#fbbf24"
        accentColor="#00c8ff"
      />
      <MobileStatBlock
        label="Constellations"
        value={`${loadedCount} / ${Object.keys(categories).length}`}
        sub={
          allLoaded
            ? "all constellations loaded"
            : `${loadedCount} constellations loaded`
        }
        // accentColor={allLoaded ? "#39ff14" : "#fbbf24"}
        accentColor={allLoaded ? "#00c8ff" : "#fbbf24"}
      />
    </div>
  );
}

function MobileStatBlock({
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
    <div className="bg-space-900/85 backdrop-blur-sm border border-white/10 px-4 py-3">
      <p className="text-[10px] tracking-widest uppercase mb-1 text-white/50">
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
