import { useCallback, useEffect, useMemo, useState } from "react";
import { dedupeAndSortSignalFeed, normalizePlaceFeedResult, normalizeSignalFeedItem } from "./normalize";
import { mergeSignalFeed, withOptimisticPending } from "./selectors";
import type { GlobalFeedResult, PlaceFeedResult, SignalFeedItemUI, SignalFeedSource, SignalStatus } from "./types";
import { logEvent } from "@/lib/observability";
import { unwrapData } from "./transport";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasErrorPayload(raw: unknown): string | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.error === "string" && raw.error) return raw.error;
  if (typeof raw.reason_code === "string" && raw.reason_code) return raw.reason_code;
  return null;
}

export async function fetchPlaceFeed(
  placeId: string,
  signal?: AbortSignal,
): Promise<PlaceFeedResult> {
  const res = await fetch(`/api/places/${encodeURIComponent(placeId)}/feed`, {
    method: "GET",
    signal,
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  const raw = await res.json().catch(() => ({}));
  const error = hasErrorPayload(raw);
  if (error) {
    logEvent({ service: "web", msg: "place_feed_error_payload", placeId, error });
    return { items: [], confidenceScore: 0 };
  }

  const payload = unwrapData<unknown>(raw);
  return normalizePlaceFeedResult(payload, placeId);
}

export async function fetchGlobalFeed(
  args: { bbox: string; limit?: number; signal?: AbortSignal },
): Promise<GlobalFeedResult> {
  const params = new URLSearchParams({ bbox: args.bbox });
  if (typeof args.limit === "number") params.set("limit", String(args.limit));

  const res = await fetch(`/api/feed/global?${params.toString()}`, {
    method: "GET",
    signal: args.signal,
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  const raw = await res.json().catch(() => ({}));
  const error = hasErrorPayload(raw);
  if (error) {
    logEvent({ service: "web", msg: "global_feed_error_payload", error });
    return { items: [], places: {} };
  }

  const payload = unwrapData<unknown>(raw);
  if (!isRecord(payload)) return { items: [], places: {} };

  const placeMap = isRecord(payload.places)
    ? Object.fromEntries(
        Object.entries(payload.places)
          .filter((entry): entry is [string, Record<string, unknown>] => isRecord(entry[1]))
          .map(([k, v]) => [
            k,
            {
              id: typeof v.id === "string" ? v.id : k,
              name: typeof v.name === "string" ? v.name : "Unknown place",
            },
          ]),
      )
    : {};

  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const items = dedupeAndSortSignalFeed(
    rawItems
      .map((item) => normalizeSignalFeedItem(item, {
        placeId: typeof (isRecord(item) ? item.place_id : undefined) === "string"
          ? String((item as { place_id: string }).place_id)
          : "unknown",
        source: "global",
      }))
      .filter((item): item is SignalFeedItemUI => item !== null),
  );

  return { items, places: placeMap };
}

export function createOptimisticSignalFeedItem(input: {
  placeId: string;
  pubkey: string;
  status: SignalStatus;
  content: string;
  source?: SignalFeedSource;
  id?: string;
}): SignalFeedItemUI {
  const now = Date.now();
  const id = input.id || `pending-${now}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    placeId: input.placeId,
    pubkey: input.pubkey,
    status: input.status,
    content: input.content,
    createdAt: new Date(now).toISOString(),
    createdAtMs: now,
    source: input.source ?? "optimistic",
    pending: true,
  };
}

type UseSignalFeedArgs =
  | { mode: "place"; placeId: string | null; enabled?: boolean }
  | { mode: "global"; bbox: string | null; limit?: number; enabled?: boolean };

export function useSignalFeed(args: UseSignalFeedArgs) {
  const [items, setItems] = useState<SignalFeedItemUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [places, setPlaces] = useState<Record<string, { id: string; name: string }>>({});

  const enabled = args.enabled ?? true;
  const mode = args.mode;
  const placeId = mode === "place" ? args.placeId : null;
  const bbox = mode === "global" ? args.bbox : null;
  const limit = mode === "global" ? args.limit : undefined;

  useEffect(() => {
    setItems([]);
    setError(null);
    setConfidenceScore(0);
    setPlaces({});
  }, [mode, placeId, bbox, limit]);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    if (mode === "place") {
      if (!placeId) {
        setItems([]);
        setConfidenceScore(0);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPlaceFeed(placeId);
        setItems((prev) => mergeSignalFeed(prev, result.items));
        setConfidenceScore(result.confidenceScore);
      } catch (e) {
        setError(e instanceof Error ? e.message : "feed_fetch_failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!bbox) {
      setItems([]);
      setPlaces({});
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchGlobalFeed({ bbox, limit });
      setItems((prev) => mergeSignalFeed(prev, result.items));
      setPlaces(result.places);
    } catch (e) {
      setError(e instanceof Error ? e.message : "feed_fetch_failed");
    } finally {
      setLoading(false);
    }
  }, [bbox, enabled, limit, mode, placeId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addOptimistic = useCallback((item: SignalFeedItemUI) => {
    setItems((prev) => withOptimisticPending(prev, item));
  }, []);

  const value = useMemo(
    () => ({ items, loading, error, confidenceScore, places, refresh, addOptimistic }),
    [items, loading, error, confidenceScore, places, refresh, addOptimistic],
  );

  return value;
}
