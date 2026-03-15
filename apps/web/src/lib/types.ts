// apps/web/src/lib/types.ts
export interface MerchantClaimSummary {
  claimed: boolean;
  claimantPubkey?: string | null;
  claimEventId?: string | null;
  claimCreatedAt?: number | null;
}

export interface MerchantProfileSummary {
  confidenceScore: number;
  confidenceLabel: string;
  freshnessLabel: string;
  recentSignals: number;
  recentSuccesses: number;
  lastSignalAt?: number | null;
  lastConfirmedAt?: number | null;
  recentlyActive: boolean;
  activeThisWeek: boolean;
  higherConfidence: boolean;
  repeatedSuccessSignals: boolean;
  trustSignals: string[];
}

export interface Merchant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  category: string;
  tags: Record<string, unknown>;
  source: "osm" | "btcmap" | "sr";
  signalStrength: number; // derived from glow_score
  claim?: MerchantClaimSummary | null;
  profile?: MerchantProfileSummary | null;
  lastActivity?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}
