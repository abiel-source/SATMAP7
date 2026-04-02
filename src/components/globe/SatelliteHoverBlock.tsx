"use client";

import { Html } from "@react-three/drei";
import { useSatMapStore } from "@/store/satmapStore";
import { classifyOrbit } from "@/lib/satellite/propagation";
import { CATEGORY_META } from "@/types/satellite";

export function SatelliteHoverBlock() {
  const hoveredSatellite = useSatMapStore((s) => s.hoveredSatellite);
  const propagated = useSatMapStore((s) => s.propagated);

  if (!hoveredSatellite) return null;

  const live = propagated.get(hoveredSatellite.noradId);
  if (!live) return null;

  const orbitClass = classifyOrbit(live.altKm);
  const catColor = CATEGORY_META[hoveredSatellite.category].color;

  return (
    <Html position={live.position} style={{ pointerEvents: "none" }} center>
      <div
        style={{
          pointerEvents: "none",
          transform: "translate(12px, -50%)",
          color: catColor,
          textShadow: `0 0 8px ${catColor}99`,
          fontFamily: "monospace",
          fontSize: "11px",
          lineHeight: "1.6",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        <div style={{ fontWeight: "bold" }}>{hoveredSatellite.name}</div>
        <div style={{ opacity: 0.7 }}>NORAD {hoveredSatellite.noradId}</div>
        <div style={{ opacity: 0.7 }}>
          {orbitClass} · {Math.round(live.velocityKmS).toLocaleString()} km/s
        </div>
      </div>
    </Html>
  );
}
