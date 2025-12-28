// src/lib/types.ts
export interface Merchant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  category: string;
  tags: Record<string, string>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}
