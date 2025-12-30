// src/components/map/MerchantDrawer.tsx
import React, { useState, useEffect } from "react";
import { Merchant } from "@/lib/types";
import {
  X,
  MapPin,
  Zap,
  Bitcoin,
  Navigation,
  User,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNostr } from "@/hooks/use-nostr";
import { NDKEvent, NDKUserProfile } from "@nostr-dev-kit/ndk";

interface MerchantDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
}

type ProfileMap = Record<string, NDKUserProfile>;

export default function MerchantDrawer({
  merchant,
  onClose,
}: MerchantDrawerProps) {
  // Use updated hook names
  const {
    user,
    loginWithExtension,
    loginWithNsec,
    publishCheckIn,
    fetchCheckIns,
    ndk,
  } = useNostr();

  // Local State
  const [reviews, setReviews] = useState<NDKEvent[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Login UI State
  const [showNsecInput, setShowNsecInput] = useState(false);
  const [nsec, setNsec] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // FETCH REVIEWS & PROFILES
  useEffect(() => {
    if (merchant) {
      setLoadingReviews(true);
      fetchCheckIns(merchant.id).then(async (notes) => {
        setReviews(notes);

        if (ndk && notes.length > 0) {
          const uniquePubkeys = Array.from(new Set(notes.map((n) => n.pubkey)));
          const newProfiles: ProfileMap = {};

          await Promise.all(
            uniquePubkeys.map(async (pk) => {
              const user = ndk.getUser({ pubkey: pk });
              const profile = await user.fetchProfile();
              if (profile) newProfiles[pk] = profile;
            })
          );
          setProfiles((prev) => ({ ...prev, ...newProfiles }));
        }
        setLoadingReviews(false);
      });
    } else {
      setReviews([]);
    }
  }, [merchant, ndk]);

  // HANDLE LOGIN FLOW
  const handleLoginStart = async () => {
    if (window.nostr) {
      try {
        await loginWithExtension();
      } catch (e) {
        setShowNsecInput(true); // Extension failed/rejected, fallback to NSEC
      }
    } else {
      setShowNsecInput(true); // No extension, show NSEC input
    }
  };

  const handleNsecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nsec.startsWith("nsec1")) {
      alert("Invalid format. Must start with nsec1...");
      return;
    }
    await loginWithNsec(nsec);
    setShowNsecInput(false);
  };

  const handleAction = async () => {
    if (!user) {
      handleLoginStart();
    } else {
      if (merchant)
        await publishCheckIn(
          merchant.name,
          merchant.id,
          merchant.lat,
          merchant.lon
        );
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 transform transition-transform duration-300 ease-in-out bg-white rounded-t-2xl shadow-2xl p-6 pb-10 sm:max-w-md sm:left-1/2 sm:-translate-x-1/2",
        merchant ? "translate-y-0" : "translate-y-full"
      )}
    >
      {merchant && (
        <>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

          {/* HEADER */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {merchant.name}
              </h2>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="capitalize">
                  {merchant.category.replace("_", " ")}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* BADGES */}
          <div className="flex flex-wrap gap-2 mb-6">
            {merchant.tags["payment:lightning"] === "yes" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Zap className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />{" "}
                Lightning
              </span>
            )}
            {merchant.tags["currency:XBT"] === "yes" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <Bitcoin className="w-3 h-3 mr-1 fill-orange-500 text-orange-500" />{" "}
                On-Chain
              </span>
            )}
          </div>

          {/* ACTION AREA */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* If Showing Login Input */}
            {showNsecInput && !user ? (
              <form
                onSubmit={handleNsecSubmit}
                className="col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Travel Mode Login
                  </label>
                  <button type="button" onClick={() => setShowNsecInput(false)}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder="nsec1..."
                    className="w-full text-sm p-2 pr-10 border rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
                    value={nsec}
                    onChange={(e) => setNsec(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-gray-400"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 bg-purple-600 text-white text-xs font-bold py-2 rounded-md hover:bg-purple-700"
                >
                  Connect Key
                </button>
                <p className="text-[10px] text-red-500 mt-2 leading-tight">
                  ⚠️ <strong>Security Warning:</strong> Only paste your nsec if
                  you trust this device.
                </p>
              </form>
            ) : (
              // Normal Buttons
              <>
                <button
                  onClick={handleAction}
                  className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-all active:scale-95"
                >
                  {user ? (
                    <>
                      <User className="w-4 h-4 mr-2" /> Check In ⚡
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" /> Login
                    </>
                  )}
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${merchant.lat},${merchant.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center px-4 py-3 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                >
                  <Navigation className="w-4 h-4 mr-2" /> Navigate
                </a>
              </>
            )}
          </div>

          {/* REVIEWS LIST */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Community Trust ⚡
            </h3>
            {loadingReviews ? (
              <div className="text-xs text-gray-400 italic">
                Syncing with Nostr...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-xs text-gray-400">
                No check-ins yet. Be the first! 🚀
              </div>
            ) : (
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {reviews.map((note) => {
                  const profile = profiles[note.pubkey];
                  const name =
                    profile?.name ||
                    profile?.displayName ||
                    note.pubkey.slice(0, 8);
                  const image = profile?.image;

                  return (
                    <div
                      key={note.id}
                      className="bg-gray-50 p-3 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt={name}
                            className="w-6 h-6 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-[10px] text-purple-700 font-bold">
                            {name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-bold text-gray-700">
                          {name}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {new Date(
                            note.created_at! * 1000
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 line-clamp-2 pl-8">
                        {note.content
                          .replace(/Checking in at .* ⚡ #SatsRover/, "")
                          .trim() || "Checked in ⚡"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
