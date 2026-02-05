import React, { useState } from "react";
import {
  User,
  Radio,
  Trophy,
  Fingerprint,
  LogOut,
  X,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { useSession } from "@/contexts/NostrSessionContext";
import { cn } from "@/lib/utils";
import { nip19 } from "nostr-tools";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const { session, logout } = useSession();
  const [copied, setCopied] = useState(false);

  // Derive npub safely
  const npub = session.pubkey ? nip19.npubEncode(session.pubkey) : "";
  const displayNpub = npub ? `${npub.slice(0, 10)}...${npub.slice(-4)}` : "";

  const copyNpub = () => {
    if (!npub) return;
    navigator.clipboard.writeText(npub);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (session.type === "anon") return null; // Hard Guard: Sidebar only for Identity

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 w-3/4 max-w-70 bg-[#0A0A0A] border-r border-white/10 z-50 transform transition-transform duration-300 ease-out flex flex-col font-mono",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* IDENTITY HEADER */}
        <div className="p-6 border-b border-white/10 bg-[#121212]">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-xl font-bold text-white tracking-tighter">
              SATS<span className="text-[#F7931A]">ROVER</span>
            </h1>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500 hover:text-white" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {session.user?.profile?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.profile.image}
                className="w-12 h-12 rounded-full border border-white/10 object-cover bg-gray-800"
                alt="Profile"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#F7931A]/10 border border-[#F7931A]/30 flex items-center justify-center text-[#F7931A]">
                <User className="w-6 h-6" />
              </div>
            )}

            <div className="flex-1 overflow-hidden">
              <p className="text-base font-bold text-white truncate">
                {session.user?.profile?.name || "Sovereign User"}
              </p>

              {/* Npub Copy */}
              <button
                onClick={copyNpub}
                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-white transition-colors group mt-1"
              >
                <span className="font-mono">{displayNpub}</span>
                {copied ? (
                  <Check className="w-3 h-3 text-[#00FF41]" />
                ) : (
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Protocol Layer
          </div>
          <nav className="space-y-1 px-2">
            <MenuItem
              icon={Radio}
              label="Network Pulse"
              onClick={() => {
                onNavigate("activity");
                onClose();
              }}
            />
            <MenuItem
              icon={Trophy}
              label="Proof of Presence"
              onClick={() => {
                onNavigate("earn");
                onClose();
              }}
            />
          </nav>

          <div className="px-4 mt-6 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            System
          </div>
          <nav className="space-y-1 px-2">
            <MenuItem
              icon={Fingerprint}
              label="Manifesto"
              onClick={() => {
                onNavigate("manifesto");
                onClose();
              }}
            />
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10 bg-[#121212]">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-3 w-full p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Disconnect Identity
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

function MenuItem({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full p-3 rounded-lg hover:bg-white/5 transition-all group text-left"
    >
      <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#F7931A] transition-colors" />
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-200 group-hover:text-white">
          {label}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500" />
    </button>
  );
}
