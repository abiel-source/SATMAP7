"use client";

import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

// NASA Blue Marble textures (public domain)
const EARTH_TEXTURE = "/earth-day.jpg";
const EARTH_NIGHT = "/earth-night.jpg";
const EARTH_SPECULAR =
  "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73963/gebco_08_rev_elev_21600x10800.png";

const EARTH_RADIUS = 1.0;

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load textures
  const [dayTexture, nightTexture] = useLoader(TextureLoader, [
    EARTH_TEXTURE,
    EARTH_NIGHT,
  ]);

  // Custom shader material blending day/night
  const earthMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      sunDirection: { value: new THREE.Vector3(1, 0.3, 0.7).normalize() },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform vec3 sunDirection;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        float cosAngle = dot(vNormal, sunDirection);
        float dayMix = smoothstep(-0.2, 0.4, cosAngle);

        vec4 day   = texture2D(dayTexture, vUv);
        vec4 night = texture2D(nightTexture, vUv);

        // Brighten city lights on night side
        vec3 nightEnhanced = night.rgb * 2.5;
        vec3 color = mix(nightEnhanced, day.rgb, dayMix);

        // Subtle specular on ocean
        vec3 viewDir = normalize(cameraPosition - vPosition);
        vec3 halfDir = normalize(sunDirection + viewDir);
        float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0) * 0.15 * dayMix;
        color += vec3(spec);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  return (
    <group>
      {/* Main Earth sphere */}
      <mesh ref={meshRef} material={earthMaterial}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.02, 64, 64]} />
        <shaderMaterial
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          uniforms={{
            sunDirection: { value: new THREE.Vector3(1, 0.3, 0.7).normalize() },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 sunDirection;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              vec3 viewDir = normalize(cameraPosition - vPosition);
              float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
              float dayFactor = dot(vNormal, sunDirection) * 0.5 + 0.5;
              vec3 dayAtmo  = vec3(0.15, 0.45, 1.0);
              vec3 nightAtmo = vec3(0.05, 0.1, 0.4);
              vec3 atmoColor = mix(nightAtmo, dayAtmo, dayFactor);
              float alpha = pow(rim, 2.2) * 0.5;
              gl_FragColor = vec4(atmoColor, alpha);
            }
          `}
        />
      </mesh>

      {/* Lat/lon grid */}
      <LatLonGrid />
    </group>
  );
}

function LatLonGrid() {
  const material = new THREE.LineBasicMaterial({
    color: 0x1a3a5c,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  const R = EARTH_RADIUS * 1.001;
  const lines: THREE.Line[] = [];

  // Latitude lines every 30°
  for (let lat = -60; lat <= 60; lat += 30) {
    const phi = ((90 - lat) * Math.PI) / 180;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const lon = (i / 64) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          R * Math.sin(phi) * Math.cos(lon),
          R * Math.cos(phi),
          R * Math.sin(phi) * Math.sin(lon)
        )
      );
    }
    lines.push(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material)
    );
  }

  // Longitude lines every 30°
  for (let lon = 0; lon < 360; lon += 30) {
    const theta = (lon * Math.PI) / 180;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const phi = (i / 64) * Math.PI;
      points.push(
        new THREE.Vector3(
          R * Math.sin(phi) * Math.cos(theta),
          R * Math.cos(phi),
          R * Math.sin(phi) * Math.sin(theta)
        )
      );
    }
    lines.push(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material)
    );
  }

  return (
    <>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </>
  );
}
