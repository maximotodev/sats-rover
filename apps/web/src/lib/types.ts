// apps/web/src/lib/types.ts
export interface Merchant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  category: string;
  tags: Record<string, any>;
  source: "osm" | "btcmap" | "sr";
  signalStrength: number; // derived from glow_score
  lastActivity?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}
