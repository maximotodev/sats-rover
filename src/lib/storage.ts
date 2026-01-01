// src/lib/storage.ts

const NSEC_KEY = "satsrover_nsec";

export function storeNsec(nsec: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(NSEC_KEY, nsec);
  }
}

export function loadNsec(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(NSEC_KEY);
  }
  return null;
}

export function clearNsec() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(NSEC_KEY);
  }
}
