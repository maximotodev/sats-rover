import { useState, useEffect } from "react";
import NDK, {
  NDKEvent,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKUser,
} from "@nostr-dev-kit/ndk";
import { nip19, generateSecretKey } from "nostr-tools";
import { storeNsec, loadNsec, clearNsec } from "@/lib/storage";
import { getExactGeohash, generateCityId } from "@/lib/geoutils";

let ndkInstance: NDK | null = null;

export type SessionType = "anon" | "nip07" | "local_nsec";

export interface NostrSession {
  type: SessionType;
  pubkey?: string;
  user?: NDKUser;
}

export function useNostr() {
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [session, setSession] = useState<NostrSession>({ type: "anon" });

  // 1. Initialize & Auto-Restore
  useEffect(() => {
    const init = async () => {
      if (!ndkInstance) {
        ndkInstance = new NDK({
          explicitRelayUrls: [
            "wss://relay.damus.io",
            "wss://relay.primal.net",
            "wss://nos.lol",
            "wss://relay.snort.social",
          ],
        });
        try {
          await ndkInstance.connect();
          setNdk(ndkInstance);
        } catch (e) {
          console.error("Nostr Init Failed", e);
        }
      } else {
        setNdk(ndkInstance);
      }
    };
    init();
  }, []);

  // Restore Session
  useEffect(() => {
    if (ndk && session.type === "anon") {
      const storedNsec = loadNsec();
      if (storedNsec) {
        loginWithNsec(storedNsec, true).catch(() => clearNsec());
      }
    }
  }, [ndk]);

  // 2. Auth Methods
  const loginWithExtension = async () => {
    if (!ndk || !window.nostr) throw new Error("No extension");
    const signer = new NDKNip07Signer();
    ndk.signer = signer;
    const user = await signer.user();
    await user.fetchProfile();
    setSession({ type: "nip07", pubkey: user.pubkey, user });
  };

  const loginWithNsec = async (nsec: string, remember: boolean = false) => {
    if (!ndk) return;
    try {
      const { type, data } = nip19.decode(nsec);
      if (type !== "nsec") throw new Error("Invalid nsec");

      const hexKey = Buffer.from(data as Uint8Array).toString("hex");
      const signer = new NDKPrivateKeySigner(hexKey);
      ndk.signer = signer;
      const user = await signer.user();
      await user.fetchProfile();

      if (remember) storeNsec(nsec);
      else clearNsec();

      setSession({ type: "local_nsec", pubkey: user.pubkey, user });
    } catch (e) {
      console.error("Login failed", e);
      throw e;
    }
  };

  const signup = async (remember: boolean = false) => {
    if (!ndk) return;
    const sk = generateSecretKey();
    const hexKey = Buffer.from(sk).toString("hex");
    const nsec = nip19.nsecEncode(sk);
    const signer = new NDKPrivateKeySigner(hexKey);
    ndk.signer = signer;
    const user = await signer.user();

    if (remember) storeNsec(nsec);
    else clearNsec();

    setSession({ type: "local_nsec", pubkey: user.pubkey, user });
    return { nsec, user };
  };

  const updateProfile = async (
    name: string,
    about: string,
    picture: string
  ) => {
    if (!ndk || !session.user) return;
    await session.user.fetchProfile();
    const existing = session.user.profile || {};
    session.user.profile = {
      ...existing,
      name: name || existing.name,
      about: about || existing.about,
      image: picture || existing.image,
    };
    await session.user.publish();
    setSession((prev) => ({ ...prev, user: session.user }));
  };

  const logout = () => {
    if (ndk) ndk.signer = undefined;
    clearNsec();
    setSession({ type: "anon" });
  };

  // 3. ✅ ARCHITECTURE LOCK: Strict Signal Publishing
  const publishSignal = async (
    merchantName: string,
    merchantId: string, // This maps to the 'place' tag
    lat: number,
    lon: number,
    paymentResult: "success" | "failed" | "did_not_try",
    paymentMethod: "lightning" | "onchain" | "none",
    comment: string
  ) => {
    if (session.type === "anon" || !ndk) throw new Error("Auth required");

    // 1. Calculate Deterministic Data (Geophysics)
    const geohash = getExactGeohash(lat, lon);
    const { cityId, cityName, country } = generateCityId(lat, lon);

    const event = new NDKEvent(ndk);
    event.kind = 1;

    // Human Content (Social Layer - Backward Compatible)
    const statusEmoji =
      paymentResult === "success"
        ? "✅"
        : paymentResult === "failed"
          ? "❌"
          : "👀";
    event.content = `${statusEmoji} ${comment}\n\nChecking in at ${merchantName} ⚡ #satsrover`;

    // Machine Tags (Data Layer - The Real Product)
    event.tags = [
      // Protocol Namespace
      ["L", "satsrover"],
      ["l", "checkin", "satsrover"],
      ["client", "satsrover"],

      // Indexing & Discovery
      ["t", "satsrover"],
      ["g", geohash],

      // Context Identity
      ["place", merchantId], // Canonical Place ID (e.g. btcmap:123)
      ["city_id", cityId], // Canonical City ID (e.g. cz-u2f)

      // Metadata (UI Helpers)
      ["city", cityName],
      ["country", country],

      // Economic Signal
      ["status", paymentResult],
      ["method", paymentMethod],
    ];

    try {
      // Use .publish() which returns a Set of relays that accepted the event
      const relays = await event.publish();
      if (relays.size === 0) {
        throw new Error("No relays accepted the event");
      }
      return true;
    } catch (e) {
      console.error("Failed to publish", e);
      // alert("Failed to sign/publish event."); // Remove alert, handle in UI
      return false;
    }
  };

  return {
    ndk,
    session,
    loginWithExtension,
    loginWithNsec,
    signup,
    updateProfile,
    logout,
    publishSignal,
  };
}
