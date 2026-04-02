"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSatMapStore } from "@/store/satmapStore";

interface CameraControllerProps {
  controlsRef: React.RefObject<{
    update: () => void;
    addEventListener: (event: string, callback: () => void) => void;
    removeEventListener: (event: string, callback: () => void) => void;
  } | null>;
}

export function CameraController({ controlsRef }: CameraControllerProps) {
  const { camera } = useThree();
  const selectedSatellite = useSatMapStore((s) => s.selectedSatellite);

  const targetPos = useRef<THREE.Vector3 | null>(null);
  const animating = useRef(false);

  useEffect(() => {
    if (!selectedSatellite) {
      animating.current = false;
      targetPos.current = null;
      return;
    }

    const propSat = useSatMapStore
      .getState()
      .propagated.get(selectedSatellite.noradId);
    if (!propSat) return;

    const satPos = new THREE.Vector3(...propSat.position);
    const satDist = satPos.length();
    const targetDist = satDist + 0.5;

    targetPos.current = satPos.normalize().multiplyScalar(targetDist);
    animating.current = true;
  }, [selectedSatellite, camera]);

  // manually cancel animation flag whenever user operates
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const cancel = () => {
      animating.current = false;
    };

    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controlsRef]);

  // interpolation is time dependent since alpah is a function of delta
  // this avoids making the interpolation dependent on frame rate
  //
  // alpha is a simple linear function of delta. Linear makes the animation as smooth as possible
  //
  // smaller threshold makes the animation finish smoother but may take longer to complete
  // (but the manual override allows the user to exit the animation freely)
  useFrame((_, delta) => {
    if (!animating.current || !targetPos.current) return;

    camera.position.lerp(targetPos.current, 1.5 * delta);
    controlsRef.current?.update();

    if (camera.position.distanceTo(targetPos.current) < 0.001) {
      camera.position.copy(targetPos.current);
      controlsRef.current?.update();
      animating.current = false;
    }
  });

  return null;
}
