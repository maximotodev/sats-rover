// apps/web/src/context/identity-context.tsx
"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { NDKUserProfile } from "@nostr-dev-kit/ndk";
import { useNostr } from "@/hooks/use-nostr";

export type IdentityStatus = "anon" | "authenticating" | "ready" | "error";
export type SignerType = "nip07" | "local_nsec" | "anon";

interface IdentityState {
  status: IdentityStatus;
  pubkey?: string;
  profile?: NDKUserProfile;
  signerType?: SignerType;
  error?: string;
}

interface IdentityContextValue {
  state: IdentityState;
  ndk: ReturnType<typeof useNostr>["ndk"];
  session: ReturnType<typeof useNostr>["session"];
  actions: {
    loginWithNip07: () => Promise<void>;
    loginWithNsec: (nsec: string, remember?: boolean) => Promise<void>;
    signup: (
      remember?: boolean,
    ) => Promise<{ nsec: string; user: { pubkey: string } } | undefined>;
    logout: () => void;
    publishSignal: ReturnType<typeof useNostr>["publishSignal"];
    publishClaim: ReturnType<typeof useNostr>["publishClaim"];
    updateProfile: ReturnType<typeof useNostr>["updateProfile"];
  };
}

const IdentityContext = createContext<IdentityContextValue | null>(null);

function mapIdentityStatus(
  sessionType: ReturnType<typeof useNostr>["session"]["type"],
  isAuthenticating: boolean,
  error: string | null,
): IdentityStatus {
  if (isAuthenticating) return "authenticating";
  if (error) return "error";
  return sessionType === "anon" ? "anon" : "ready";
}

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const nostr = useNostr();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withAuthState = async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsAuthenticating(true);
    setError(null);
    try {
      return await fn();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "identity_error");
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const value = useMemo<IdentityContextValue>(() => {
    const status = mapIdentityStatus(
      nostr.session.type,
      isAuthenticating,
      error,
    );
    const signerType: SignerType =
      nostr.session.type === "nip07"
        ? "nip07"
        : nostr.session.type === "local_nsec"
          ? "local_nsec"
          : "anon";

    return {
      state: {
        status,
        pubkey: nostr.session.pubkey,
        profile: nostr.session.profile,
        signerType,
        error: error || undefined,
      },
      ndk: nostr.ndk,
      session: nostr.session,
      actions: {
        loginWithNip07: () => withAuthState(nostr.loginWithExtension),
        loginWithNsec: (nsec: string, remember?: boolean) =>
          withAuthState(() => nostr.loginWithNsec(nsec, remember)),
        signup: (remember?: boolean) =>
          withAuthState(() => nostr.signup(remember)),
        logout: () => {
          setError(null);
          nostr.logout();
        },
        publishSignal: nostr.publishSignal,
        publishClaim: nostr.publishClaim,
        updateProfile: nostr.updateProfile,
      },
    };
  }, [nostr, isAuthenticating, error]);

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used inside IdentityProvider");
  return ctx;
}
