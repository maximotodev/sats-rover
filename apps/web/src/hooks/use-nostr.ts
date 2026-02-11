import { useState, useEffect, useCallback } from "react";
import NDK, {
  NDKEvent,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKUser,
} from "@nostr-dev-kit/ndk";
import { nip19, generateSecretKey } from "nostr-tools";
import { getNDK } from "@/lib/ndk"; // ✅ Singleton Import
import { storeNsec, loadNsec, clearNsec } from "@/lib/storage";

/**
 * PROTOCOL v1 CONSTANTS
 */
const KIND_SIGNAL = 30331;
const KIND_CLAIM = 30333;
const PROTOCOL_VERSION = "1";

/**
 * BROWSER-NATIVE HELPERS
 * Replaces 'Buffer' to avoid heavy polyfills in Next.js 16/Turbopack.
 */
function u8ToHex(u8: Uint8Array): string {
  return Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("");
}

export type SessionType = "anon" | "nip07" | "local_nsec";

export interface NostrSession {
  type: SessionType;
  pubkey?: string;
  user?: NDKUser;
}

export function useNostr() {
  const [ndk] = useState<NDK>(() => getNDK());
  const [session, setSession] = useState<NostrSession>({ type: "anon" });

  // 1. Auth: Extension (NIP-07)
  const loginWithExtension = useCallback(async () => {
    if (!window.nostr) throw new Error("No extension found");
    const signer = new NDKNip07Signer();
    ndk.signer = signer;
    const user = await signer.user();
    // Senior Note: We skip fetchProfile here.
    // UI components should fetch profiles only when needed to minimize relay load.
    setSession({ type: "nip07", pubkey: user.pubkey, user });
  }, [ndk]);

  // 2. Auth: Private Key (nsec)
  const loginWithNsec = useCallback(
    async (nsec: string, remember: boolean = false) => {
      try {
        const { type, data } = nip19.decode(nsec);
        if (type !== "nsec") throw new Error("Invalid nsec");

        const hexKey = u8ToHex(data as Uint8Array);
        const signer = new NDKPrivateKeySigner(hexKey);
        ndk.signer = signer;
        const user = await signer.user();

        if (remember) storeNsec(nsec);
        else clearNsec();

        setSession({ type: "local_nsec", pubkey: user.pubkey, user });
      } catch (e) {
        console.error("Login failed", e);
        throw e;
      }
    },
    [ndk],
  );

  // 3. Auth: Signup (Ephemeral or Stored)
  const signup = useCallback(
    async (remember: boolean = false) => {
      const sk = generateSecretKey();
      const hexKey = u8ToHex(sk);
      const nsec = nip19.nsecEncode(sk);

      const signer = new NDKPrivateKeySigner(hexKey);
      ndk.signer = signer;
      const user = await signer.user();

      if (remember) storeNsec(nsec);
      setSession({ type: "local_nsec", pubkey: user.pubkey, user });

      return { nsec, user };
    },
    [ndk],
  );

  // 4. Auto-Restore Session
  useEffect(() => {
    const storedNsec = loadNsec();
    if (storedNsec && session.type === "anon") {
      loginWithNsec(storedNsec, true).catch(() => clearNsec());
    }
  }, [ndk, session.type, loginWithNsec]);

  const logout = useCallback(() => {
    ndk.signer = undefined;
    clearNsec();
    setSession({ type: "anon" });
  }, [ndk]);

  /**
   * PROTOCOL v1: SIGNAL PUBLISHING (Kind 30331)
   * We now publish a clean machine-readable event.
   * Logic for Kind 1 cross-posting should be handled by the UI or an optional param.
   */
  const publishSignal = useCallback(
    async (
      merchantId: string,
      paymentStatus: "success" | "failed" | "did_not_try",
      comment: string,
    ) => {
      if (session.type === "anon" || !ndk) throw new Error("Auth required");

      const event = new NDKEvent(ndk);
      event.kind = KIND_SIGNAL;
      event.content = comment;
      event.tags = [
        ["t", "satsrover"],
        ["place", merchantId],
        ["status", paymentStatus],
        ["v", PROTOCOL_VERSION],
        ["client", "satsrover-web"],
      ];

      try {
        const relays = await event.publish();
        return { ok: relays.size > 0, eventId: event.id };
      } catch (e) {
        console.error("Signal broadcast failed", e);
        return { ok: false };
      }
    },
    [ndk, session],
  );


  const updateProfile = useCallback(
    async (name: string, about: string, picture: string) => {
      if (session.type === "anon" || !ndk) throw new Error("Auth required");

      const event = new NDKEvent(ndk);
      event.kind = 0;
      event.content = JSON.stringify({ name, about, picture });
      await event.publish();
    },
    [ndk, session],
  );

  /**
   * PROTOCOL v1: MERCHANT CLAIM (Kind 30333)
   * Cryptographic assertion of ownership.
   */
  const publishClaim = useCallback(
    async (merchantId: string) => {
      if (session.type === "anon" || !ndk) throw new Error("Auth required");

      const event = new NDKEvent(ndk);
      event.kind = KIND_CLAIM;
      event.content = `Claiming ownership of ${merchantId}`;
      event.tags = [
        ["place", merchantId],
        ["role", "owner"],
        ["v", PROTOCOL_VERSION],
      ];

      return (await event.publish()).size > 0;
    },
    [ndk, session],
  );

  return {
    ndk,
    session,
    loginWithExtension,
    loginWithNsec,
    signup,
    logout,
    updateProfile,
    publishSignal,
    publishClaim,
  };
}
