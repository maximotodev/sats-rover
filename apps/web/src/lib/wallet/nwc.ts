export interface ParsedNwcUrl {
  pubkey: string;
  relay: string;
  secret: string;
}

const NWC_PREFIX = "nostr+walletconnect://";

function isHex(value: string): boolean {
  return /^[0-9a-f]+$/i.test(value);
}

export function parseNwcUrl(raw: string): ParsedNwcUrl {
  const input = raw.trim();
  if (!input.startsWith(NWC_PREFIX)) {
    throw new Error("invalid_nwc_url");
  }

  let parsed: URL;
  try {
    parsed = new URL(input.replace(NWC_PREFIX, "http://"));
  } catch {
    throw new Error("invalid_nwc_url");
  }

  const pubkey = parsed.hostname || parsed.pathname.replace(/^\/+/, "");
  const relay = parsed.searchParams.get("relay") || "";
  const secret = parsed.searchParams.get("secret") || "";

  if (!pubkey || pubkey.length !== 64 || !isHex(pubkey)) {
    throw new Error("invalid_nwc_url");
  }
  if (!relay || !relay.startsWith("ws")) {
    throw new Error("invalid_nwc_url");
  }
  if (!secret) {
    throw new Error("invalid_nwc_url");
  }

  return {
    pubkey: pubkey.toLowerCase(),
    relay,
    secret,
  };
}

export function getNwcStorageKey() {
  return "satsrover_nwc";
}
