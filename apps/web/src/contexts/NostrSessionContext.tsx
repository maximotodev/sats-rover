"use client";
import React, { createContext, useContext } from "react";
import NDK from "@nostr-dev-kit/ndk";
import { NostrSession } from "@/hooks/use-nostr";
import { useIdentity } from "@/context/identity-context";

export interface SessionCapabilities {
  canSign: boolean;
  canPublish: boolean;
  canPay: boolean;
}

interface NostrSessionContextValue {
  ndk: NDK | null;
  session: NostrSession;
  capabilities: SessionCapabilities;
  loginWithExtension: () => Promise<void>;
  loginWithNsec: (nsec: string, remember?: boolean) => Promise<void>;
  signup: (
    remember?: boolean,
  ) => Promise<{ nsec: string; user: { pubkey: string } } | undefined>;
  updateProfile: (name: string, about: string, picture: string) => Promise<void>;
  logout: () => void;
  publishSignal: (
    merchantId: string,
    paymentResult: "success" | "failed" | "did_not_try",
    comment: string,
  ) => Promise<{ ok: boolean; eventId?: string }>;
  publishClaim: (merchantId: string) => Promise<boolean>;
}

const NostrSessionContext = createContext<NostrSessionContextValue | null>(
  null,
);

export function NostrSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = useIdentity();

  const capabilities: SessionCapabilities = {
    canSign: identity.session.type !== "anon",
    canPublish: identity.session.type !== "anon",
    canPay: true,
  };

  return (
    <NostrSessionContext.Provider
      value={{
        ndk: identity.ndk,
        session: identity.session,
        capabilities,
        loginWithExtension: identity.actions.loginWithNip07,
        loginWithNsec: identity.actions.loginWithNsec,
        signup: identity.actions.signup,
        updateProfile: identity.actions.updateProfile,
        logout: identity.actions.logout,
        publishSignal: identity.actions.publishSignal,
        publishClaim: identity.actions.publishClaim,
      }}
    >
      {children}
    </NostrSessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(NostrSessionContext);
  if (!ctx)
    throw new Error("useSession must be used inside NostrSessionProvider");
  return ctx;
}
