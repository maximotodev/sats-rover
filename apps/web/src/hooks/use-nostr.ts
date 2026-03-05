import { useState, useEffect, useCallback, useRef } from "react";
import NDK, {
  NDKEvent,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKUser,
  NDKUserProfile,
} from "@nostr-dev-kit/ndk";
import { nip19, generateSecretKey } from "nostr-tools";
import { getNDK } from "@/lib/ndk";
import { storeNsec, loadNsec, clearNsec } from "@/lib/storage";
import { hydrateUserProfile } from "@/lib/session-hydration";

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
  profile?: NDKUserProfile;
}

export function useNostr() {
  const [ndk] = useState<NDK>(() => getNDK());
  const [session, setSession] = useState<NostrSession>({ type: "anon" });
  const profileHydrationAttempted = useRef<Set<string>>(new Set());

  const buildSessionFromUser = useCallback(
    async (type: SessionType, user: NDKUser): Promise<NostrSession> => {
      const profile = (await hydrateUserProfile(user)) as
        | NDKUserProfile
        | undefined;
      return { type, pubkey: user.pubkey, user, profile };
    },
    [],
  );

  // 1. Auth: Extension (NIP-07)
  const loginWithExtension = useCallback(async () => {
    if (!window.nostr) throw new Error("No extension found");
    const signer = new NDKNip07Signer();
    ndk.signer = signer;
    const user = await signer.user();
    profileHydrationAttempted.current.delete(user.pubkey);
    setSession(await buildSessionFromUser("nip07", user));
  }, [ndk, buildSessionFromUser]);

  // 2. Auth: Private Key (nsec)
  const loginWithNsec = useCallback(
    async (nsec: string, remember: boolean = false) => {
      try {
        void remember;
        const { type, data } = nip19.decode(nsec);
        if (type !== "nsec") throw new Error("Invalid nsec");

        const hexKey = u8ToHex(data as Uint8Array);
        const signer = new NDKPrivateKeySigner(hexKey);
        ndk.signer = signer;
        const user = await signer.user();
        profileHydrationAttempted.current.delete(user.pubkey);

        // Keep nsec in sessionStorage for the active browser session so
        // request-bound auth proofs can be signed without extension prompts.
        storeNsec(nsec);

        setSession(await buildSessionFromUser("local_nsec", user));
      } catch (e) {
        console.error("Login failed", e);
        throw e;
      }
    },
    [ndk, buildSessionFromUser],
  );

  // 3. Auth: Signup (Ephemeral or Stored)
  const signup = useCallback(
    async (remember: boolean = false) => {
      void remember;
      const sk = generateSecretKey();
      const hexKey = u8ToHex(sk);
      const nsec = nip19.nsecEncode(sk);

      const signer = new NDKPrivateKeySigner(hexKey);
      ndk.signer = signer;
      const user = await signer.user();
      profileHydrationAttempted.current.delete(user.pubkey);

      // Keep nsec in sessionStorage for the active browser session so
      // request-bound auth proofs can be signed without extension prompts.
      storeNsec(nsec);
      setSession(await buildSessionFromUser("local_nsec", user));

      return { nsec, user };
    },
    [ndk, buildSessionFromUser],
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
    profileHydrationAttempted.current.clear();
    setSession({ type: "anon" });
  }, [ndk]);

  useEffect(() => {
    if (
      session.type === "anon" ||
      !session.pubkey ||
      !session.user ||
      session.profile
    ) {
      return;
    }
    if (profileHydrationAttempted.current.has(session.pubkey)) {
      return;
    }
    profileHydrationAttempted.current.add(session.pubkey);

    let cancelled = false;
    const currentPubkey = session.pubkey;
    void hydrateUserProfile(session.user)
      .then((profile) => {
        if (cancelled || !profile) return;
        setSession((prev) => {
          if (prev.pubkey !== currentPubkey || prev.type === "anon")
            return prev;
          return { ...prev, profile, user: prev.user };
        });
      })
      .catch(() => {
        // Keep fallback rendering if relays are unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [session.type, session.pubkey, session.user, session.profile]);

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
      setSession((prev) => {
        if (prev.type === "anon") return prev;
        const profile = { ...(prev.profile || {}), name, about, picture };
        if (prev.user) prev.user.profile = profile;
        return { ...prev, profile, user: prev.user };
      });
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
