"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import * as THREE from "three";
import { Earth } from "./Earth";
import { Starfield } from "./Starfield";
import { SatellitePoints } from "./SatellitePoints";
import { OrbitTrail } from "./OrbitTrail";
import { SatelliteHoverBlock } from "./SatelliteHoverBlock";
import { CameraController } from "./CameraController";

import { useSatMapStore } from "@/store/satmapStore";
import { CATEGORY_META } from "@/types/satellite";
import type { SatelliteCategory } from "@/types/satellite";

const CATEGORIES = Object.keys(CATEGORY_META) as SatelliteCategory[];

export function GlobeScene() {
  const selectedSatellite = useSatMapStore((s) => s.selectedSatellite);
  const trailMode = useSatMapStore((s) => s.trailMode);
  const loadCategory = useSatMapStore((s) => s.loadCategory);

  // Load all categories on mount
  useEffect(() => {
    for (const cat of CATEGORIES) {
      loadCategory(cat);
    }
  }, [loadCategory]);

  // connect CameraController to OrbitControls
  const controlsRef = useRef<{
    update: () => void;
    addEventListener: (event: string, callback: () => void) => void;
    removeEventListener: (event: string, callback: () => void) => void;
  } | null>(null);

  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 45, near: 0.01, far: 1000 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ background: "#020408" }}
      dpr={[1, 2]}
    >
      {/* Lighting */}
      <ambientLight intensity={0.05} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#fff8f0" />

      {/* Stars */}
      <Starfield count={6000} />

      {/* Earth */}
      <Suspense fallback={<EarthFallback />}>
        <Earth />
      </Suspense>

      {/* Satellite points per category */}
      {CATEGORIES.map((cat) => (
        <SatellitePoints key={cat} category={cat} />
      ))}

      {/* Orbit trail for selected satellite */}
      {selectedSatellite && trailMode !== "none" && (
        <OrbitTrail satellite={selectedSatellite} />
      )}

      {/* Satellite text on hover */}
      <SatelliteHoverBlock />

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef as any}
        enablePan={false}
        minDistance={1.15}
        maxDistance={12}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        dampingFactor={0.08}
        enableDamping
      />

      <CameraController controlsRef={controlsRef} />

      <Preload all />
    </Canvas>
  );
}

// Simple sphere placeholder while Earth textures load
function EarthFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1.0, 32, 32]} />
      <meshStandardMaterial
        color="#0a1f36"
        emissive="#071525"
        emissiveIntensity={0.5}
        roughness={1}
      />
    </mesh>
  );
}
