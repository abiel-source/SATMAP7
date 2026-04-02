//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - AUTHOR NOTES - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// All propagation computations exist here:
// Coordinate space translations, physics computations, and format caching

//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import * as satellite from "satellite.js";
import type {
  SatelliteRecord,
  PropagatedSatellite,
  OrbitTrailPoint,
} from "@/types/satellite";

const EARTH_RADIUS_KM = 6371;
// Earth becomes the unit sphere
const SCENE_RADIUS = 1.0;
// scale to scene coordinates
const SCALE = SCENE_RADIUS / EARTH_RADIUS_KM;

// ------------------------------------------------------------------------------
// Parse TLE lines into a satrec (cached per satellite) -------------------------
// ------------------------------------------------------------------------------
// Per-session caching: Store the internal SatRec format for every satellite

// NOTE: converting from SatelliteRecord to SatRec is expensive! It requires invoking
// twoline2satrec(...). Avoid redundant calls by caching the format.
const satrec_cache = new Map<number, satellite.SatRec>();

// Get SatRec format cache-first and twoline2satrec last
export function getSatrec(sat: SatelliteRecord): satellite.SatRec | null {
  const cached = satrec_cache.get(sat.noradId);
  if (cached) return cached;

  try {
    const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
    satrec_cache.set(sat.noradId, satrec);
    return satrec;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------------------
// ECI (km) → Three.js scene coords ---------------------------------------------
// ------------------------------------------------------------------------------
// Three.js is Y-up. ECI is Z-up. We remap: scene(x,y,z) = eci(x,z,y) * scale
// Also normalizes the data to scene scale.
export function eciToScene(
  pos: satellite.EciVec3<number>
): [number, number, number] {
  return [pos.x * SCALE, pos.z * SCALE, pos.y * SCALE];
}

// ------------------------------------------------------------------------------
// Propagate a single satellite at a given Date ---------------------------------
// ------------------------------------------------------------------------------
// DATA RECEIVED:
// Receive:
// 1) a SatelliteRecord and
// 2) target Date

// CORE ENGINE:
// Populate satrec_cache which stores translations from TLE1 & TLE2 into ECI format
// Convert from cached interal ECI coordinate space to scene space:

// 1) SGP4 does most of the work with propagate()
// 1.1) If SGP4 fails, it returns false, not a vector - check this
// 1.2) On success, SGP4 returns a position + velocity in ECI space
// 2) Compute Greenwich Mean Sidereal Time (GMST) for target Date
// 3) Compute Geodetic coordinates from ECI position + GMST
// 3.1) Geodetic coordinates are: latitude, longitude, and altitude above the ellipsoid
// 4) Velocity magnitude simple Pythagorean theorem
// 5) Now we have:
// --> scene position & velocity magnitude
// --> lat/long degree coordinates & altitude

// NOTE: lat/lon help us reverse the Earth rotation when placing it onto the scene
// thats why GMST is required- we need to know what angle/how much Earth spun.

export function propagateOne(
  sat: SatelliteRecord,
  date: Date
): Omit<PropagatedSatellite, keyof SatelliteRecord> | null {
  const satrec = getSatrec(sat);
  if (!satrec) return null;

  try {
    const pv = satellite.propagate(satrec, date);
    if (
      !pv?.position ||
      typeof (pv?.position as satellite.EciVec3<number>).x !== "number"
    ) {
      return null;
    }

    const pos = pv.position as satellite.EciVec3<number>;
    const vel = pv.velocity as satellite.EciVec3<number>;
    const gmst = satellite.gstime(date);
    const geo = satellite.eciToGeodetic(pos, gmst);

    const velocityKmS = vel
      ? Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2)
      : 0;

    return {
      position: eciToScene(pos),
      latDeg: satellite.degreesLat(geo.latitude),
      lonDeg: satellite.degreesLong(geo.longitude),
      altKm: geo.height,
      velocityKmS,
      visible: true,
    };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------------------
// Batch propagate an array of satellites ---------------------------------------
// ------------------------------------------------------------------------------

// NOTE ON TYPES:
// Using spread:
// Omit<PropagatedSatellite, keyof SatelliteRecord> + SatelliteRecord = PropagatedSatellite

export function propagateBatch(
  satellites_: SatelliteRecord[],
  date: Date
): PropagatedSatellite[] {
  const out: PropagatedSatellite[] = [];
  for (const sat of satellites_) {
    const result = propagateOne(sat, date);
    if (result) {
      out.push({ ...sat, ...result });
    } else {
      console.log("CATASTROPHIC::Alignment Error: failed propagation");
      console.error("CATASTROPHIC::Alignment Error: failed propagation");
    }
  }
  return out;
}

// ------------------------------------------------------------------------------
// Compute historical trail (last N minutes, sampled every 30s) -----------------
// ------------------------------------------------------------------------------

// 90 minutes is about 1 full orbital period.
// Compute polyline from ~1 orbital period 90 minutes ago to now with dots every 30 seconds

export function computeHistoryTrail(
  sat: SatelliteRecord,
  endDate: Date,
  durationMinutes: number = 90,
  stepSeconds: number = 30
): OrbitTrailPoint[] {
  const satrec = getSatrec(sat);
  if (!satrec) return [];

  const points: OrbitTrailPoint[] = [];
  const endMs = endDate.getTime();
  const startMs = endMs - durationMinutes * 60 * 1000;
  const stepMs = stepSeconds * 1000;

  for (let t = startMs; t <= endMs; t += stepMs) {
    const date = new Date(t);
    try {
      const pv = satellite.propagate(satrec, date);
      if (
        !pv?.position ||
        typeof (pv?.position as satellite.EciVec3<number>).x !== "number"
      )
        continue;
      const pos = pv.position as satellite.EciVec3<number>;
      points.push({ position: eciToScene(pos), timestamp: t });
    } catch {
      /* skip bad points */
    }
  }

  return points;
}

// ------------------------------------------------------------------------------
// Compute full orbital period path ---------------------------------------------
// ------------------------------------------------------------------------------

// goes forward only.

export function computeFullOrbit(
  sat: SatelliteRecord,
  startDate: Date,
  stepSeconds: number = 60
): OrbitTrailPoint[] {
  const satrec = getSatrec(sat);
  if (!satrec) return [];

  // Orbital period in minutes = 1440 / meanMotion (rev/day)
  const periodMinutes = sat.meanMotion > 0 ? 1440 / sat.meanMotion : 90;
  const totalMs = periodMinutes * 60 * 1000;
  const stepMs = stepSeconds * 1000;

  const points: OrbitTrailPoint[] = [];
  const startMs = startDate.getTime();

  for (let t = startMs; t <= startMs + totalMs; t += stepMs) {
    const date = new Date(t);
    try {
      const pv = satellite.propagate(satrec, date);
      if (
        !pv?.position ||
        typeof (pv?.position as satellite.EciVec3<number>).x !== "number"
      )
        continue;
      const pos = pv.position as satellite.EciVec3<number>;
      points.push({ position: eciToScene(pos), timestamp: t });
    } catch {
      /* skip */
    }
  }

  return points;
}

// ------------------------------------------------------------------------------
// Orbit class helper: LEO / MEO / GEO ------------------------------------------
// ------------------------------------------------------------------------------

// Utility function that converts altitude to standard orbit classification.

export function classifyOrbit(altKm: number): "LEO" | "MEO" | "GEO" | "HEO" {
  if (altKm < 2000) return "LEO";
  if (altKm < 35000) return "MEO";
  if (altKm < 36500) return "GEO";
  return "HEO";
}
