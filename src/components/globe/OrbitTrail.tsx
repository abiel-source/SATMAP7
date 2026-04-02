"use client";

import { useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useSatMapStore } from "@/store/satmapStore";
import {
  computeHistoryTrail,
  computeFullOrbit,
} from "@/lib/satellite/propagation";
import type { SatelliteRecord } from "@/types/satellite";
import { CATEGORY_META } from "@/types/satellite";

interface OrbitTrailProps {
  satellite: SatelliteRecord;
}

export function OrbitTrail({ satellite }: OrbitTrailProps) {
  const trailMode = useSatMapStore((s) => s.trailMode);
  const [tick, setTick] = useState(0);

  const catColor = CATEGORY_META[satellite.category].color;

  // Recompute trails every 5 seconds
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const historyPoints = useMemo(() => {
    if (trailMode === "none" || trailMode === "full-orbit") return null;
    return computeHistoryTrail(satellite, new Date(), 90, 30);
  }, [satellite, trailMode, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const fullOrbitPoints = useMemo(() => {
    if (trailMode === "none" || trailMode === "history") return null;
    return computeFullOrbit(satellite, new Date(), 60);
  }, [satellite, trailMode]); // compute once — doesn't need tick

  return (
    <>
      {historyPoints && historyPoints.length > 1 && (
        <TrailLine
          points={historyPoints.map((p) => p.position)}
          color={catColor}
          opacity={0.8}
          dashed={false}
        />
      )}
      {fullOrbitPoints && fullOrbitPoints.length > 1 && (
        <TrailLine
          points={fullOrbitPoints.map((p) => p.position)}
          color={catColor}
          opacity={0.6}
          dashed={true}
        />
      )}
    </>
  );
}

interface TrailLineProps {
  points: [number, number, number][];
  color: string;
  opacity: number;
  dashed: boolean;
}

function TrailLine({ points, color, opacity, dashed }: TrailLineProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i][0];
      positions[i * 3 + 1] = points[i][1];
      positions[i * 3 + 2] = points[i][2];
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [points]);

  const material = useMemo(() => {
    if (dashed) {
      const mat = new THREE.LineDashedMaterial({
        color,
        transparent: true,
        opacity,
        dashSize: 0.05,
        gapSize: 0.03,
        depthWrite: false,
      });
      return mat;
    }
    return new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    });
  }, [color, opacity, dashed]);

  return <primitive object={new THREE.Line(geometry, material)} />;
}
