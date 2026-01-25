export interface Merchant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  category: string;
  tags: Record<string, string>;
  source?: "osm" | "btcmap";
  // Dynamic Signal Props (Calculated on client)
  signalStrength?: number; // 0 to 1.0
  lastActivity?: number; // Timestamp
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}
