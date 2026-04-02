import { NextRequest, NextResponse } from "next/server";
import { fetchCategory } from "@/lib/satellite/fetcher";
import { getCachedGroup, setCachedGroup, getCacheTTL } from "@/lib/cache/redis";
import type { SatelliteCategory } from "@/types/satellite";
import { CATEGORY_META } from "@/types/satellite";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as SatelliteCategory | null;

  if (!category || !(category in CATEGORY_META)) {
    return NextResponse.json(
      { error: "Missing or invalid ?category= param" },
      { status: 400 }
    );
  }

  // Try cache first
  const cached = await getCachedGroup(category);
  if (cached) {
    return NextResponse.json({
      satellites: cached,
      category,
      count: cached.length,
      cachedAt: new Date().toISOString(),
      ttl: getCacheTTL(),
      source: "cache",
    });
  }

  // Fetch from CelesTrak
  try {
    const satellites = await fetchCategory(category);
    await setCachedGroup(category, satellites);

    return NextResponse.json({
      satellites,
      category,
      count: satellites.length,
      cachedAt: new Date().toISOString(),
      ttl: getCacheTTL(),
      source: "celestrak",
    });
  } catch (err) {
    console.error("[/api/satellites] fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch satellite data", detail: String(err) },
      { status: 502 }
    );
  }
}
