// src/hooks/use-nostr.ts
import { useState, useEffect } from "react";
import NDK, {
  NDKEvent,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKUser,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

let ndkInstance: NDK | null = null;

export function useNostr() {
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [user, setUser] = useState<NDKUser | null>(null);
  const [connected, setConnected] = useState(false);

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

  // Login A: Extension (Desktop)
  const loginWithExtension = async () => {
    if (!ndk) return;
    if (!window.nostr) throw new Error("No extension found");
    try {
      const signer = new NDKNip07Signer();
      ndk.signer = signer;
      const ndkUser = await signer.user();
      await ndkUser.fetchProfile();
      setUser(ndkUser);
      return ndkUser;
    } catch (e) {
      console.error("Extension login failed", e);
      throw e;
    }
  };

  // Login B: NSEC (Mobile)
  const loginWithNsec = async (nsec: string) => {
    if (!ndk) return;
    try {
      const { type, data } = nip19.decode(nsec);
      if (type !== "nsec") throw new Error("Invalid nsec format");

      // FIX: Convert Uint8Array to Hex String
      const hexKey = Buffer.from(data as Uint8Array).toString("hex");

      const signer = new NDKPrivateKeySigner(hexKey);
      ndk.signer = signer;

      const ndkUser = await signer.user();
      await ndkUser.fetchProfile();

      setUser(ndkUser);
      return ndkUser;
    } catch (e) {
      console.error("NSEC Login failed", e);
      throw e;
    }
  };

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
    event.kind = 1;
    event.content = `Checking in at ${merchantName} ⚡ #SatsRover\n\nSpending sats in the wild!`;
    event.tags = [
      ["t", "satsrover"],
      ["t", "bitcoin"],
      ["g", String(lat), String(lon)],
      ["r", merchantId],
      ["l", "checkin", "satsrover"],
      ["client", "satsrover"],
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
    const filter = {
      kinds: [1],
      "#r": [merchantId],
      "#t": ["satsrover"],
      limit: 10,
    };
    try {
      const events = await ndk.fetchEvents(filter);
      return Array.from(events).sort((a, b) => b.created_at! - a.created_at!);
    } catch (e) {
      return [];
    }
  };

  return {
    ndk,
    connected,
    user,
    loginWithExtension,
    loginWithNsec,
    publishCheckIn,
    fetchCheckIns,
  };
}
