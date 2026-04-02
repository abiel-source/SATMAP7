"use client";

import { useEffect, useState } from "react";
import StatBlock from "@/components/hud/StatBlock";
import { useSatMapStore } from "@/store/satmapStore";

export function StatsBar() {
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
    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-52 hidden lg:flex flex-col gap-2.5 pointer-events-none">
      <StatBlock
        label="Tracked Objects"
        value={totalVisible.toLocaleString() || "—"}
        sub="active satellites visible"
        accentColor="#00c8ff"
      />
      <StatBlock
        label="UTC Time"
        value={utc}
        sub="propagation epoch"
        // accentColor="#39ff14"
        accentColor="#00c8ff"
        mono
      />
      <StatBlock
        label="Data Source"
        value="CELESTRAK"
        sub="GP/TLE — SGP4 propagation"
        // accentColor="#fbbf24"
        accentColor="#00c8ff"
      />
      <StatBlock
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
