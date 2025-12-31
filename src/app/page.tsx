"use client";
import { useState } from "react";
import MapView from "@/components/map/MapView";
import WalletDrawer from "@/components/wallet/WalletDrawer";
import HubDrawer from "@/components/hub/HubDrawer";
import EarnDrawer from "@/components/earn/EarnDrawer";
import FloatingCommandBar, {
  CommandView,
} from "@/components/ui/FloatingCommandBar";
import { useNostr } from "@/hooks/use-nostr";
import { useLightningEngine } from "@/hooks/use-lightning-engine";
import ManifestoDrawer from "@/components/ui/ManifestoDrawer";
import AuthDrawer from "@/components/auth/AuthDrawer";

export default function Home() {
  const { ndk } = useNostr();
  const { status, balance, ignite, disconnect, payInvoice } =
    useLightningEngine(ndk);

  // SINGLE SOURCE OF TRUTH FOR UI STATE
  const [view, setView] = useState<CommandView>("idle");
  const [currentHub, setCurrentHub] = useState("Global");
  const [flyToCoords, setFlyToCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  return (
    <main className="fixed inset-0 flex flex-col bg-charcoal text-white">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapView
          flyToCoords={flyToCoords}
          onInteract={() => setView("idle")} // Map interaction closes menus
        />
      </div>

      {/* HUD Layer */}
      <FloatingCommandBar
        balance={balance}
        status={status}
        view={view}
        currentHub={currentHub}
        onSetView={setView}
      />

      {/* Drawers Layer */}
      <WalletDrawer
        isOpen={view === "wallet"}
        onClose={() => setView("idle")}
        status={status}
        balance={balance}
        onConnect={ignite}
        onDisconnect={disconnect}
        onPay={payInvoice}
      />

      <HubDrawer
        isOpen={view === "hub"}
        onClose={() => setView("idle")}
        onSelect={(lat, lon, name) => {
          setFlyToCoords({ lat, lon });
          setCurrentHub(name);
        }}
      />

      <EarnDrawer isOpen={view === "earn"} onClose={() => setView("idle")} />
      <ManifestoDrawer
        isOpen={view === "manifesto"}
        onClose={() => setView("idle")}
      />
      <AuthDrawer isOpen={view === "auth"} onClose={() => setView("idle")} />
    </main>
  );
}
