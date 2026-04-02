"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function Starfield({ count = 6000 }: { count?: number }) {
  const { geometry } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 80 + Math.random() * 120;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      opacities[i] = 0.4 + Math.random() * 0.6;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry: geo };
  }, [count]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#ffffff"
        size={0.15}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}
