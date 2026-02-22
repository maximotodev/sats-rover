function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function unwrapData<T>(raw: unknown): T {
  if (isRecord(raw) && "data" in raw) {
    return raw.data as T;
  }
  return raw as T;
}
