import type {
  PlaceFeedItemTransport,
  PlaceFeedResult,
  SignalFeedItemUI,
  SignalFeedSource,
  SignalStatus,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeStatus(value: unknown): SignalStatus {
  if (value === "success" || value === "failed" || value === "did_not_try") {
    return value;
  }
  return "did_not_try";
}

function normalizeCreatedAt(value: unknown): { iso: string; ms: number } {
  if (typeof value === "string") {
    const ms = Date.parse(value);
    if (Number.isFinite(ms)) {
      return { iso: new Date(ms).toISOString(), ms };
    }
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value > 2_000_000_000 ? value : value * 1000;
    return { iso: new Date(ms).toISOString(), ms };
  }

  const ms = Date.now();
  return { iso: new Date(ms).toISOString(), ms };
}

export function normalizeSignalFeedItem(
  raw: unknown,
  opts: { placeId: string; source: SignalFeedSource; pending?: boolean },
): SignalFeedItemUI | null {
  if (!isRecord(raw)) return null;
  const t = raw as PlaceFeedItemTransport;

  const id = toStringOr(t.event_id, "");
  const pubkey = toStringOr(t.pubkey, "");
  if (!id || !pubkey) return null;

  const placeId = toStringOr(t.place_id, opts.placeId);
  const content = typeof t.content === "string" ? t.content : "";
  const status = normalizeStatus(t.status);
  const created = normalizeCreatedAt(t.created_at);

  return {
    id,
    placeId,
    pubkey,
    status,
    content,
    createdAt: created.iso,
    createdAtMs: created.ms,
    source: opts.source,
    pending: opts.pending ?? false,
  };
}

export function dedupeAndSortSignalFeed(items: SignalFeedItemUI[]): SignalFeedItemUI[] {
  const byId = new Map<string, SignalFeedItemUI>();

  for (const item of items) {
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, item);
      continue;
    }

    // Prefer ingested rows over pending optimistic rows.
    if (existing.pending && !item.pending) {
      byId.set(item.id, item);
      continue;
    }

    if (item.createdAtMs > existing.createdAtMs) {
      byId.set(item.id, item);
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function collapsePendingForEventId(
  items: SignalFeedItemUI[],
  eventId: string,
): SignalFeedItemUI[] {
  if (!eventId) return items;
  return items.map((item) => {
    if (item.id !== eventId) return item;
    return {
      ...item,
      pending: false,
      source: item.source === "optimistic" ? "indexer" : item.source,
    };
  });
}

export function normalizePlaceFeedResult(
  payload: unknown,
  placeId: string,
): PlaceFeedResult {
  if (!isRecord(payload)) {
    return { items: [], confidenceScore: 0 };
  }

  const itemsRaw = Array.isArray(payload.items) ? payload.items : [];
  const items = dedupeAndSortSignalFeed(
    itemsRaw
      .map((item) =>
        normalizeSignalFeedItem(item, { placeId, source: "indexer" }),
      )
      .filter((item): item is SignalFeedItemUI => item !== null),
  );

  const confidenceRaw = payload.confidence_score;
  const confidenceScore =
    typeof confidenceRaw === "number" && Number.isFinite(confidenceRaw)
      ? confidenceRaw
      : 0;

  return { items, confidenceScore };
}
