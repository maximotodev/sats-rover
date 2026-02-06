import NDK from "@nostr-dev-kit/ndk";

let ndkInstance: NDK | null = null;

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://nos.lol",
  "wss://relay.snort.social",
];

export function getNDK(): NDK {
  if (!ndkInstance) {
    ndkInstance = new NDK({
      explicitRelayUrls: RELAYS,
    });
    // Fire-and-forget: NDK handles internal reconnection logic
    ndkInstance
      .connect()
      .catch((e) => console.error("[NDK] Connection error", e));
  }
  return ndkInstance;
}
