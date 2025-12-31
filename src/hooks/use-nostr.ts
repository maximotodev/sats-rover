import { useState, useEffect } from "react";
import NDK, {
  NDKEvent,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKUser,
} from "@nostr-dev-kit/ndk";
import { nip19, generateSecretKey } from "nostr-tools";

let ndkInstance: NDK | null = null;

export type SessionType = "anon" | "extension" | "ephemeral";

export interface NostrSession {
  type: SessionType;
  pubkey?: string;
  user?: NDKUser;
  // Note: nsec is purposely EXCLUDED from state to prevent storage leaks
}

export function useNostr() {
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [session, setSession] = useState<NostrSession>({ type: "anon" });

  // 1. Initialize NDK
  useEffect(() => {
    const init = async () => {
      if (ndkInstance) {
        setNdk(ndkInstance);
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
        console.log("🔗 Nostr Connected (Anon)");
      } catch (e) {
        console.error("Nostr Init Failed", e);
      }
    };
    init();
  }, []);

  // 2. Login Strategies
  const loginWithExtension = async () => {
    if (!ndk || !window.nostr) throw new Error("No extension");
    const signer = new NDKNip07Signer();
    ndk.signer = signer;
    const user = await signer.user();
    await user.fetchProfile();
    setSession({ type: "extension", pubkey: user.pubkey, user });
  };

  const loginWithNsec = async (nsec: string) => {
    if (!ndk) return;
    const { type, data } = nip19.decode(nsec);
    if (type !== "nsec") throw new Error("Invalid nsec");

    const hexKey = Buffer.from(data as Uint8Array).toString("hex");
    const signer = new NDKPrivateKeySigner(hexKey);
    ndk.signer = signer;
    const user = await signer.user();
    await user.fetchProfile();
    setSession({ type: "ephemeral", pubkey: user.pubkey, user });
  };

  // ✅ NEW: Signup Strategy
  const signup = async (): Promise<string | undefined> => {
    if (!ndk) return;

    // Generate keys
    const sk = generateSecretKey();
    const hexKey = Buffer.from(sk).toString("hex");
    const nsec = nip19.nsecEncode(sk);

    // Sign in immediately
    const signer = new NDKPrivateKeySigner(hexKey);
    ndk.signer = signer;
    const user = await signer.user();

    // Set session (Ephemeral)
    setSession({ type: "ephemeral", pubkey: user.pubkey, user });

    // Return nsec to UI *once* for backup display
    return nsec;
  };

  const logout = () => {
    if (ndk) ndk.signer = undefined;
    setSession({ type: "anon" });
  };

  // 3. Publishing
  const publishSignal = async (
    kind: number,
    content: string,
    tags: string[][]
  ) => {
    if (session.type === "anon" || !ndk) throw new Error("Auth required");
    const event = new NDKEvent(ndk);
    event.kind = kind;
    event.content = content;
    event.tags = tags;
    await event.publish();
    return true;
  };

  return {
    ndk,
    session,
    loginWithExtension,
    loginWithNsec,
    signup,
    logout,
    publishSignal,
  };
}
