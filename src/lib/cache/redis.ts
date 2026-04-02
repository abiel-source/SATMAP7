//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - AUTHOR NOTES - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// NOTE ON UPSTASH:
// upstash communicates across the application layer (works over plain HTTPS)
// avoids TCP connection. Makes it easy to deploy on Vercel. Vercel does NOT
// allow persistent connections like TCP.

// FALLBACK CACHE:
// fallback dictionary is implemented in case that Redis isnt configured.
// every function checks if the cache is null -- which then uses the dictionary fallback.
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import { Redis } from "@upstash/redis";
import type { SatelliteRecord, SatelliteCategory } from "@/types/satellite";

// ------------------------------------------------------------------------------
// Singleton Redis client -------------------------------------------------------
// ------------------------------------------------------------------------------
// Falls back gracefully if env vars are missing (dev without Redis)
// declaring at module scope ensures a single Redis client REGARDLESS of the # of API requests.
// DO NOT CREATE A NEW CLIENT FOR EVERY API REQUEST!
let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    console.warn("[cache] Upstash env vars not set — using in-memory fallback");
    return null;
  }
  _redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return _redis;
}

// ------------------------------------------------------------------------------
// In-memory fallback (dev / missing Redis) -------------------------------------
// ------------------------------------------------------------------------------
const memCache = new Map<string, { value: unknown; expiresAt: number }>();

function memGet<T>(key: string): T | null {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function memSet(key: string, value: unknown, ttlSeconds: number): void {
  memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

// ------------------------------------------------------------------------------
// Cache TTL --------------------------------------------------------------------
// ------------------------------------------------------------------------------
// 1800 seconds = 30 minutes
// CelesTrak gets at most 1 request per category every 30 minutes
// OR at most 7 requests every 30 minutes
const TTL = parseInt(process.env.CACHE_TTL_SECONDS ?? "1800", 10);

// store images for up to a week
const MEDIA_TTL = parseInt(process.env.CACHE_MEDIA_TTL_SECONDS ?? "604800", 10);

// ------------------------------------------------------------------------------
// Key helpers ------------------------------------------------------------------
// ------------------------------------------------------------------------------
const KEYS = {
  group: (cat: SatelliteCategory) => `satmap:group:${cat}`,
  groupMeta: () => "satmap:groups:meta",
  search: (q: string) => `satmap:search:${q.toLowerCase().trim()}`,
  media: (noradId: string) => `satmap:media:${noradId}`,
};

// ------------------------------------------------------------------------------
// Public API -------------------------------------------------------------------
// ------------------------------------------------------------------------------
// GET PATTERN: build key --> try reading from redis OR fallback to memCache
// SET PATTERN: build key --> try writing to redis OR fallback to memCache

// note that the search api is the same but with a shorter TTL (5 minutes)
// and getCacheTTL() is only used for the JSON response
export async function getCachedGroup(
  category: SatelliteCategory
): Promise<SatelliteRecord[] | null> {
  const key = KEYS.group(category);
  const redis = getRedis();

  if (redis) {
    try {
      const raw = await redis.get<SatelliteRecord[]>(key);
      return raw ?? null;
    } catch (e) {
      console.error("[cache] Redis get error:", e);
    }
  }

  return memGet<SatelliteRecord[]>(key);
}

export async function setCachedGroup(
  category: SatelliteCategory,
  satellites: SatelliteRecord[]
): Promise<void> {
  const key = KEYS.group(category);
  const redis = getRedis();

  if (redis) {
    try {
      await redis.set(key, satellites, { ex: TTL });
      return;
    } catch (e) {
      console.error("[cache] Redis set error:", e);
    }
  }

  memSet(key, satellites, TTL);
}

export async function getCachedMeta(): Promise<Record<
  string,
  { count: number; cachedAt: string }
> | null> {
  const key = KEYS.groupMeta();
  const redis = getRedis();

  if (redis) {
    try {
      return await redis.get(key);
    } catch {
      return null;
    }
  }
  return memGet(key);
}

export async function setCachedMeta(
  meta: Record<string, { count: number; cachedAt: string }>
): Promise<void> {
  const key = KEYS.groupMeta();
  const redis = getRedis();

  if (redis) {
    try {
      await redis.set(key, meta, { ex: TTL });
      return;
    } catch (e) {
      console.error("[cache] Redis meta set error:", e);
    }
  }
  memSet(key, meta, TTL);
}

export async function getCachedSearch(
  query: string
): Promise<SatelliteRecord[] | null> {
  const key = KEYS.search(query);
  const redis = getRedis();

  if (redis) {
    try {
      return await redis.get(key);
    } catch {
      return null;
    }
  }
  return memGet(key);
}

export async function setCachedSearch(
  query: string,
  results: SatelliteRecord[]
): Promise<void> {
  const key = KEYS.search(query);
  const redis = getRedis();
  const searchTTL = 300; // 5 min for search results

  if (redis) {
    try {
      await redis.set(key, results, { ex: searchTTL });
      return;
    } catch {
      /* fallthrough */
    }
  }
  memSet(key, results, searchTTL);
}

export async function getCachedMedia(
  noradId: string
): Promise<Record<string, unknown> | null> {
  const key = KEYS.media(noradId);
  const redis = getRedis();

  if (redis) {
    try {
      return await redis.get(key);
    } catch {
      return null;
    }
  }

  return memGet(key);
}

// payload is the descriptor media NOT the image media
// see the corresponding route for the correct payload shape
export async function setCachedMedia(
  noradId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const key = KEYS.media(noradId);
  const redis = getRedis();

  if (redis) {
    try {
      await redis.set(key, payload, { ex: MEDIA_TTL });
      return;
    } catch (e) {
      console.error("[cache] Redis media set error:", e);
    }
  }

  memSet(key, payload, MEDIA_TTL);
}

export function getCacheTTL(): number {
  return TTL;
}
