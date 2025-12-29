// src/hooks/use-nostr.ts
import { useState, useEffect } from "react";
import NDK, { NDKEvent, NDKNip07Signer, NDKUser } from "@nostr-dev-kit/ndk";

// SINGLETON: Keep one NDK instance alive for the whole app session
let ndkInstance: NDK | null = null;

export function useNostr() {
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [user, setUser] = useState<NDKUser | null>(null);
  const [connected, setConnected] = useState(false);

  // 1. Initialize NDK (Connect to Relays)
  useEffect(() => {
    const init = async () => {
      if (ndkInstance) {
        setNdk(ndkInstance);
        setConnected(true);
        return;
      }

      const newNdk = new NDK({
        explicitRelayUrls: [
          "wss://relay.damus.io",
          "wss://relay.primal.net",
          "wss://nos.lol",
          "wss://relay.snort.social",
        ],
      });

      try {
        await newNdk.connect();
        ndkInstance = newNdk;
        setNdk(newNdk);
        setConnected(true);
        console.log("🔗 Connected to Nostr Relays");
      } catch (e) {
        console.error("Failed to connect to Nostr", e);
      }
    };

    init();
  }, []);

  // 2. Login (NIP-07 Extension)
  const login = async () => {
    if (!ndk) return;

    // TypeScript now knows about window.nostr because of the import above
    if (!window.nostr) {
      alert("Please install the Alby Extension (getalby.com) to log in!");
      return;
    }

    try {
      const signer = new NDKNip07Signer();
      ndk.signer = signer;

      const ndkUser = await signer.user();
      await ndkUser.fetchProfile();

      setUser(ndkUser);
      return ndkUser;
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  // 3. Check In (Publish Event)
  const publishCheckIn = async (
    merchantName: string,
    merchantId: string,
    lat: number,
    lon: number
  ) => {
    if (!ndk || !user) {
      alert("Please login first!");
      return;
    }

    const event = new NDKEvent(ndk);
    event.kind = 1; // Short Text Note

    event.content = `Checking in at ${merchantName} ⚡ #SatsRover\n\nSpending sats in the wild!`;

    event.tags = [
      ["t", "satsrover"],
      ["t", "bitcoin"],
      ["g", String(lat), String(lon)],
      ["r", merchantId],
      ["l", "checkin", "satsrover"],
      ["client", "satsrover"], // 👈 ADD THIS: Future-proof data analytics
    ];

    try {
      await event.publish();
      alert("Check-in published to Nostr! 🚀");
      return true;
    } catch (e) {
      console.error("Failed to publish", e);
      alert("Failed to sign/publish event.");
      return false;
    }
  };

  const fetchCheckIns = async (merchantId: string) => {
    if (!ndk) return [];

    // Query Relays: "Give me Kind 1 notes tagged with 'r' = merchantId"
    // We also look for the 'satsrover' tag to filter noise
    const filter = {
      kinds: [1],
      "#r": [merchantId],
      "#t": ["satsrover"],
      limit: 10, // Just the last 10 for now
    };

    try {
      const events = await ndk.fetchEvents(filter);
      // Convert Set to Array and sort by time (newest first)
      return Array.from(events).sort((a, b) => b.created_at! - a.created_at!);
    } catch (e) {
      console.error("Failed to fetch check-ins", e);
      return [];
    }
  };

  return { ndk, connected, user, login, publishCheckIn, fetchCheckIns };
}
