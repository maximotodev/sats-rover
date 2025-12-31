// src/components/wallet/WalletDrawer.tsx
import React, { useState } from "react";
import {
  X,
  Zap,
  LogOut,
  Send,
  Loader2,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  status: "idle" | "connecting" | "connected" | "error";
  balance: number | null;
  onConnect: (str: string) => void;
  onDisconnect: () => void;
  onPay: (invoice: string) => Promise<any>;
}

export default function WalletDrawer({
  isOpen,
  onClose,
  status,
  balance,
  onConnect,
  onDisconnect,
  onPay,
}: WalletDrawerProps) {
  const [nwcString, setNwcString] = useState("");
  const [invoice, setInvoice] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<
    "success" | "error" | null
  >(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    if (!invoice) return;
    setPaying(true);
    setPaymentResult(null);
    try {
      await onPay(invoice);
      setPaymentResult("success");
      setInvoice("");
      setTimeout(() => setPaymentResult(null), 3000);
    } catch (e) {
      setPaymentResult("error");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-charcoal border-t sm:border border-charcoal-light rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom text-gray-200 font-mono">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-charcoal-light pb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-bitcoin">
            <Terminal className="w-5 h-5" />
            NWC_TERMINAL
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-charcoal-light rounded-full text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === "connected" ? (
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="text-center py-6 bg-charcoal-light/50 rounded-xl border border-charcoal-light">
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2">
                AVAILABLE LIQUIDITY
              </p>
              <h3 className="text-4xl font-bold text-white tracking-tight">
                {balance?.toLocaleString()}{" "}
                <span className="text-lg text-bitcoin">sats</span>
              </h3>
            </div>

            {/* Permissions Badge */}
            <div className="flex items-center gap-2 text-[10px] text-matrix bg-matrix/10 p-2 rounded border border-matrix/20">
              <ShieldCheck className="w-3 h-3" />
              SESSION SECURE. PERMISSIONS: PAY_INVOICE
            </div>

            {/* Pay Form */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                Execute Payment
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 p-3 bg-black border border-charcoal-light rounded-lg text-xs font-mono text-white focus:ring-1 focus:ring-bitcoin outline-none"
                  placeholder="lnbc..."
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                />
                <button
                  onClick={handlePay}
                  disabled={paying || !invoice}
                  className={cn(
                    "px-4 rounded-lg font-bold text-black flex items-center justify-center transition-all",
                    paymentResult === "success"
                      ? "bg-matrix"
                      : paymentResult === "error"
                        ? "bg-red-500"
                        : "bg-bitcoin hover:brightness-110"
                  )}
                >
                  {paying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              {/* ✅ FIXED: Escaped the '>>' characters */}
              {paymentResult === "success" && (
                <p className="text-xs text-matrix mt-2">
                  {`>>`} PAYMENT CONFIRMED [BLOCK 834...]
                </p>
              )}
              {paymentResult === "error" && (
                <p className="text-xs text-red-500 mt-2">
                  {`>>`} ERROR: ROUTE_FAILED
                </p>
              )}
            </div>

            <button
              onClick={onDisconnect}
              className="w-full py-3 border border-red-900/30 text-red-500/80 rounded-lg hover:bg-red-900/10 transition-colors text-xs flex items-center justify-center uppercase tracking-widest"
            >
              <LogOut className="w-3 h-3 mr-2" /> Terminate Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-charcoal-light p-4 rounded-lg text-xs text-gray-400 border-l-2 border-bitcoin">
              Initialize connection using <strong>NIP-47</strong> string. Keys
              remain on your remote signer (Alby/Mutiny).
            </div>

            <textarea
              className="w-full h-24 p-3 bg-black border border-charcoal-light rounded-lg text-[10px] font-mono text-gray-300 focus:border-bitcoin outline-none resize-none"
              placeholder="nostr+walletconnect://..."
              value={nwcString}
              onChange={(e) => setNwcString(e.target.value)}
            />

            <button
              onClick={() => onConnect(nwcString)}
              disabled={status === "connecting" || !nwcString}
              className="w-full bg-bitcoin text-black font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide text-xs"
            >
              {status === "connecting" ? "Handshaking..." : "Initialize Uplink"}
              <Zap className="w-4 h-4 fill-black" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
