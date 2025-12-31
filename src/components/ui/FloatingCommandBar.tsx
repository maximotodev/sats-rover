import React from "react";
import {
  Zap,
  Command,
  Map,
  Trophy,
  Wallet,
  X,
  User,
  Fingerprint,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/NostrSessionContext";

export type CommandView =
  | "idle"
  | "menu"
  | "wallet"
  | "hub"
  | "earn"
  | "manifesto"
  | "auth";

interface CommandBarProps {
  balance: number | null;
  status: "idle" | "connecting" | "connected" | "error";
  view: CommandView;
  currentHub: string;
  onSetView: (v: CommandView) => void;
}

export default function FloatingCommandBar({
  balance,
  status,
  view,
  currentHub,
  onSetView,
}: CommandBarProps) {
  const { session } = useSession();

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 w-full max-w-sm px-4">
      {/* EXPANDED MENU */}
      {view === "menu" && (
        <div className="flex gap-3 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <MenuButton icon={Map} label="HUB" onClick={() => onSetView("hub")} />
          <MenuButton
            icon={Wallet}
            label="WALLET"
            onClick={() => onSetView("wallet")}
            active={status === "connected"}
          />
          <MenuButton
            icon={Trophy}
            label="EARN"
            onClick={() => onSetView("earn")}
          />
          <MenuButton
            icon={Fingerprint}
            label="ABOUT"
            onClick={() => onSetView("manifesto")}
          />
        </div>
      )}

      {/* MAIN HUD BAR */}
      <div className="flex items-center justify-between w-full max-w-85 h-14 pl-4 pr-2 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50 transition-all">
        {/* LEFT: WALLET STATUS (Read Only) */}
        <div className="flex items-center gap-3 w-1/3">
          <div
            className={cn(
              "p-1.5 rounded-full",
              status === "connected" ? "bg-bitcoin/10" : "bg-white/5"
            )}
          >
            <Zap
              className={cn(
                "w-4 h-4",
                status === "connected"
                  ? "text-bitcoin fill-bitcoin"
                  : "text-gray-600"
              )}
            />
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <span className="font-mono text-xs font-bold text-white tracking-tight truncate w-full text-left">
              {balance !== null ? balance.toLocaleString() : "---"}
            </span>
          </div>
        </div>

        {/* CENTER: IDENTITY (Interactive) */}
        <button
          onClick={() => onSetView("auth")}
          className="flex items-center justify-center w-1/3 h-full border-l border-r border-white/5 px-2 hover:bg-white/5 transition-colors group cursor-pointer"
        >
          {session.type !== "anon" ? (
            <div className="flex items-center gap-2 text-matrix animate-pulse-slow">
              <User className="w-3 h-3" />
              <span className="font-mono text-[10px] font-bold truncate max-w-17.5">
                {session.user?.profile?.name || session.pubkey?.slice(0, 6)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 group-hover:text-white transition-colors">
              <LogIn className="w-3 h-3" />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Login
              </span>
            </div>
          )}
        </button>

        {/* RIGHT: COMMAND TOGGLE */}
        <button
          onClick={() => onSetView(view === "idle" ? "menu" : "idle")}
          className="flex items-center justify-end gap-3 w-1/3 pr-2 group"
        >
          <div
            className={cn(
              "p-2 rounded-full transition-colors",
              view === "menu"
                ? "bg-white text-black"
                : "bg-white/10 text-white group-hover:bg-white/20"
            )}
          >
            {view === "idle" ? (
              <Command className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick, active }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-14 h-14 rounded-2xl border backdrop-blur-md transition-all active:scale-90",
        active
          ? "bg-bitcoin/10 border-bitcoin text-bitcoin"
          : "bg-[#121212] border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
      )}
    >
      <Icon className="w-5 h-5 mb-1" />
      <span className="text-[8px] font-bold tracking-widest">{label}</span>
    </button>
  );
}
