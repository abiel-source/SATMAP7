//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - AUTHOR NOTES - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// SERVER UTILITY FOR FETCHING DATA FROM CelesTrak
// CelesTrak <--> fetcher.ts <--> redis.ts <--> API routes <--> components

// NOTE ON DATA CAPS:
// 1) Category-specific cap is stored in CATEGORY_META
// 2) Global cap is stored as an environment variable
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import type {
  CelestrakGPElement,
  SatelliteRecord,
  SatelliteCategory,
  CATEGORY_META,
} from "@/types/satellite";

// don't forget this is a runtime value
import { CATEGORY_META as META } from "@/types/satellite";

// root URL for CelesTrak's General Perturbations API
const CELESTRAK_GP_BASE = "https://celestrak.org/NORAD/elements/gp.php";
const MAX_SATS = parseInt(process.env.MAX_SATS_PER_GROUP ?? "500", 10);

// ------------------------------------------------------------------------------
// PRIVATE: Parse a raw TLE text body into CelestrakGPElement objects -----------
// ------------------------------------------------------------------------------
// CelesTrak TLE format:
//    Line 0: object name
//    Line 1: TLE line 1  (starts with "1 ")
//    Line 2: TLE line 2  (starts with "2 ")
//
// TLE LINE 1 columns:
//    02-06  NORAD catalog number
//    09-16  International designator (OBJECT_ID)
//    18-31  Epoch (YYDDD.DDDDDDDD)
//
// TLE LINE 2 columns:
//    08-15  Inclination [deg]
//    17-24  RAAN [deg]
//    26-32  Eccentricity (leading "0.")
//    34-41  Argument of perigee [deg]
//    43-50  Mean anomaly [deg]
//    52-62  Mean motion [rev/day]
//    63-67  Revolution number at epoch

function parseTLEText(text: string): CelestrakGPElement[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: CelestrakGPElement[] = [];

  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name = lines[i];
    const tle1 = lines[i + 1];
    const tle2 = lines[i + 2];

    // Guard: confirm line identifiers before parsing
    if (!tle1.startsWith("1 ") || !tle2.startsWith("2 ")) continue;

    // -----------------------------------
    // -------- TLE LINE 1 fields --------
    // -----------------------------------
    const noradId = parseInt(tle1.substring(2, 7).trim(), 10);
    const objectId = tle1.substring(9, 17).trim(); // international designator

    // Epoch: YYDDD.DDDDDDDD --> convert to ISO string
    const epochRaw = tle1.substring(18, 32).trim();
    const twoDigitYear = parseInt(epochRaw.substring(0, 2), 10);
    // NASA/CelesTrak convention: years 00-56 --> 2000s, 57-99 --> 1900s
    const fullYear =
      twoDigitYear < 57 ? 2000 + twoDigitYear : 1900 + twoDigitYear;
    const dayOfYear = parseFloat(epochRaw.substring(2)); // e.g. 083.48628161
    const epochDate = new Date(Date.UTC(fullYear, 0, 1));
    epochDate.setUTCMilliseconds(
      epochDate.getUTCMilliseconds() + (dayOfYear - 1) * 86_400_000
    );

    // -----------------------------------
    // -------- TLE LINE 2 fields --------
    // -----------------------------------
    const inclination = parseFloat(tle2.substring(8, 16).trim());
    const raOfAscNode = parseFloat(tle2.substring(17, 25).trim());
    // Eccentricity: stored WITHOUT leading "0." — must prepend it
    const eccentricity = parseFloat("0." + tle2.substring(26, 33).trim());
    const argOfPericenter = parseFloat(tle2.substring(34, 42).trim());
    const meanAnomaly = parseFloat(tle2.substring(43, 51).trim());
    const meanMotion = parseFloat(tle2.substring(52, 63).trim());
    const revAtEpoch = parseInt(tle2.substring(63, 68).trim(), 10);

    results.push({
      OBJECT_NAME: name,
      OBJECT_ID: objectId,
      NORAD_CAT_ID: noradId,
      OBJECT_TYPE: "",
      OPERATIONAL_STATUS: "unknown",
      INCLINATION: inclination,
      RA_OF_ASC_NODE: raOfAscNode,
      ECCENTRICITY: eccentricity,
      ARG_OF_PERICENTER: argOfPericenter,
      MEAN_ANOMALY: meanAnomaly,
      MEAN_MOTION: meanMotion,
      BSTAR: 0,
      MEAN_MOTION_DOT: 0,
      MEAN_MOTION_DDOT: 0,
      EPOCH: epochDate.toISOString(),
      REV_AT_EPOCH: revAtEpoch,
      ELEMENT_SET_NO: 0,
      TLE_LINE1: tle1,
      TLE_LINE2: tle2,
    });
  }

  return results;
}

// ------------------------------------------------------------------------------
// PRIVATE: Fetch raw GP data from CelesTrak ------------------------------------
// ------------------------------------------------------------------------------
async function fetchGPGroup(group: string): Promise<CelestrakGPElement[]> {
  // FORMAT=TLE returns a plain-text 3-line-per-satellite format that includes
  // the actual TLE strings needed by satellite.js for SGP4 propagation.
  // FORMAT=json omits TLE_LINE1/TLE_LINE2 entirely (GP orbital elements only).
  const url = `${CELESTRAK_GP_BASE}?GROUP=${group}&FORMAT=TLE`;

  // tell CelesTrak who I am
  const res = await fetch(url, {
    headers: { "User-Agent": "SATMAP7-SatelliteTracker/1.0" },
    // Next.js caches fetches at application layer (tertiary level of cache on top of redis)
    // enforce cache every 1800 seconds (30 minutes) to match Redis
    next: { revalidate: parseInt(process.env.CACHE_TTL_SECONDS ?? "1800", 10) },
  });

  // catches HTTP errors (404, 429 rate limit, 500 server error)
  // Dont forget that only 2xx error codes are good
  if (!res.ok) {
    throw new Error(
      `CelesTrak fetch failed for group "${group}": HTTP ${res.status}`
    );
  }

  const text = await res.text();
  return parseTLEText(text);
}

// ------------------------------------------------------------------------------
// PRIVATE: Normalize a raw GP element into our SatelliteRecord --------------------------
// ------------------------------------------------------------------------------
// CelestrakGPElement --> SatelliteRecord involves:
// 1) converting ALL_CAPS fields to camelCase
// 2) augmenting missing fields to ensure consistent data shape
// 3) filter our satellites with required information (norad ID and TLE)
function normalize(
  el: CelestrakGPElement,
  category: SatelliteCategory
): SatelliteRecord | null {
  // Both TLE lines are required for propagation
  if (!el.TLE_LINE1 || !el.TLE_LINE2) return null;
  if (!el.NORAD_CAT_ID || !el.EPOCH) return null;

  return {
    noradId: el.NORAD_CAT_ID,
    name: (el.OBJECT_NAME ?? "UNKNOWN").trim(),
    objectId: el.OBJECT_ID ?? "",
    category,
    tle1: el.TLE_LINE1,
    tle2: el.TLE_LINE2,
    inclination: el.INCLINATION ?? 0,
    eccentricity: el.ECCENTRICITY ?? 0,
    meanMotion: el.MEAN_MOTION ?? 0,
    epoch: el.EPOCH,
    operationalStatus: el.OPERATIONAL_STATUS ?? "unknown",
  };
}

// ------------------------------------------------------------------------------
// PUBLIC: fetch + normalize a single category ----------------------------------
// ------------------------------------------------------------------------------
// Handle request for satellite group fetch: fetch & normalize received data from CelesTrak
export async function fetchCategory(
  category: SatelliteCategory
): Promise<SatelliteRecord[]> {
  const { celestrakGroup, maxCount } = META[category];
  const limit = Math.min(maxCount, MAX_SATS);

  const raw = await fetchGPGroup(celestrakGroup);

  const records: SatelliteRecord[] = [];
  for (const el of raw) {
    if (records.length >= limit) break;
    const record = normalize(el, category);
    if (record) records.push(record);
  }

  return records;
}

// ------------------------------------------------------------------------------
// PUBLIC: fetch all categories (used by /api/groups warm-up) -------------------
// ------------------------------------------------------------------------------
// Handle request for satellite batch fetch:
export async function fetchAllCategories(): Promise<
  Record<SatelliteCategory, SatelliteRecord[]>
> {
  const categories = Object.keys(META) as SatelliteCategory[];

  // Promise.allSettled always resolves:
  // waits for each promise to succeed or fail and gives you an array of
  // per-promise result. Much more flexible than Promise.all
  const results = await Promise.allSettled(
    categories.map(async (cat) => ({ cat, records: await fetchCategory(cat) }))
  );

  const out = {} as Record<SatelliteCategory, SatelliteRecord[]>;
  for (const result of results) {
    if (result.status === "fulfilled") {
      out[result.value.cat] = result.value.records;
    } else {
      console.error("[fetcher] Category fetch failed:", result.reason);
    }
  }
  return out;
}

// ------------------------------------------------------------------------------
// PUBLIC: search across a pre-fetched flat list --------------------------------
// ------------------------------------------------------------------------------
// Used by /api/search...
// Conenvient to put here, but may belong better in some utility file
export function searchSatellites(
  satellites: SatelliteRecord[],
  query: string
): SatelliteRecord[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return satellites
    .filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        String(s.noradId).includes(q) ||
        s.objectId.toLowerCase().includes(q)
      );
    })
    .slice(0, 50);
}
