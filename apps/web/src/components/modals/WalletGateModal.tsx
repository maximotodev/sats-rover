"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useWallet } from "@/context/wallet-context";

interface WalletGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletGateModal({ isOpen, onClose }: WalletGateModalProps) {
  const { connectNWC, error, state } = useWallet();
  const [nwcUrl, setNwcUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    try {
      await connectNWC(nwcUrl);
      onClose();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "invalid_nwc_url");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#0b0b0b] p-5 text-white font-mono">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-widest text-[#F7931A] font-bold">Wallet Required</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-2">
          <textarea
            value={nwcUrl}
            onChange={(e) => setNwcUrl(e.target.value)}
            placeholder="nostr+walletconnect://..."
            className="h-24 w-full rounded border border-white/20 bg-black p-3 text-xs outline-none focus:border-[#F7931A]"
          />
          <button
            type="submit"
            disabled={submitting || state === "connecting"}
            className="w-full rounded bg-[#F7931A] px-4 py-3 text-xs font-bold uppercase tracking-widest text-black disabled:opacity-50"
          >
            Connect NWC
          </button>
        </form>
        {(localError || error) && (
          <p className="mt-3 text-[10px] text-red-400 font-mono">reason_code: {localError || error}</p>
        )}
      </div>
    </div>
  );
}
