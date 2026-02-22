"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useCallback } from "react";
import { NDKNWCWallet as NDKNwc } from "@nostr-dev-kit/wallet";
import { useSession } from "@/contexts/NostrSessionContext";
import { getNwcStorageKey, parseNwcUrl } from "@/lib/wallet/nwc";

export type WalletState = "disconnected" | "connecting" | "connected" | "error";

export interface WalletConnectionInfo {
  provider: "nwc";
  relayHint?: string;
  lastConnectedAt?: number;
}

interface WalletContextValue {
  state: WalletState;
  provider: "nwc";
  connectionInfo?: WalletConnectionInfo;
  balance: number | null;
  error?: string;
  connectNWC: (nwcUrl: string, options?: { relayHint?: string }) => Promise<void>;
  disconnect: () => void;
  getStatus: () => { state: WalletState; provider: "nwc"; reason_code?: string };
  payInvoice: (
    bolt11: string,
    opts?: Record<string, unknown>,
  ) => Promise<unknown>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { ndk } = useSession();
  const [state, setState] = useState<WalletState>("disconnected");
  const [balance, setBalance] = useState<number | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<WalletConnectionInfo | undefined>();
  const [error, setError] = useState<string | undefined>();
  const walletRef = useRef<NDKNwc | null>(null);

  const checkBalance = async (instance: NDKNwc) => {
    try {
      await instance.updateBalance();
      const maybeBalance = (instance as unknown as { balance?: { amount?: number } })
        .balance;
      if (typeof maybeBalance?.amount === "number") {
        setBalance(maybeBalance.amount);
      }
    } catch {
      // Non-fatal for foundation PR.
    }
  };

  const disconnect = useCallback(() => {
    walletRef.current = null;
    setState("disconnected");
    setBalance(null);
    setError(undefined);
    setConnectionInfo(undefined);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(getNwcStorageKey());
    }
  }, []);

  const connectNWC = useCallback(
    async (nwcUrl: string, options?: { relayHint?: string }) => {
      if (!ndk) {
        setState("error");
        setError("wallet_connect_failed");
        throw new Error("wallet_connect_failed");
      }

      setState("connecting");
      setError(undefined);

      try {
        const parsed = parseNwcUrl(nwcUrl);
        const instance = new NDKNwc(ndk, {
          pubkey: parsed.pubkey,
          relayUrls: [parsed.relay],
          secret: parsed.secret,
        });
        walletRef.current = instance;
        setConnectionInfo({
          provider: "nwc",
          relayHint: options?.relayHint || parsed.relay,
          lastConnectedAt: Date.now(),
        });
        setState("connected");
        if (typeof window !== "undefined") {
          sessionStorage.setItem(getNwcStorageKey(), nwcUrl);
        }
        void checkBalance(instance);
      } catch (err: unknown) {
        const reason =
          err instanceof Error && err.message === "invalid_nwc_url"
            ? "invalid_nwc_url"
            : "wallet_connect_failed";
        walletRef.current = null;
        setState("error");
        setError(reason);
        throw new Error(reason);
      }
    },
    [ndk],
  );

  const payInvoice = useCallback(async (bolt11: string) => {
    const wallet = walletRef.current;
    if (!wallet) {
      throw new Error("missing_wallet");
    }
    try {
      const res = await wallet.lnPay({ pr: bolt11 });
      if (!res) throw new Error("wallet_unimplemented");
      void checkBalance(wallet);
      return res;
    } catch {
      throw new Error("wallet_unimplemented");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !ndk || state !== "disconnected") return;
    const stored = sessionStorage.getItem(getNwcStorageKey());
    if (!stored) return;
    let cancelled = false;
    void connectNWC(stored).catch(() => {
      if (!cancelled) {
        sessionStorage.removeItem(getNwcStorageKey());
      }
    });
    return () => {
      cancelled = true;
    };
  }, [connectNWC, ndk, state]);

  const value = useMemo<WalletContextValue>(
    () => ({
      state,
      provider: "nwc",
      connectionInfo,
      balance,
      error,
      connectNWC,
      disconnect,
      getStatus: () => ({
        state,
        provider: "nwc",
        reason_code: error,
      }),
      payInvoice,
    }),
    [state, connectionInfo, balance, error, connectNWC, disconnect, payInvoice],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
