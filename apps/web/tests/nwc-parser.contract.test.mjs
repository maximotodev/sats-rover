import test from "node:test";
import assert from "node:assert/strict";

import { parseNwcUrl } from "../src/lib/wallet/nwc.ts";

test("parseNwcUrl parses valid NWC url", () => {
  const parsed = parseNwcUrl(
    "nostr+walletconnect://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?relay=wss://relay.example.com&secret=secret123",
  );

  assert.equal(
    parsed.pubkey,
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  );
  assert.equal(parsed.relay, "wss://relay.example.com");
  assert.equal(parsed.secret, "secret123");
});

test("parseNwcUrl rejects malformed NWC url", () => {
  assert.throws(
    () => parseNwcUrl("nostr+walletconnect://invalid?relay=ws://relay&secret=x"),
    /invalid_nwc_url/,
  );
});
