"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import * as THREE from "three";
import { Earth } from "./Earth";
import { Starfield } from "./Starfield";
import { useEffect } from "react";

type BackgroundConfig = "far" | "medium" | "close";

interface GlobeBackgroundProps {
  onReady?: () => void;
  backgroundConfig: BackgroundConfig;
}

const CONFIGS: Record<
  BackgroundConfig,
  {
    camera: [number, number, number];
    target: [number, number, number];
    rotationSpeed: number;
  }
> = {
  far: { camera: [120, 0, 3.2], target: [0, 0, 0], rotationSpeed: 0.5 },
  medium: { camera: [5, 0, 3.2], target: [2.0, 0.1, 0], rotationSpeed: 1.2 },
  close: { camera: [0, 0, 3.2], target: [0, 0, 0], rotationSpeed: 0.5 },
};

export function GlobeBackground({
  onReady,
  backgroundConfig,
}: GlobeBackgroundProps) {
  useEffect(() => {
    onReady?.();
  }, []);

  const showEarth = backgroundConfig !== "far";

  return (
    <Canvas
      camera={{
        position: CONFIGS[backgroundConfig].camera,
        fov: 45,
        near: 0.01,
        far: 1000,
      }}
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
      <Starfield count={30000} />

      {/* Earth */}
      {showEarth && (
        <Suspense fallback={<EarthFallback />}>
          <Earth />
        </Suspense>
      )}

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={CONFIGS[backgroundConfig].rotationSpeed}
        dampingFactor={0.08}
        enableDamping
        target={CONFIGS[backgroundConfig].target}
      />

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
