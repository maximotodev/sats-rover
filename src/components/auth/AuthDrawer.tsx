import React, { useState, useEffect } from "react";
import {
  X,
  KeyRound,
  UserPlus,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Upload,
} from "lucide-react";
import { useSession } from "@/contexts/NostrSessionContext";

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = "menu" | "login" | "create_profile" | "backup";

export default function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const { loginWithExtension, loginWithNsec, signup, updateProfile, session } =
    useSession();

  const [step, setStep] = useState<AuthStep>("menu");
  const [nsecInput, setNsecInput] = useState("");
  const [createdNsec, setCreatedNsec] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    picture: "",
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: Persist Toggle
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // If already logged in, show menu or close?
      // Actually, if logged in, this drawer shouldn't typically open via the center button,
      // but if it does (e.g. from Sidebar "Switch Account"), we reset.
      setStep("menu");
      setNsecInput("");
      setCreatedNsec(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartSignup = async () => {
    setLoading(true);
    const result = await signup(rememberMe); // Pass toggle
    if (result) {
      setCreatedNsec(result.nsec);
      const randomAvatar = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${result.user.pubkey}`;
      setFormData((prev) => ({ ...prev, picture: randomAvatar }));
      setStep("create_profile");
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    await updateProfile(formData.name, formData.about, formData.picture);
    setLoading(false);
    setStep("backup");
  };

  const handleNsecLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nsecInput.startsWith("nsec1")) return alert("Invalid nsec");
    await loginWithNsec(nsecInput, rememberMe); // Pass toggle
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
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
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

        {/* STEP 1: MENU */}
        {step === "menu" && (
          <div className="space-y-4">
            <button
              onClick={handleStartSignup}
              disabled={loading}
              className="w-full py-5 bg-bitcoin text-black font-bold rounded-xl flex items-center justify-between px-6 hover:brightness-110 transition-all group"
            >
              <span className="uppercase tracking-widest text-sm">
                {loading ? "Generating..." : "Create Account"}
              </span>
              <UserPlus className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>

            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-bitcoin w-4 h-4"
              />
              <label
                htmlFor="remember"
                className="text-xs text-gray-400 select-none cursor-pointer"
              >
                Keep me logged in
              </label>
            </div>

            <div className="flex items-center gap-4 my-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                Or
              </span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep("login")}
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

        {/* STEP 2: LOGIN */}
        {step === "login" && (
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember_login"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-bitcoin w-4 h-4"
              />
              <label
                htmlFor="remember_login"
                className="text-xs text-gray-400 select-none cursor-pointer"
              >
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-bitcoin text-black font-bold rounded-lg text-sm uppercase tracking-widest hover:brightness-110"
            >
              Connect
            </button>
            <button
              type="button"
              onClick={() => setStep("menu")}
              className="w-full py-3 text-gray-500 text-xs hover:text-white"
            >
              Back
            </button>
          </form>
        )}

        {/* STEP 3: CREATE PROFILE */}
        {step === "create_profile" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-white/5 rounded-full p-1 border-2 border-bitcoin relative overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.picture}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                Your Digital Self
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-bitcoin outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Bio (Optional)"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-bitcoin outline-none"
                value={formData.about}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={!formData.name || loading}
              className="w-full py-4 bg-bitcoin text-black font-bold rounded-lg text-sm uppercase tracking-widest hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Publishing..."
              ) : (
                <>
                  Save Profile <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 4: BACKUP */}
        {step === "backup" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-bitcoin/10 p-4 rounded-lg border border-bitcoin/30 text-center">
              <h3 className="text-bitcoin font-bold text-lg mb-1">
                Identity Created
              </h3>
              <p className="text-xs text-gray-400">Welcome to the network.</p>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Secret Key Backup
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
                This key is the <strong>only way</strong> to access your
                account.
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
              className="w-full py-4 bg-white/10 text-white font-bold rounded-lg text-sm uppercase tracking-widest hover:bg-white/20"
            >
              I Have Saved My Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
