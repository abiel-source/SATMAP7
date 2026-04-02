import { NextRequest, NextResponse } from "next/server";
import { getCachedMedia, setCachedMedia } from "@/lib/cache/redis";

// ---------------------------------------------------------------------------
// Payload shape -------------------------------------------------------------
// ---------------------------------------------------------------------------
export interface SatelliteMediaPayload {
  noradId: string;
  description: string | null;
}

// ---------------------------------------------------------------------------
// satcat.com descriptor for a given NORAD ID --------------------------------
// ---------------------------------------------------------------------------
async function scrapeDescription(noradId: string): Promise<string | null> {
  const url = `https://www.satcat.com/sats/${noradId}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "SATMAP7-SatelliteTracker/1.0" },
  });

  if (!res.ok) return null;

  const html = await res.text();

  // meta has tag description
  const match = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
  );
  const description = match?.[1] ?? null;
  return description;
}

// ---------------------------------------------------------------------------
// GET /api/satellite-media?noradId=XYZ -----------------------------
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const noradId = searchParams.get("noradId");

  if (!noradId) {
    return NextResponse.json(
      { error: "Missing required param: noradId" },
      { status: 400 }
    );
  }

  // always check redis first
  const cached = await getCachedMedia(noradId);
  if (cached) {
    return NextResponse.json({ ...cached, source: "cache" });
  }

  // request satcat.com
  const description = await scrapeDescription(noradId);

  const payload: SatelliteMediaPayload = {
    noradId,
    description,
  };

  // cache result
  await setCachedMedia(noradId, payload as unknown as Record<string, unknown>);

  return NextResponse.json({
    ...payload,
    source: description ? "satcat" : "none",
  });
}
