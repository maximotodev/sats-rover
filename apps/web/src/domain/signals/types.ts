export type SignalStatus = "success" | "failed" | "did_not_try";

export type SignalFeedSource = "indexer" | "optimistic" | "global";

export interface SignalFeedItemUI {
  id: string;
  placeId: string;
  pubkey: string;
  status: SignalStatus;
  content: string;
  createdAt: string;
  createdAtMs: number;
  source: SignalFeedSource;
  pending?: boolean;
}

export interface PlaceFeedItemTransport {
  event_id?: unknown;
  place_id?: unknown;
  pubkey?: unknown;
  status?: unknown;
  content?: unknown;
  created_at?: unknown;
}

export interface PlaceFeedTransport {
  items?: unknown;
  confidence_score?: unknown;
  error?: unknown;
}

export interface PlaceFeedResult {
  items: SignalFeedItemUI[];
  confidenceScore: number;
}

export interface GlobalFeedResult {
  items: SignalFeedItemUI[];
  places: Record<string, { id: string; name: string }>;
}
