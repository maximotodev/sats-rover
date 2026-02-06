// apps/web/src/app/api/merchants/route.ts
import { NextResponse } from "next/server";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";

/**
 * Keep payloads small + predictable.
 * These numbers are conservative — tune later.
 */
const MAX_TAGS_KEYS = 60;
const MAX_KEY_LEN = 64;
const MAX_VALUE_LEN = 256;
const MAX_TOTAL_TAG_BYTES = 6_000; // ~6KB for tags per merchant

/**
 * Protect the browser + maplibre from huge payloads.
 * Prefer engine-side limit via /v1/places?limit=...
 */
const LIMIT = 600; // requested from engine
const HARD_MAX_MERCHANTS = 800; // final safety clamp if engine ignores limit

// Keys we allow through (exact match)
const TAG_ALLOWLIST_EXACT = new Set<string>([
  "name",
  "category",
  "icon:android",

  // payment flags
  "payment:lightning",
  "payment:lightning_contactless",
  "payment:onchain",
  "currency:XBT",

  // contact
  "contact:email",
  "contact:twitter",
  "contact:website",
  "website",

  // address
  "addr:housenumber",
  "addr:street",
  "addr:city",
  "addr:postcode",
  "addr:country",

  // misc
  "check_date",
  "check_date:currency:XBT",
  "boost:expires",
]);

// Prefixes we allow (useful if BTCMap/OSM adds variants)
const TAG_ALLOWLIST_PREFIXES = [
  "addr:",
  "contact:",
  "payment:",
  "currency:",
  "check_date",
  "boost:",
];

function isAllowedTagKey(k: string): boolean {
  if (TAG_ALLOWLIST_EXACT.has(k)) return true;
  return TAG_ALLOWLIST_PREFIXES.some((p) => k.startsWith(p));
}

function clampString(s: string, maxLen: number): string {
  const t = s.trim();
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}

function coerceSmallValue(v: any): string | number | boolean | null {
  if (v == null) return null;
  if (typeof v === "string") return clampString(v, MAX_VALUE_LEN);
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "boolean") return v;

  // Arrays/objects can explode payload size — stringify + clamp
  try {
    return clampString(JSON.stringify(v), MAX_VALUE_LEN);
  } catch {
    return null;
  }
}

function sanitizeTags(
  tags: Record<string, any> | null | undefined,
): Record<string, any> {
  if (!tags || typeof tags !== "object") return {};

  const out: Record<string, any> = {};
  let keys = 0;
  let totalBytes = 0;

  for (const [rawK, rawV] of Object.entries(tags)) {
    if (keys >= MAX_TAGS_KEYS) break;
    if (typeof rawK !== "string") continue;

    const k = clampString(rawK, MAX_KEY_LEN);
    if (!k || !isAllowedTagKey(k)) continue;

    const v = coerceSmallValue(rawV);
    if (v === null) continue;

    // compute incremental size budget (rough, but effective)
    const kvBytes = k.length + String(v).length + 4;
    if (totalBytes + kvBytes > MAX_TOTAL_TAG_BYTES) break;

    out[k] = v;
    totalBytes += kvBytes;
    keys += 1;
  }

  return out;
}

/**
 * IMPORTANT: Category should be computed from RAW tags, not sanitized tags.
 * Otherwise your allowlist might accidentally remove fields needed for category.
 */
function pickCategoryRaw(tags: Record<string, any> | null | undefined): string {
  if (!tags) return "merchant";

  // BTCMap often uses category=other/restaurant/etc
  if (typeof tags.category === "string" && tags.category.trim())
    return tags.category;

  // OSM-ish fallbacks (useful later if you ingest OSM)
  const keys = ["amenity", "shop", "tourism", "leisure", "office", "craft"];
  for (const k of keys) {
    const v = tags[k];
    if (typeof v === "string" && v.trim()) return v;
  }

  return "merchant";
}

function toFiniteNumber(v: any): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bbox = searchParams.get("bbox");

  if (!bbox) {
    return NextResponse.json(
      { data: [], error: "Missing bbox" },
      { status: 400 },
    );
  }

  try {
    // Prefer engine-side limit; keep HARD_MAX_MERCHANTS as safety belt.
    const url =
      `${ENGINE_URL}/v1/places?bbox=${encodeURIComponent(bbox)}` +
      `&limit=${LIMIT}`;

    const resp = await fetch(url, {
      next: { revalidate: 30 },
      headers: { accept: "application/json" },
    });

    if (!resp.ok) throw new Error(`Engine responded ${resp.status}`);

    const places: Array<{
      id: string;
      name: string;
      lat: number;
      lon: number;
      source: string;
      glow_score: number;
      tags: Record<string, any>;
    }> = await resp.json();

    const merchants = places
      .slice(0, HARD_MAX_MERCHANTS) // final clamp in case engine ignores limit
      .map((p) => {
        const rawTags = p.tags ?? {};
        const category = pickCategoryRaw(rawTags);
        const safeTags = sanitizeTags(rawTags);

        const lat = toFiniteNumber(p.lat);
        const lon = toFiniteNumber(p.lon);

        // Skip invalid coordinates to avoid map errors
        if (lat == null || lon == null) return null;
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

        return {
          id: p.id,
          name:
            typeof p.name === "string" && p.name.trim()
              ? p.name
              : "Bitcoin Merchant",
          lat,
          lon,
          category,
          tags: safeTags,
          source: (p.source as "sr" | "btcmap" | "osm") ?? "btcmap",
          signalStrength:
            typeof p.glow_score === "number" && Number.isFinite(p.glow_score)
              ? p.glow_score
              : 0,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ data: merchants }, { status: 200 });
  } catch (e: any) {
    console.error("Merchants proxy error:", e?.message || e);
    return NextResponse.json(
      { data: [], error: "Engine Offline" },
      { status: 200 },
    );
  }
}
