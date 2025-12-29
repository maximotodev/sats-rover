// src/components/map/MerchantDrawer.tsx
import React, { useState, useEffect } from "react";
import { Merchant } from "@/lib/types";
import { X, MapPin, Zap, Bitcoin, Navigation, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNostr } from "@/hooks/use-nostr";
import { NDKEvent, NDKUserProfile } from "@nostr-dev-kit/ndk";

interface MerchantDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
}

// Helper type for storing profiles in state
type ProfileMap = Record<string, NDKUserProfile>;

export default function MerchantDrawer({
  merchant,
  onClose,
}: MerchantDrawerProps) {
  const { user, login, publishCheckIn, fetchCheckIns, ndk } = useNostr();

  const [reviews, setReviews] = useState<NDKEvent[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({}); // Store profiles here
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (merchant) {
      setLoadingReviews(true);
      fetchCheckIns(merchant.id).then(async (notes) => {
        setReviews(notes);

        // 🚀 BATCH FETCH PROFILES (Senior UX Move)
        // We gather all unique pubkeys and fetch their metadata in parallel
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

  const handleNostrAction = async () => {
    if (!merchant) return;
    if (!user) {
      await login();
    } else {
      await publishCheckIn(
        merchant.name,
        merchant.id,
        merchant.lat,
        merchant.lon
      );
      // Optimistic update: Refresh reviews immediately after posting
      // (In a real app, we'd append the local event instantly)
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
          {/* ... Header and Badges (Same as before) ... */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
          <div className="flex justify-between items-start mb-4">
            {/* Title Block */}
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

          {/* Badges Block */}
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

          {/* Buttons Block */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleNostrAction}
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-all active:scale-95"
            >
              <User className="w-4 h-4 mr-2" />
              {user ? "Check In ⚡" : "Nostr Login"}
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${merchant.lat},${merchant.lon}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center px-4 py-3 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
            >
              <Navigation className="w-4 h-4 mr-2" /> Navigate
            </a>
          </div>

          {/* REVIEWS SECTION - UPDATED WITH PROFILES */}
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
