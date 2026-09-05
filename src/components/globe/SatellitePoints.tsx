//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - AUTHOR NOTES - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// NOTE ON MEMORY: 2 copies of satellites, 1 copy of GPU-renderable satellites
// records --> zustand source of truth after initial API fetch (static)
// propagated --> zustand satellite map of satellite positions (dynamic) - components read this
// geometryBuffer/posArray --> GPU renders of satellites updated every second locally here

// NOTE ON custom raycast PROP:
// Temporarily sets the radius smaller to 0.012 scene units and restores default
// If theres a hit then our custom callbacks get called, which write to zustand

// NOTE ON pointsRef:
// pointsRef references to the <points> object
// it is required for performance since it allows updates whenever we want independent of React renders
// we use it in R3F's useFrame to (re)propagate and overwrite satellite positions each animation frame directly in pointsRef.current
// conceptually: move satellite redraws up from React state-like re-renders to animation frames

// OPTIMIZATION: ZUSTAND SUBSCRIPTION
// zustand subscription actually triggers re-renders...
// this is avoided by simply reading the propagated map - no susbcription

// OPTIMIZATION: THREE.JS BOUNDARY SPHERE
// avoid comuting boundary sphere for every animation loop. This is expensive as satellites scale.
// there's a trick to computing it once only, even as vertices mutate... See below

// OPTIMIZATION: SATELLITE PROPAGATION ANIMATION
// "Primary" satellite propagation occurs once per second (1 of 60 animation frames)
// including zustand read/write + batch propagation...

// Add "secondary" satellite propagation for animation only. (30~60 of animation frames)
// local GeometryBuffer overwrites only - NO zustand read/write NO batch propagation
// do FAST SIMPLE linear interpolation and/or linear algebra

// ---------------------------------------------------------------------------------------

// Possibly split "secondary" satellite propagation into an additional "tertiary" level.
// distinguish between batch propagation, zustand overwrite, and fast manual linear algebra.

// "Secondary" satellite propagation --> batch propagation without zustand overwrite
// "Teritary" satellite propagation --> manual linear algebra for direct buffer overwrite

// could even precompute buffer ahead of time (secondary propagation) and linearly interpolate
// between to target buffer for each remaining animation frame (tertiary propagation).

// DECIDE WHICH IS BEST...
// WAIT - the precompute ahead of time is superior...
// you only need to execute primary propagation ONCE in the initial frame!
// then you can store 2 position buffers - one for next and one for current
// then for each primary frame you just swap "next" and "current" then
// precompute "next" just once! The linear interpolation method should be smoother (in theory)
// than manual linear algebra. Woahhh
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSatMapStore } from "@/store/satmapStore";
import { propagateBatch } from "@/lib/satellite/propagation";
import type { SatelliteCategory, SatelliteRecord } from "@/types/satellite";
import { CATEGORY_META } from "@/types/satellite";

// How often to re-propagate (ms)
// const PROPAGATION_INTERVAL = 1000;
const PROPAGATION_INTERVAL = 500;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - VERTEX SHADER - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//    uScale       canvas height / 2, in CSS pixels
//    uPixelRatio  device pixel ratio
//    uMinPixels   floor, in CSS pixels
//    uMaxPixels   ceiling, in CSS pixels

const SAT_VERTEX_SHADER = `
  attribute float size;
  attribute vec3 satColor;

  uniform float uScale;
  uniform float uPixelRatio;
  uniform float uMinPixels;
  uniform float uMaxPixels;

  varying vec3 vColor;

  void main() {
    vColor = satColor;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // same perspective falloff PointsMaterial used - now with floor/ceiling bounds
    float attenuated = size * uScale / -mvPosition.z;
    gl_PointSize = clamp(attenuated, uMinPixels, uMaxPixels) * uPixelRatio;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - FRAGMENT SHADER - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//    uOpacity     master alpha, applied last
//
// gl_PointCoord is the position WITHIN the point sprite:
// (0,0) top-left to (1,1) bottom-right
//
// 3 overlapping bands from distance to center:
//    [0.00, 0.30] -> white center
//    [0.25, 0.60] -> category color
//    [0.45, 1.00] -> fade to nothing

const SAT_FRAGMENT_SHADER = `
  uniform float uOpacity;

  varying vec3 vColor;

  void main() {
    // 0.0 is center of the point; 1.0 is at its edge
    float d = length(gl_PointCoord - vec2(0.5)) * 2.0;

    // outside the inscribed circle where square corners never get drawn
    if (d > 1.0) discard;

    float core = 1.0 - smoothstep(0.0, 0.30, d);
    float body = 1.0 - smoothstep(0.25, 0.60, d);
    float glow = 1.0 - smoothstep(0.45, 1.0, d);

    // category color fades to white at the center
    vec3 color = mix(vColor, vec3(1.0), core);

    float alpha = clamp(body + glow * 0.45, 0.0, 1.0) * uOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`;
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface SatellitePointsProps {
  category: SatelliteCategory;
}

export function SatellitePoints({ category }: SatellitePointsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const lastPropTime = useRef(0);

  const records = useSatMapStore((s) => s.categories[category].records);
  const visible = useSatMapStore((s) => s.categories[category].visible);
  const hoveredSatellite = useSatMapStore((s) => s.hoveredSatellite);
  const setHovered = useSatMapStore((s) => s.setHovered);
  const setSelected = useSatMapStore((s) => s.setSelected);
  const setPropagated = useSatMapStore((s) => s.setPropagated);
  // const propagated = useSatMapStore((s) => s.propagated);

  const { camera, size: canvasSize, viewport } = useThree();

  const catColor = useMemo(
    () => new THREE.Color(CATEGORY_META[category].hexColor),
    [category],
  );

  // visual radius in scene units, BEFORE perspective falloff
  // a plain number, so it is safe in a dependency list without useMemo
  const pointSize = category === "stations" ? 0.045 : 0.02;

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SAT_VERTEX_SHADER,
        fragmentShader: SAT_FRAGMENT_SHADER,
        uniforms: {
          // placeholders; the effect below corrects them on mount and on resize
          uScale: { value: 400 },
          uPixelRatio: { value: 1 },

          uMinPixels: { value: category === "stations" ? 6.0 : 3.5 },
          uMaxPixels: { value: category === "stations" ? 30.0 : 16.0 },
          uOpacity: { value: 0.95 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    [category],
  );

  // Three derives these two internally for PointsMaterial. With a custom shader
  // we own them, and must resupply them or point size breaks on resize.
  useEffect(() => {
    material.uniforms.uScale.value = canvasSize.height * 0.5;
    material.uniforms.uPixelRatio.value = viewport.dpr;
  }, [material, canvasSize.height, viewport.dpr]);

  const earthSphere = useMemo(
    () => new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1.0),
    [],
  );

  // simple occlusion check is logically sufficient
  const isOccluded = useCallback(
    (position: [number, number, number]): boolean => {
      const satPos = new THREE.Vector3(...position);
      const dir = satPos.clone().sub(camera.position).normalize();
      const ray = new THREE.Ray(camera.position, dir);
      const hit = new THREE.Vector3();
      // ray never hits earth
      if (!ray.intersectSphere(earthSphere, hit)) return false;
      // ray hits earth; check if we hit the earth FIRST
      return (
        hit.distanceTo(camera.position) < satPos.distanceTo(camera.position)
      );
    },
    [camera, earthSphere],
  );

  // Build geometry buffers
  // CAUTION: posArray is never used. Geometry position rewrite is done by accessing geometry.attributes.position
  const { geometry, posArray } = useMemo(() => {
    const count = records.length;
    const geo = new THREE.BufferGeometry();

    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      cols[i * 3] = catColor.r;
      cols[i * 3 + 1] = catColor.g;
      cols[i * 3 + 2] = catColor.b;
      sizes[i] = pointSize;
    }

    // "satColor" NOT "color": three reserves the name `color` and declares it in
    // the shader prelude only when material.vertexColors is set. Owning a custom
    // name avoids both the duplicate-declaration and undeclared-identifier cases.
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("satColor", new THREE.BufferAttribute(cols, 3));

    // read by the vertex shader now; PointsMaterial ignored this attribute
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // manually compute the bounding sphere once
    // earth radius ~ 6,371km = 1.0 units
    // GEO distance ~ 35,786 = (35,786km + 6,371km / 6,371km) = 6.62 units
    // round to about 7 units for now (don't overdo it)
    //
    // max altitude may vary when new satellites are added
    // might actually be better to put this in the environment variables
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 7.0);

    return { geometry: geo, posArray: pos };
  }, [records, catColor, category, pointSize]);

  // main animation frame
  useFrame((_, delta) => {
    if (!pointsRef.current || !visible || records.length === 0) return;

    const now = performance.now();
    if (now - lastPropTime.current < PROPAGATION_INTERVAL) {
      // OPTIMIZATION: local BufferGeometry overwrites only
      // ...
      return;
    }
    lastPropTime.current = now;

    const date = new Date();
    const batch = propagateBatch(records, date);

    // Update positions
    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;

    // const nextPropagated = new Map(propagated);
    const nextPropagated = new Map(useSatMapStore.getState().propagated);

    for (let i = 0; i < batch.length; i++) {
      const p = batch[i];
      posAttr.setXYZ(i, p.position[0], p.position[1], p.position[2]);
      nextPropagated.set(p.noradId, p);
    }

    posAttr.needsUpdate = true;

    // MANUALLY RECOMPUTE: since geometry vertices (positions specifically) are modified
    // as stated in the docs: https://threejs.org/docs/#BufferGeometry.computeBoundingSphere
    // OPTIMIZED: https://discourse.threejs.org/t/boundingsphere-and-boundingbox/17868/2
    // pointsRef.current.geometry.computeBoundingSphere();

    setPropagated(nextPropagated);
  });

  // hover/select handlers
  const handlePointerMove = useCallback(
    (e: { index?: number }) => {
      if (e.index === undefined || !records[e.index]) {
        return;
      }
      const sat = records[e.index];
      const propSat = useSatMapStore.getState().propagated.get(sat.noradId);
      if (!propSat || isOccluded(propSat.position)) {
        return;
      }
      setHovered(sat);
    },
    [records, setHovered, isOccluded],
  );

  const handlePointerLeave = useCallback(() => {
    // if (hoveredSatellite?.category === category) {
    //   setHovered(null);
    // }

    setHovered(null);
  }, [setHovered, hoveredSatellite, category]);

  const handleClick = useCallback(
    (e: { index?: number }) => {
      if (e.index === undefined || !records[e.index]) {
        return;
      }
      const sat = records[e.index];
      const propSat = useSatMapStore.getState().propagated.get(sat.noradId);
      if (!propSat || isOccluded(propSat.position)) {
        return;
      }

      setSelected(sat);
    },
    [records, setSelected, isOccluded],
  );

  if (!visible || records.length === 0) return null;

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      // frustumCulled={false} // disables optimization; for testing only
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      raycast={(raycaster, intersects) => {
        if (!pointsRef.current) return;

        const threshold = category === "stations" ? 0.02 : 0.015;

        const params = raycaster.params.Points ?? { threshold: 1 };
        const originalThreshold = params.threshold;

        params.threshold = threshold;
        raycaster.params.Points = params;

        THREE.Points.prototype.raycast.call(
          pointsRef.current,
          raycaster,
          intersects,
        );

        params.threshold = originalThreshold;
        raycaster.params.Points = params;
      }}
    />
  );
}
