"use client";
import React, { createContext, useContext } from "react";
import NDK from "@nostr-dev-kit/ndk";
import { useNostr, NostrSession } from "@/hooks/use-nostr";

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
  ) => Promise<{ nsec: string; user: any } | undefined>;
  updateProfile: (name: string, about: string, picture: string) => Promise<void>;
  logout: () => void;
  publishSignal: (
    merchantId: string,
    paymentResult: "success" | "failed" | "did_not_try",
    comment: string,
  ) => Promise<{ ok: boolean; eventId?: string }>;
}

const NostrSessionContext = createContext<NostrSessionContextValue | null>(
  null,
);

export function NostrSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const nostr = useNostr();

  const capabilities: SessionCapabilities = {
    canSign: nostr.session.type !== "anon",
    canPublish: nostr.session.type !== "anon",
    canPay: true,
  };

  return (
    <NostrSessionContext.Provider
      value={{
        ndk: nostr.ndk,
        session: nostr.session,
        capabilities,
        loginWithExtension: nostr.loginWithExtension,
        loginWithNsec: nostr.loginWithNsec,
        signup: nostr.signup,
        updateProfile: nostr.updateProfile,
        logout: nostr.logout,
        publishSignal: nostr.publishSignal,
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
