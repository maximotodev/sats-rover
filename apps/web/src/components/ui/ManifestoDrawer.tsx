import React from "react";
import { Fingerprint, X } from "lucide-react";

interface ManifestoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManifestoDrawer({
  isOpen,
  onClose,
}: ManifestoDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-t-2xl sm:rounded-2xl p-8 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom text-gray-300 font-mono leading-relaxed h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <Fingerprint className="w-8 h-8 text-[#F7931A]" />
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white mb-6">
          Why SatsRover Exists
        </h1>

        <div className="space-y-6 text-sm">
          <p>
            The internet maps places.
            <br />
            <span className="text-white font-bold">Bitcoin maps truth.</span>
          </p>

          <p>
            Google Maps cannot tell you if freedom works there. Payment
            processors cannot tell you if sovereignty survives there.
          </p>

          <p>
            SatsRover does not "certify" merchants. We record{" "}
            <span className="text-[#00FF41]">signals</span>.
          </p>

          <ul className="list-disc pl-4 space-y-2 text-gray-400">
            <li>Every marker is a claim.</li>
            <li>Every glow is earned.</li>
            <li>Every truth is emergent.</li>
          </ul>

          <p>
            We do not aggregate trust. We let it form. No accounts. No
            gatekeepers.
          </p>

          <p className="pt-4 border-t border-white/10 text-xs text-gray-500">
            v1.0 // CYHERPUNK_EDITION
            <br />
            Built for the Sovereign Individual.
          </p>
        </div>
      </div>
    </div>
  );
}
