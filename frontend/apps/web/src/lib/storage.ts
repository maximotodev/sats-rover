// src/lib/storage.ts

const NSEC_KEY = "satsrover_nsec";

/**
 * STOPGAP SECURITY:
 * - sessionStorage clears on tab close (better than localStorage)
 * - still vulnerable to XSS
 * Target: NIP-07 / NIP-46, or WebCrypto encryption if persisting secrets.
 */
export function storeNsec(nsec: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NSEC_KEY, nsec);
}

export function loadNsec(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(NSEC_KEY);
}

export function clearNsec() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(NSEC_KEY);
}
