import { finalizeEvent, nip19 } from "nostr-tools";

export type AuthEvent = {
  id: string;
  pubkey: string;
  created_at: number;
  kind: 27235;
  tags: string[][];
  content: string;
  sig: string;
};

type BuildAuthEventInput = {
  pubkey: string;
  method: "POST";
  path: "/v1/checkins/intent" | "/v1/checkins/confirm";
  nonce: string;
  bodyBytes: Uint8Array;
};

function isHex(value: unknown, len: number): value is string {
  return (
    typeof value === "string" &&
    value.length === len &&
    /^[0-9a-fA-F]+$/.test(value)
  );
}

function normalizePubkey(pubkey: string): string {
  const normalized = pubkey.trim().toLowerCase();
  if (!isHex(normalized, 64)) {
    throw new Error("invalid_pubkey");
  }
  return normalized;
}

export async function sha256Hex(
  bytes: Uint8Array | ArrayBuffer,
): Promise<string> {
  const input = bytes instanceof Uint8Array ? new Uint8Array(bytes) : new Uint8Array(bytes);
  const digest = await crypto.subtle.digest("SHA-256", input as unknown as BufferSource);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomNonce(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return b64.length >= 8 ? b64 : `${b64}AABBCCDD`;
}

export function b64urlJson(obj: unknown): string {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function nostrEventIdHex(event: {
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
}): Promise<string> {
  const payload = [
    0,
    event.pubkey,
    event.created_at,
    event.kind,
    event.tags,
    event.content,
  ];
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  return sha256Hex(encoded);
}

async function signWithNip07(
  template: Omit<AuthEvent, "id" | "sig">,
): Promise<AuthEvent | null> {
  const nostr = (window as any)?.nostr;
  if (!nostr || typeof nostr.signEvent !== "function") return null;
  const signed = await nostr.signEvent(template);
  if (
    !signed ||
    !isHex(signed.id, 64) ||
    !isHex(signed.sig, 128) ||
    !isHex(signed.pubkey, 64)
  ) {
    throw new Error("invalid_nip07_signature");
  }
  return {
    id: signed.id.toLowerCase(),
    sig: signed.sig.toLowerCase(),
    pubkey: signed.pubkey.toLowerCase(),
    created_at: Number(signed.created_at),
    kind: 27235,
    tags: signed.tags,
    content: signed.content ?? "",
  };
}

function decodeLocalNsec(): Uint8Array | null {
  const maybeNsec = sessionStorage.getItem("satsrover_nsec");
  if (!maybeNsec) return null;
  const decoded = nip19.decode(maybeNsec);
  if (decoded.type !== "nsec") return null;
  return decoded.data as Uint8Array;
}

async function signWithLocalNsec(
  template: Omit<AuthEvent, "id" | "sig">,
): Promise<AuthEvent | null> {
  const secretKey = decodeLocalNsec();
  if (!secretKey) return null;
  const signed = finalizeEvent(template, secretKey);
  if (!isHex(signed.id, 64) || !isHex(signed.sig, 128) || !isHex(signed.pubkey, 64)) {
    throw new Error("invalid_local_signature");
  }
  return {
    id: signed.id.toLowerCase(),
    sig: signed.sig.toLowerCase(),
    pubkey: signed.pubkey.toLowerCase(),
    created_at: Number(signed.created_at),
    kind: 27235,
    tags: signed.tags,
    content: signed.content ?? "",
  };
}

export async function buildAuthEvent(
  input: BuildAuthEventInput,
): Promise<AuthEvent> {
  const pubkey = normalizePubkey(input.pubkey);
  const created_at = Math.floor(Date.now() / 1000);
  const bodyHash = await sha256Hex(input.bodyBytes);
  const template: Omit<AuthEvent, "id" | "sig"> = {
    pubkey,
    created_at,
    kind: 27235,
    tags: [
      ["sr", "auth", "1"],
      ["method", input.method],
      ["path", input.path],
      ["nonce", input.nonce],
      ["body", bodyHash],
    ],
    content: "",
  };

  const expectedId = await nostrEventIdHex(template);
  const signed = (await signWithNip07(template)) ?? (await signWithLocalNsec(template));
  if (!signed) {
    throw new Error("missing_signer");
  }
  if (signed.pubkey !== pubkey) {
    throw new Error("signer_pubkey_mismatch");
  }
  if (signed.id !== expectedId) {
    throw new Error("signed_event_id_mismatch");
  }
  return signed;
}

export async function buildAuthHeaders(input: BuildAuthEventInput): Promise<{
  nonce: string;
  authEvent: string;
}> {
  const authEvent = await buildAuthEvent(input);
  return {
    nonce: input.nonce,
    authEvent: b64urlJson(authEvent),
  };
}
