import { NextResponse } from "next/server";
import { logEvent } from "@/lib/observability";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const MAX_PLACES = 40;
const MAX_FEED_CALLS = 25;
const PER_PLACE_FEED_LIMIT = 20;
const FEED_CONCURRENCY = 6;

const ENGINE_TIMEOUT_MS = 2500;
const FEED_TIMEOUT_MS = 1500;
const MICRO_CACHE_TTL_MS = 3000;

const DEDUP_BUFFER = 20;

type Place = {
  id: string;
  name: string;
  glow_score?: number;
};

type PlaceFeedItem = {
  event_id: string;
  place_id: string;
  pubkey: string;
  status: "success" | "failed" | "did_not_try";
  content: string;
  created_at: string;
};

type CacheValue = {
  expiresAt: number;
  payload: {
    data: {
      items: PlaceFeedItem[];
      places: Record<string, { id: string; name: string }>;
    };
  };
};

const microCache = new Map<string, CacheValue>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapData<T>(raw: unknown): T {
  if (isRecord(raw) && "data" in raw) {
    return raw.data as T;
  }
  return raw as T;
}

function parseLimit(raw: string | null): number {
  const n = Number(raw ?? DEFAULT_LIMIT);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.floor(n));
}

function parseAndNormalizeBbox(raw: string | null): string | null {
  if (!raw) return null;
  const parts = raw.split(",").map((v) => v.trim());
  if (parts.length !== 4) return null;

  const nums = parts.map((v) => Number(v));
  if (nums.some((n) => !Number.isFinite(n))) return null;

  const [minLon, minLat, maxLon, maxLat] = nums;
  if (!(minLon < maxLon && minLat < maxLat)) return null;
  if (minLon < -180 || maxLon > 180 || minLat < -90 || maxLat > 90) return null;

  return `${minLon.toFixed(4)},${minLat.toFixed(4)},${maxLon.toFixed(4)},${maxLat.toFixed(4)}`;
}

function normalizeStatus(value: unknown): "success" | "failed" | "did_not_try" {
  if (value === "success" || value === "failed" || value === "did_not_try") {
    return value;
  }
  return "did_not_try";
}

function safeCreatedAtIso(value: unknown): string {
  if (typeof value === "string") {
    const ms = Date.parse(value);
    if (Number.isFinite(ms)) return new Date(ms).toISOString();
  }
  return new Date(0).toISOString();
}

function safeCreatedMs(value: unknown): number {
  if (typeof value === "string") {
    const ms = Date.parse(value);
    if (Number.isFinite(ms)) return ms;
  }
  return 0;
}

function normalizeFeedItem(placeId: string, raw: unknown): PlaceFeedItem | null {
  if (!isRecord(raw)) return null;

  const eventId = typeof raw.event_id === "string" ? raw.event_id : "";
  const pubkey = typeof raw.pubkey === "string" ? raw.pubkey : "";
  if (!eventId || !pubkey) return null;

  return {
    event_id: eventId,
    place_id: placeId,
    pubkey,
    status: normalizeStatus(raw.status),
    content: typeof raw.content === "string" ? raw.content : "",
    created_at: safeCreatedAtIso(raw.created_at),
  };
}

function emptyPayload() {
  return {
    data: {
      items: [] as PlaceFeedItem[],
      places: {} as Record<string, { id: string; name: string }>,
    },
  };
}

async function fetchJsonWithTimeout(
  url: string,
  timeoutMs: number,
  init?: RequestInit,
): Promise<{ ok: true; status: number; body: unknown } | { ok: false; status?: number; timeout: boolean; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, status: response.status, timeout: false, error: "upstream_non_2xx" };
    }

    return { ok: true, status: response.status, body };
  } catch (error) {
    const timeout = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      timeout,
      error: error instanceof Error ? error.message : "unknown_fetch_error",
    };
  } finally {
    clearTimeout(timer);
  }
}

function pruneCache(now: number): void {
  for (const [key, value] of microCache.entries()) {
    if (value.expiresAt <= now) {
      microCache.delete(key);
    }
  }
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const url = new URL(request.url);

  const normalizedBbox = parseAndNormalizeBbox(url.searchParams.get("bbox"));
  if (!normalizedBbox) {
    return NextResponse.json(
      {
        reason_code: "invalid_bbox",
        message: "Invalid or missing bbox",
      },
      { status: 400 },
    );
  }

  const limit = parseLimit(url.searchParams.get("limit"));
  const cacheKey = `${normalizedBbox}|${limit}`;

  const now = Date.now();
  pruneCache(now);

  const cached = microCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    logEvent({
      service: "web",
      msg: "global_feed_cache_hit",
      bbox: normalizedBbox,
      limit,
      cache_hit: true,
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json(cached.payload, { status: 200 });
  }

  const target = Math.min(limit + DEDUP_BUFFER, MAX_LIMIT + DEDUP_BUFFER);
  const hardMax = Math.min(limit + 2 * DEDUP_BUFFER, MAX_LIMIT + 2 * DEDUP_BUFFER);

  let placesConsidered = 0;
  let feedCallsMade = 0;
  let failures = 0;
  let timeouts = 0;
  let itemsBeforeDedupe = 0;

  try {
    const placesUrl = `${ENGINE_URL}/v1/places?bbox=${encodeURIComponent(normalizedBbox)}&limit=${MAX_PLACES}`;
    const placesResp = await fetchJsonWithTimeout(placesUrl, ENGINE_TIMEOUT_MS, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!placesResp.ok) {
      if (placesResp.timeout) timeouts += 1;
      else failures += 1;

      const payload = emptyPayload();
      logEvent({
        service: "web",
        msg: "global_feed_failed",
        bbox: normalizedBbox,
        limit,
        duration_ms: Date.now() - startedAt,
        error: placesResp.timeout ? "places_timeout" : placesResp.error || "places_failed",
      });
      return NextResponse.json(payload, { status: 200 });
    }

    const placesRaw = unwrapData<unknown>(placesResp.body);
    const places = (Array.isArray(placesRaw) ? placesRaw : [])
      .filter((row): row is Place => isRecord(row) && typeof row.id === "string")
      .sort((a, b) => {
        const sa = typeof a.glow_score === "number" ? a.glow_score : 0;
        const sb = typeof b.glow_score === "number" ? b.glow_score : 0;
        return sb - sa;
      })
      .slice(0, Math.min(MAX_PLACES, MAX_FEED_CALLS));

    placesConsidered = places.length;

    const placesMap = Object.fromEntries(
      places.map((place) => [
        place.id,
        {
          id: place.id,
          name: typeof place.name === "string" ? place.name : "Unknown place",
        },
      ]),
    );

    const deduped = new Map<string, PlaceFeedItem>();

    let nextIndex = 0;
    let stopLaunching = false;

    const workerCount = Math.min(FEED_CONCURRENCY, places.length);

    async function worker(): Promise<void> {
      while (true) {
        if (stopLaunching) return;
        if (deduped.size >= target) {
          stopLaunching = true;
          return;
        }
        if (feedCallsMade >= MAX_FEED_CALLS) {
          stopLaunching = true;
          return;
        }
        const index = nextIndex++;
        if (index >= places.length) return;

        const place = places[index];
        feedCallsMade += 1;

        const feedUrl = `${ENGINE_URL}/v1/places/${encodeURIComponent(place.id)}/feed?limit=${PER_PLACE_FEED_LIMIT}`;
        const feedResp = await fetchJsonWithTimeout(feedUrl, FEED_TIMEOUT_MS, {
          method: "GET",
          headers: { accept: "application/json" },
          cache: "no-store",
        });

        if (!feedResp.ok) {
          if (feedResp.timeout) timeouts += 1;
          else failures += 1;
          continue;
        }

        const payload = unwrapData<unknown>(feedResp.body);
        if (!isRecord(payload) || !Array.isArray(payload.items)) {
          failures += 1;
          continue;
        }

        for (const rawItem of payload.items) {
          itemsBeforeDedupe += 1;
          const normalized = normalizeFeedItem(place.id, rawItem);
          if (!normalized) continue;
          if (!deduped.has(normalized.event_id)) {
            deduped.set(normalized.event_id, normalized);
            if (deduped.size >= hardMax) {
              stopLaunching = true;
              break;
            }
          }
        }
      }
    }

    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    const items = Array.from(deduped.values())
      .sort((a, b) => safeCreatedMs(b.created_at) - safeCreatedMs(a.created_at))
      .slice(0, limit);

    const payload = {
      data: {
        items,
        places: placesMap,
      },
    };

    microCache.set(cacheKey, {
      expiresAt: Date.now() + MICRO_CACHE_TTL_MS,
      payload,
    });

    logEvent({
      service: "web",
      msg: "global_feed_aggregated",
      bbox: normalizedBbox,
      limit,
      places_considered: placesConsidered,
      feed_calls_made: feedCallsMade,
      items_before_dedupe: itemsBeforeDedupe,
      items_after_dedupe: deduped.size,
      timeouts,
      failures,
      cache_hit: false,
      duration_ms: Date.now() - startedAt,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    logEvent({
      service: "web",
      msg: "global_feed_failed",
      bbox: normalizedBbox,
      limit,
      duration_ms: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "unknown_error",
    });

    return NextResponse.json(emptyPayload(), { status: 200 });
  }
}
