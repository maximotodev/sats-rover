import { useState, useEffect } from "react";
import NDK from "@nostr-dev-kit/ndk";
import { NDKNWCWallet as NDKNwc } from "@nostr-dev-kit/wallet";

export function useLightningEngine(ndk: NDK | null) {
  const [nwc, setNwc] = useState<NDKNwc | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");

  // Helper to parse connection string
  const parseConnectionStr = (str: string) => {
    try {
      const url = new URL(str.replace("nostr+walletconnect:", "http:"));
      const pubkey = url.hostname || url.pathname.replace("//", "");
      const relay = url.searchParams.get("relay");
      const secret = url.searchParams.get("secret");
      if (!pubkey || !relay || !secret) throw new Error("Missing params");
      return { pubkey, relayUrls: [relay], secret };
    } catch (e) {
      throw new Error("Invalid NWC String");
    }
  };

  const ignite = async (connectionString: string) => {
    if (!ndk) return;
    setStatus("connecting");
    try {
      const config = parseConnectionStr(connectionString);
      const instance = new NDKNwc(ndk, {
        pubkey: config.pubkey,
        relayUrls: config.relayUrls,
        secret: config.secret,
      });

      // Wait for handshake
      await new Promise((r) => setTimeout(r, 1000));

      setNwc(instance);
      setStatus("connected");
      localStorage.setItem("satsrover_nwc", connectionString);
      checkFuel(instance);
    } catch (e) {
      console.error("Engine Start Failed", e);
      setStatus("error");
    }
  };

  const checkFuel = async (instance: NDKNwc) => {
    try {
      await instance.updateBalance();
      // @ts-ignore
      const bal = instance.balance;
      if (bal && typeof bal.amount === "number") setBalance(bal.amount);
    } catch (e) {
      console.error("Fuel check failed");
    }
  };

  const payInvoice = async (bolt11: string) => {
    if (!nwc) throw new Error("Engine not ready");
    const res = await nwc.lnPay({ pr: bolt11 });
    if (!res) throw new Error("No response");
    checkFuel(nwc);
    return res;
  };

  // Auto-ignite
  useEffect(() => {
    const stored = localStorage.getItem("satsrover_nwc");
    if (stored && ndk && status === "idle") ignite(stored);
  }, [ndk]);

  return {
    nwc,
    balance,
    status,
    ignite,
    payInvoice,
    disconnect: () => {
      setNwc(null);
      setBalance(null);
      setStatus("idle");
      localStorage.removeItem("satsrover_nwc");
    },
  };
}
