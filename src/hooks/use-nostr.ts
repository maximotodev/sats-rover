import { useState, useEffect } from "react";
import NDK, {
  NDKEvent,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKUser,
} from "@nostr-dev-kit/ndk";
import { nip19, generateSecretKey } from "nostr-tools";
import { storeNsec, loadNsec, clearNsec } from "@/lib/storage";

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

  // Restore session only if it exists in storage
  useEffect(() => {
    if (ndk && session.type === "anon") {
      const storedNsec = loadNsec();
      if (storedNsec) {
        // Auto-login implies we remembered it
        loginWithNsec(storedNsec, true).catch(() => clearNsec());
      }
    }
  }, [ndk]);

  const loginWithExtension = async () => {
    if (!ndk || !window.nostr) throw new Error("No extension");
    const signer = new NDKNip07Signer();
    ndk.signer = signer;
    const user = await signer.user();
    await user.fetchProfile();
    setSession({ type: "nip07", pubkey: user.pubkey, user });
  };

  // ✅ MODIFIED: Added 'remember' flag
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

      if (remember) {
        storeNsec(nsec);
      } else {
        clearNsec(); // Ensure we don't persist if they unchecked it
      }

      setSession({ type: "local_nsec", pubkey: user.pubkey, user });
    } catch (e) {
      console.error("Login failed", e);
      throw e;
    }
  };

  // ✅ MODIFIED: Added 'remember' flag
  const signup = async (remember: boolean = false) => {
    if (!ndk) return;

    const sk = generateSecretKey();
    const hexKey = Buffer.from(sk).toString("hex");
    const nsec = nip19.nsecEncode(sk);

    const signer = new NDKPrivateKeySigner(hexKey);
    ndk.signer = signer;
    const user = await signer.user();

    if (remember) {
      storeNsec(nsec);
    }

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
    updateProfile,
    logout,
    publishSignal,
  };
}
