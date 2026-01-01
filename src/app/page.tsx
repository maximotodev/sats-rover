"use client";
import { useState } from "react";
import MapView from "@/components/map/MapView";
import WalletDrawer from "@/components/wallet/WalletDrawer";
import HubDrawer from "@/components/hub/HubDrawer";
import EarnDrawer from "@/components/earn/EarnDrawer";
import ActivityDrawer from "@/components/earn/ActivityDrawer";
import ManifestoDrawer from "@/components/ui/ManifestoDrawer";
import AuthDrawer from "@/components/auth/AuthDrawer";
import Sidebar from "@/components/layout/Sidebar";
import FloatingCommandBar, {
  CommandView,
} from "@/components/ui/FloatingCommandBar";
import { useNostr } from "@/hooks/use-nostr";
import { useLightningEngine } from "@/hooks/use-lightning-engine";

export default function Home() {
  const { ndk } = useNostr();
  const { status, balance, ignite, disconnect, payInvoice } =
    useLightningEngine(ndk);

  // UI State
  const [view, setView] = useState<CommandView>("idle");
  const [currentHub, setCurrentHub] = useState("Global");
  const [flyToCoords, setFlyToCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleHubSelect = (lat: number, lon: number, name: string) => {
    setFlyToCoords({ lat, lon });
    setCurrentHub(name);
    setView("idle");
  };

  return (
    <main className="fixed inset-0 flex flex-col bg-[#050505] text-white font-mono overflow-hidden">
      {/* 1. MAP LAYER */}
      <div className="absolute inset-0 z-0">
        <MapView
          flyToCoords={flyToCoords}
          onInteract={() => {
            setView("idle");
            setIsSidebarOpen(false);
          }}
        />
      </div>

      {/* 2. HUD LAYER (Floating Command Bar) */}
      <FloatingCommandBar
        balance={balance}
        status={status}
        view={view}
        currentHub={currentHub}
        onSetView={setView}
        onToggleSidebar={() => setIsSidebarOpen(true)} // ✅ Connects Right Button to Sidebar
      />

      {/* 3. NAVIGATION LAYER (Sidebar) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(v) => {
          setView(v as CommandView);
          setIsSidebarOpen(false); // Close sidebar when navigating to a drawer
        }}
      />

      {/* 4. INTERACTION LAYERS (Drawers) */}

      {/* Wallet (NWC) */}
      <WalletDrawer
        isOpen={view === "wallet"}
        onClose={() => setView("idle")}
        status={status}
        balance={balance}
        onConnect={ignite}
        onDisconnect={disconnect}
        onPay={payInvoice}
      />

      {/* Hub Selector */}
      <HubDrawer
        isOpen={view === "hub"}
        onClose={() => setView("idle")}
        onSelect={handleHubSelect}
      />

      {/* Proof of Presence (Stats) */}
      <EarnDrawer isOpen={view === "earn"} onClose={() => setView("idle")} />

      {/* Network Pulse (Feed) */}
      <ActivityDrawer
        isOpen={view === "activity"}
        onClose={() => setView("idle")}
      />

      {/* Manifesto */}
      <ManifestoDrawer
        isOpen={view === "manifesto"}
        onClose={() => setView("idle")}
      />

      {/* Identity / Login */}
      <AuthDrawer isOpen={view === "auth"} onClose={() => setView("idle")} />
    </main>
  );
}
