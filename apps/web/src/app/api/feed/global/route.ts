import { NextResponse } from "next/server";
import { logEvent } from "@/lib/observability";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";
const MAX_PLACE_FANS = 40;
const FEED_CONCURRENCY = 6;
const DEFAULT_LIMIT = 50;

type Place = {
  id: string;
  name: string;
  glow_score?: number;
};

type PlaceFeedItem = {
  event_id?: string;
  place_id?: string;
  pubkey?: string;
  status?: string;
  content?: string;
  created_at?: string;
};

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
  return Math.min(200, Math.floor(n));
}

async function mapLimit<T, R>(
  values: readonly T[],
  limit: number,
  mapper: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(values.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < values.length) {
      const index = cursor++;
      out[index] = await mapper(values[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, values.length) },
    () => worker(),
  );

  await Promise.all(workers);
  return out;
}

function safeCreatedMs(createdAt: unknown): number {
  if (typeof createdAt === "string") {
    const ms = Date.parse(createdAt);
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
    status:
      raw.status === "success" || raw.status === "failed" || raw.status === "did_not_try"
        ? raw.status
        : "did_not_try",
    content: typeof raw.content === "string" ? raw.content : "",
    created_at: typeof raw.created_at === "string" ? raw.created_at : new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const bbox = url.searchParams.get("bbox");
  const limit = parseLimit(url.searchParams.get("limit"));

  if (!bbox) {
    return NextResponse.json(
      {
        reason_code: "missing_bbox",
        message: "Missing bbox",
      },
      { status: 400 },
    );
  }

  try {
    const placesResp = await fetch(
      `${ENGINE_URL}/v1/places?bbox=${encodeURIComponent(bbox)}&limit=${MAX_PLACE_FANS}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
        cache: "no-store",
      },
    );

    const placesRaw = await placesResp.json().catch(() => []);
    const places = (Array.isArray(placesRaw) ? placesRaw : [])
      .filter((row): row is Place => isRecord(row) && typeof row.id === "string")
      .sort((a, b) => {
        const sa = typeof a.glow_score === "number" ? a.glow_score : 0;
        const sb = typeof b.glow_score === "number" ? b.glow_score : 0;
        return sb - sa;
      })
      .slice(0, MAX_PLACE_FANS);

    const placeInfo = Object.fromEntries(
      places.map((p) => [p.id, { id: p.id, name: typeof p.name === "string" ? p.name : "Unknown place" }]),
    );

    const feedRows = await mapLimit(places, FEED_CONCURRENCY, async (place) => {
      try {
        const resp = await fetch(
          `${ENGINE_URL}/v1/places/${encodeURIComponent(place.id)}/feed?limit=20`,
          {
            method: "GET",
            headers: { accept: "application/json" },
            cache: "no-store",
          },
        );
        const raw = await resp.json().catch(() => ({}));
        const payload = unwrapData<unknown>(raw);
        if (!isRecord(payload) || !Array.isArray(payload.items)) return [];
        return payload.items
          .map((item) => normalizeFeedItem(place.id, item))
          .filter((item): item is PlaceFeedItem => item !== null);
      } catch {
        return [];
      }
    });

    const merged = feedRows
      .flat()
      .sort((a, b) => safeCreatedMs(b.created_at) - safeCreatedMs(a.created_at));

    const deduped = new Map<string, PlaceFeedItem>();
    for (const item of merged) {
      if (!item.event_id) continue;
      if (!deduped.has(item.event_id)) deduped.set(item.event_id, item);
      if (deduped.size >= limit) break;
    }

    logEvent({
      service: "web",
      msg: "global_feed_aggregated",
      places: places.length,
      items: deduped.size,
    });

    return NextResponse.json(
      {
        data: {
          items: Array.from(deduped.values()),
          places: placeInfo,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logEvent({
      service: "web",
      msg: "global_feed_failed",
      error: error instanceof Error ? error.message : "unknown_error",
    });

    return NextResponse.json(
      {
        data: {
          items: [],
          places: {},
        },
      },
      { status: 200 },
    );
  }
}
