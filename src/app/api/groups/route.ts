import { NextResponse } from "next/server";
import { CATEGORY_META } from "@/types/satellite";
import type { SatelliteCategory } from "@/types/satellite";
import { getCachedGroup, setCachedGroup, getCachedMeta, setCachedMeta } from "@/lib/cache/redis";
import { fetchCategory } from "@/lib/satellite/fetcher";

export async function GET() {
  const categories = Object.keys(CATEGORY_META) as SatelliteCategory[];

  // Check meta cache first (fast path — just counts)
  const cachedMeta = await getCachedMeta();
  if (cachedMeta) {
    const groups = categories.map((cat) => ({
      category: cat,
      label: CATEGORY_META[cat].label,
      count: cachedMeta[cat]?.count ?? 0,
      color: CATEGORY_META[cat].color,
      cachedAt: cachedMeta[cat]?.cachedAt ?? new Date().toISOString(),
    }));
    return NextResponse.json({
      groups,
      totalCount: groups.reduce((s, g) => s + g.count, 0),
      cachedAt: new Date().toISOString(),
    });
  }

  // Warm all caches in parallel
  const results = await Promise.allSettled(
    categories.map(async (cat) => {
      let records = await getCachedGroup(cat);
      if (!records) {
        records = await fetchCategory(cat);
        await setCachedGroup(cat, records);
      }
      return { cat, count: records.length };
    })
  );

  const meta: Record<string, { count: number; cachedAt: string }> = {};
  const groups = [];
  let total = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { cat, count } = result.value;
      meta[cat] = { count, cachedAt: new Date().toISOString() };
      groups.push({
        category: cat as SatelliteCategory,
        label: CATEGORY_META[cat as SatelliteCategory].label,
        count,
        color: CATEGORY_META[cat as SatelliteCategory].color,
        cachedAt: new Date().toISOString(),
      });
      total += count;
    }
  }

  await setCachedMeta(meta);

  return NextResponse.json({
    groups,
    totalCount: total,
    cachedAt: new Date().toISOString(),
  });
}
