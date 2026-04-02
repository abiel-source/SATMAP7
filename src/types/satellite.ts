//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - AUTHOR NOTES - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// 1) Receive raw JSON from CelesTrak
// 2) Normalize data into SatelliteRecord
// 3) Cache & Store records
// 4) Send cached records on request through custom API
// 5) Client/browser propagates & renders records OR requests detailed views on a record
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// ------------------------------------------------------------------------------
// Raw CelesTrak GP JSON element ------------------------------------------------
// ------------------------------------------------------------------------------
// DEPRECATED: Should be removed in version 2.0
// incoming data is no longer JSON and uses raw TLE instead.
// Remove CelestrakGPElement, Add new TLE format instead and populate SatelliteRecord directly SOON...
export interface CelestrakGPElement {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  NORAD_CAT_ID: number;
  OBJECT_TYPE: string;
  OPERATIONAL_STATUS: string;
  INCLINATION: number;
  RA_OF_ASC_NODE: number;
  ECCENTRICITY: number;
  ARG_OF_PERICENTER: number;
  MEAN_ANOMALY: number;
  MEAN_MOTION: number;
  BSTAR: number;
  MEAN_MOTION_DOT: number;
  MEAN_MOTION_DDOT: number;
  EPOCH: string;
  REV_AT_EPOCH: number;
  ELEMENT_SET_NO: number;
  TLE_LINE1?: string;
  TLE_LINE2?: string;
}

// ------------------------------------------------------------------------------
// Normalized satellite record (stored in Redis, sent to client) ----------------
// ------------------------------------------------------------------------------
export interface SatelliteRecord {
  noradId: number;
  name: string;
  objectId: string;
  category: SatelliteCategory;
  tle1: string;
  tle2: string;
  inclination: number;
  eccentricity: number;
  meanMotion: number; // rev/day
  epoch: string; // ISO string
  operationalStatus: string;
}

// ------------------------------------------------------------------------------
// Categories -------------------------------------------------------------------
// ------------------------------------------------------------------------------
export type SatelliteCategory =
  | "starlink"
  | "oneweb"
  | "stations"
  | "weather"
  | "navigation"
  | "debris"
  | "other";

export const CATEGORY_META: Record<
  SatelliteCategory,
  {
    label: string;
    color: string;
    hexColor: number;
    celestrakGroup: string;
    maxCount: number;
  }
> = {
  starlink: {
    label: "Starlink",
    color: "#00c8ff",
    hexColor: 0x00c8ff,
    celestrakGroup: "starlink",
    maxCount: 500,
  },
  oneweb: {
    label: "OneWeb",
    color: "#a78bfa",
    hexColor: 0xa78bfa,
    celestrakGroup: "oneweb",
    maxCount: 300,
  },
  stations: {
    label: "Space Stations",
    color: "#39ff14",
    hexColor: 0x39ff14,
    celestrakGroup: "stations",
    maxCount: 50,
  },
  weather: {
    label: "Weather",
    color: "#fbbf24",
    hexColor: 0xfbbf24,
    celestrakGroup: "weather",
    maxCount: 200,
  },
  navigation: {
    label: "Navigation/GPS",
    color: "#fb923c",
    hexColor: 0xfb923c,
    celestrakGroup: "gps-ops",
    maxCount: 100,
  },
  debris: {
    label: "Debris",
    color: "#475569",
    hexColor: 0x475569,
    celestrakGroup: "cosmos-2251-debris",
    maxCount: 300,
  },
  other: {
    label: "Other Active",
    color: "#94a3b8",
    hexColor: 0x94a3b8,
    celestrakGroup: "active",
    maxCount: 400,
  },
};

export const CATEGORY_IMAGES: Record<SatelliteCategory, string> = {
  starlink:
    "https://upload.wikimedia.org/wikipedia/commons/d/d0/Starlink_01.webp",
  oneweb:
    "https://upload.wikimedia.org/wikipedia/commons/c/cd/At_the_Science_Museum%2C_London_2025_125.jpg",
  stations:
    "https://upload.wikimedia.org/wikipedia/commons/5/5f/ISS-38_NanoRacks_CubeSat_Deployment_Iss038e046579.jpg",
  weather:
    "https://upload.wikimedia.org/wikipedia/commons/4/44/Arctic_Weather_Satellite_ESA23198428.jpeg",
  navigation:
    "https://upload.wikimedia.org/wikipedia/commons/4/49/GPS_Block_IIIA.jpg",
  debris:
    "https://upload.wikimedia.org/wikipedia/commons/f/ff/Space_debris_GIF_ESA380488.gif",
  other: "https://upload.wikimedia.org/wikipedia/commons/8/8e/SORCE.jpg",
};

// ------------------------------------------------------------------------------
// API response shapes ----------------------------------------------------------
// ------------------------------------------------------------------------------
export interface GroupsApiResponse {
  groups: {
    category: SatelliteCategory;
    label: string;
    count: number;
    color: string;
  }[];
  totalCount: number;
  cachedAt: string;
}

export interface SatellitesApiResponse {
  satellites: SatelliteRecord[];
  category: SatelliteCategory;
  count: number;
  cachedAt: string;
  ttl: number;
}

export interface SearchApiResponse {
  results: SatelliteRecord[];
  query: string;
  total: number;
}

export interface SatelliteDetailResponse {
  satellite: SatelliteRecord;
  computedAt: string;
  position: {
    latDeg: number;
    lonDeg: number;
    altKm: number;
  };
  velocity: {
    kmPerSec: number;
  };
}

// ------------------------------------------------------------------------------
// Client-side propagated position ----------------------------------------------
// ------------------------------------------------------------------------------
export interface PropagatedSatellite extends SatelliteRecord {
  position: [number, number, number]; // Three.js scene coords
  latDeg: number;
  lonDeg: number;
  altKm: number;
  velocityKmS: number;
  visible: boolean;
}

// ------------------------------------------------------------------------------
// Orbit trail types ------------------------------------------------------------
// ------------------------------------------------------------------------------
export type TrailMode = "none" | "history" | "full-orbit" | "both";

export interface OrbitTrailPoint {
  position: [number, number, number];
  timestamp: number;
}
