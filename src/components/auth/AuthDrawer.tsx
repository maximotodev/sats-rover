import React, { useState } from "react";
import {
  X,
  KeyRound,
  UserPlus,
  Copy,
  Check,
  ShieldAlert,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useSession } from "@/contexts/NostrSessionContext";

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const { loginWithExtension, loginWithNsec, signup, session, logout } =
    useSession();

  const [mode, setMode] = useState<"menu" | "login" | "signup_success">("menu");
  const [nsecInput, setNsecInput] = useState("");
  const [createdNsec, setCreatedNsec] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSignup = async () => {
    const nsec = await signup();
    if (nsec) {
      setCreatedNsec(nsec);
      setMode("signup_success");
    }
  };

  const handleNsecLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nsecInput.startsWith("nsec1")) return alert("Invalid nsec");
    await loginWithNsec(nsecInput);
    onClose();
  };

  const copyToClipboard = () => {
    if (createdNsec) {
      navigator.clipboard.writeText(createdNsec);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom text-white font-mono">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-bitcoin">
            <KeyRound className="w-5 h-5" />
            NOSTR_IDENTITY
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. LOGGED IN */}
        {session.type !== "anon" && mode !== "signup_success" ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-bitcoin/10 rounded-full flex items-center justify-center border border-bitcoin/30">
              <UserPlus className="w-10 h-10 text-bitcoin" />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">
                Connected
              </p>
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 font-mono text-xs break-all">
                {session.pubkey}
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-4 bg-red-900/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Disconnect
            </button>
          </div>
        ) : mode === "signup_success" ? (
          // 2. SIGNUP SUCCESS
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1">
                Identity Created
              </h3>
              <p className="text-xs text-gray-400">
                Welcome to the sovereign web.
              </p>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Secret Key Backup
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
                This key is <strong>only stored in memory</strong>. Save it now
                or lose your account forever.
              </p>
              <div className="relative">
                <input
                  readOnly
                  value={createdNsec || ""}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pr-10 text-xs text-bitcoin font-mono focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-2 p-1 hover:bg-white/10 rounded text-gray-400"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-matrix" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-bitcoin text-black font-bold rounded-lg text-sm uppercase tracking-widest hover:brightness-110"
            >
              I Have Saved My Key
            </button>
          </div>
        ) : mode === "login" ? (
          // 3. LOGIN FORM
          <form onSubmit={handleNsecLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">
                Private Key (nsec)
              </label>
              <input
                type="password"
                placeholder="nsec1..."
                autoFocus
                className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:border-bitcoin outline-none font-mono"
                value={nsecInput}
                onChange={(e) => setNsecInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-bitcoin text-black font-bold rounded-lg text-sm uppercase tracking-widest hover:brightness-110"
            >
              Connect
            </button>
            <button
              type="button"
              onClick={() => setMode("menu")}
              className="w-full py-3 text-gray-500 text-xs hover:text-white"
            >
              Back
            </button>
          </form>
        ) : (
          // 4. MAIN MENU
          <div className="space-y-4">
            <button
              onClick={handleSignup}
              className="w-full py-5 bg-bitcoin text-black font-bold rounded-xl flex items-center justify-between px-6 hover:brightness-110 transition-all group"
            >
              <span className="uppercase tracking-widest text-sm">
                Create Account
              </span>
              <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>

            <div className="flex items-center gap-4 my-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                Or Login
              </span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("login")}
                className="py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex flex-col items-center gap-2"
              >
                <KeyRound className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                  Use Key
                </span>
              </button>
              <button
                onClick={() => loginWithExtension().then(onClose)}
                className="py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex flex-col items-center gap-2"
              >
                <UserPlus className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                  Extension
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
