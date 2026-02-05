import React from "react";
import {
  Zap,
  Command,
  Map,
  Trophy,
  Wallet,
  X,
  User,
  LogIn,
  Activity,
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
  | "auth"
  | "activity"
  | "sidebar";

interface CommandBarProps {
  balance: number | null;
  status: "idle" | "connecting" | "connected" | "error";
  view: CommandView;
  currentHub: string;
  onSetView: (v: CommandView) => void;
  onToggleSidebar: () => void;
}

export default function FloatingCommandBar({
  balance,
  status,
  view,
  currentHub,
  onSetView,
  onToggleSidebar,
}: CommandBarProps) {
  const { session } = useSession();

  const handleCenterClick = () => {
    if (session.type === "anon") {
      onSetView("auth");
    } else {
      onToggleSidebar(); // ✅ OPEN SIDEBAR IF LOGGED IN
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 w-full max-w-sm px-4">
      {/* 1. EXPANDED MENU */}
      {view === "menu" && (
        <div className="flex gap-3 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <MenuButton icon={Map} label="HUB" onClick={() => onSetView("hub")} />
          <MenuButton
            icon={Activity}
            label="FEED"
            onClick={() => onSetView("activity")}
          />
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
        </div>
      )}

      {/* 2. MAIN HUD BAR */}
      <div className="flex items-center justify-between w-full max-w-85 h-14 pl-4 pr-2 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50 transition-all">
        {/* LEFT: WALLET */}
        <button
          onClick={() => onSetView("wallet")}
          className="flex items-center gap-3 w-1/3 hover:opacity-80 transition-opacity text-left"
        >
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
            <span className="font-mono text-xs font-bold text-white tracking-tight truncate w-full">
              {balance !== null ? balance.toLocaleString() : "---"}
            </span>
          </div>
        </button>

        {/* CENTER: IDENTITY / SIDEBAR TRIGGER */}
        <button
          onClick={handleCenterClick} // ✅ FIXED HANDLER
          className="flex items-center justify-center w-1/3 h-full border-l border-r border-white/5 px-2 hover:bg-white/5 transition-colors group cursor-pointer"
        >
          {session.type !== "anon" ? (
            // ✅ LOGGED IN: Avatar Only
            session.user?.profile?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.profile.image}
                className="w-8 h-8 rounded-full border border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.2)] object-cover bg-gray-800"
                alt="Me"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/50 flex items-center justify-center text-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.2)]">
                <User className="w-4 h-4" />
              </div>
            )
          ) : (
            // LOGGED OUT: Login Text
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
          <span className="font-mono text-[10px] font-bold text-gray-600 uppercase hidden sm:block">
            CMD
          </span>
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

// ... MenuButton component ...
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
