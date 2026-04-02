import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_META } from "@/types/satellite";
import type { SatelliteCategory, SatelliteRecord } from "@/types/satellite";
import { getCachedGroup, setCachedGroup, getCachedSearch, setCachedSearch } from "@/lib/cache/redis";
import { fetchCategory, searchSatellites } from "@/lib/satellite/fetcher";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [], query, total: 0 });
  }

  // Try search cache
  const cachedResults = await getCachedSearch(query);
  if (cachedResults) {
    return NextResponse.json({
      results: cachedResults,
      query,
      total: cachedResults.length,
      source: "cache",
    });
  }

  // Load all category caches (or fetch if needed)
  const categories = Object.keys(CATEGORY_META) as SatelliteCategory[];
  const allSatellites: SatelliteRecord[] = [];

  await Promise.allSettled(
    categories.map(async (cat) => {
      let records = await getCachedGroup(cat);
      if (!records) {
        records = await fetchCategory(cat);
        await setCachedGroup(cat, records);
      }
      allSatellites.push(...records);
    })
  );

  const results = searchSatellites(allSatellites, query);
  await setCachedSearch(query, results);

  return NextResponse.json({ results, query, total: results.length, source: "live" });
}
