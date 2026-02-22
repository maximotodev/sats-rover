"use client";

import React, { useState } from "react";
import { X, KeyRound, Loader2 } from "lucide-react";
import { useIdentity } from "@/context/identity-context";

interface IdentityGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IdentityGateModal({ isOpen, onClose }: IdentityGateModalProps) {
  const { actions, state } = useIdentity();
  const [nsec, setNsec] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNip07 = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await actions.loginWithNip07();
      onClose();
    } catch {
      setError("missing_identity");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNsec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nsec.startsWith("nsec1")) {
      setError("invalid_nsec");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await actions.loginWithNsec(nsec);
      onClose();
    } catch {
      setError("missing_identity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#0b0b0b] p-5 text-white font-mono">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-widest text-[#F7931A] font-bold">Identity Required</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleNip07}
          disabled={submitting || state.status === "authenticating"}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded border border-white/20 bg-white/5 px-4 py-3 text-xs uppercase tracking-widest hover:bg-white/10 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          Continue with NIP-07
        </button>

        <form onSubmit={handleNsec} className="space-y-2">
          <input
            value={nsec}
            onChange={(e) => setNsec(e.target.value)}
            placeholder="nsec1..."
            className="w-full rounded border border-white/20 bg-black p-3 text-xs outline-none focus:border-[#F7931A]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-[#F7931A] px-4 py-3 text-xs font-bold uppercase tracking-widest text-black disabled:opacity-50"
          >
            Use nsec
          </button>
        </form>

        {(error || state.error) && (
          <p className="mt-3 text-[10px] text-red-400 font-mono">reason_code: {error || state.error}</p>
        )}
      </div>
    </div>
  );
}
