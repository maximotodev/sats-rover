// apps/web/src/app/api/merchants/route.ts
import { NextResponse } from "next/server";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";
const ENGINE_TIMEOUT_MS = Number(process.env.ENGINE_TIMEOUT_MS || 7000);
const ENGINE_RETRIES = Number(process.env.ENGINE_RETRIES || 1);

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

type ParsedBbox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

function badRequest(msg: string): Error {
  const err = new Error(msg);
  (err as any).kind = "BAD_REQUEST";
  return err;
}

function parseBbox(raw: string | null): ParsedBbox {
  if (!raw) {
    throw badRequest("bbox is required");
  }

  const parts = raw.split(",").map((x) => x.trim());
  if (parts.length !== 4) {
    throw badRequest("bbox must be 4 comma-separated numbers: minLon,minLat,maxLon,maxLat");
  }

  const nums = parts.map((x) => Number(x));
  if (nums.some((x) => !Number.isFinite(x))) {
    throw badRequest("bbox contains invalid numbers");
  }

  const [minLon, minLat, maxLon, maxLat] = nums;

  if (minLon < -180 || minLon > 180 || maxLon < -180 || maxLon > 180) {
    throw badRequest("bbox longitude out of range [-180,180]");
  }
  if (minLat < -90 || minLat > 90 || maxLat < -90 || maxLat > 90) {
    throw badRequest("bbox latitude out of range [-90,90]");
  }
  if (!(minLon < maxLon && minLat < maxLat)) {
    throw badRequest("bbox must satisfy minLon < maxLon and minLat < maxLat");
  }

  return { minLon, minLat, maxLon, maxLat };
}

function requestId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  const table = [200, 500];
  return table[Math.min(attempt, table.length - 1)];
}

async function fetchEngineWithRetry(url: string) {
  const maxAttempts = Math.max(1, ENGINE_RETRIES + 1);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ENGINE_TIMEOUT_MS);

    try {
      const resp = await fetch(url, {
        next: { revalidate: 30 },
        headers: { accept: "application/json" },
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (resp.ok) {
        return { resp, attempts: attempt + 1 };
      }

      if (resp.status >= 500 && attempt < maxAttempts - 1) {
        await sleep(backoffMs(attempt));
        continue;
      }

      const err = new Error(`Engine responded ${resp.status}`);
      (err as any).kind = "ENGINE_BAD_RESPONSE";
      throw err;
    } catch (e: any) {
      clearTimeout(timer);

      const timedOut = e?.name === "AbortError";
      const kind = timedOut ? "ENGINE_TIMEOUT" : "ENGINE_UNAVAILABLE";

      const err = new Error(e?.message || "fetch failed");
      (err as any).kind = kind;
      lastError = err;

      if (attempt >= maxAttempts - 1) break;

      await sleep(backoffMs(attempt));
    }
  }

  throw lastError || new Error("fetch failed");
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const rid = requestId();
  const { searchParams } = new URL(request.url);
  const rawBbox = searchParams.get("bbox");

  let attempts = 0;
  let bboxForLog = rawBbox || "";

  try {
    const bbox = parseBbox(rawBbox);
    bboxForLog = `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`;

    const url =
      `${ENGINE_URL}/v1/places?bbox=${encodeURIComponent(bboxForLog)}` +
      `&limit=${LIMIT}`;

    const { resp, attempts: usedAttempts } = await fetchEngineWithRetry(url);
    attempts = usedAttempts;

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
      .slice(0, HARD_MAX_MERCHANTS)
      .map((p) => {
        const rawTags = p.tags ?? {};
        const category = pickCategoryRaw(rawTags);
        const safeTags = sanitizeTags(rawTags);

        const lat = toFiniteNumber(p.lat);
        const lon = toFiniteNumber(p.lon);

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

    console.info(
      JSON.stringify({
        service: "web-api-merchants",
        requestId: rid,
        bbox: bboxForLog,
        engineUrl: ENGINE_URL,
        durationMs: Date.now() - startedAt,
        attempts,
        ok: true,
      }),
    );

    return NextResponse.json({ data: merchants }, { status: 200 });
  } catch (e: any) {
    const kind = e?.kind || "UNKNOWN";
    const message = e?.message || "Unknown error";

    let status = 502;
    let error = "ENGINE_UNAVAILABLE";
    let details = message;

    if (kind === "ENGINE_BAD_RESPONSE") {
      status = 502;
      error = "ENGINE_BAD_RESPONSE";
      details = message;
    } else if (kind === "ENGINE_TIMEOUT") {
      status = 504;
      error = "ENGINE_TIMEOUT";
      details = message;
    } else if (kind === "BAD_REQUEST") {
      status = 400;
      error = "BAD_REQUEST";
      details = message;
    } else if (kind === "ENGINE_UNAVAILABLE") {
      status = 502;
      error = "ENGINE_UNAVAILABLE";
      details = message;
    } else if (
      message.includes("bbox") ||
      message.includes("minLon") ||
      message.includes("minLat")
    ) {
      status = 400;
      error = "BAD_REQUEST";
      details = message;
    }

    console.error(
      JSON.stringify({
        service: "web-api-merchants",
        requestId: rid,
        bbox: bboxForLog,
        engineUrl: ENGINE_URL,
        durationMs: Date.now() - startedAt,
        attempts,
        ok: false,
        errorName: e?.name || "Error",
        errorMessage: message,
      }),
    );

    return NextResponse.json(
      { data: [], error, details },
      { status },
    );
  }
}
