"use client";
import { useState, useEffect } from "react";
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
import { useSession } from "@/contexts/NostrSessionContext"; // ✅ CORRECT IMPORT
import { useLightningEngine } from "@/hooks/use-lightning-engine";

export default function Home() {
  // ✅ USE SESSION CONTEXT (Single Source of Truth)
  const { ndk, session } = useSession();

  // Pass the NDK instance from context to the wallet engine
  const { status, balance, ignite, disconnect, payInvoice } =
    useLightningEngine(ndk);

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

  // ✅ HARD GUARD: If user logs in while AuthDrawer is open, close it immediately
  useEffect(() => {
    if (session.type !== "anon" && view === "auth") {
      setView("idle");
    }
  }, [session.type, view]);

  return (
    <main className="fixed inset-0 flex flex-col bg-[#050505] text-white font-mono overflow-hidden">
      {/* 1. MAP LAYER */}
      <div className="absolute inset-0 z-0 h-dvh w-full">
        <MapView
          flyToCoords={flyToCoords}
          onInteract={() => {
            setView("idle");
            setIsSidebarOpen(false);
          }}
        />
      </div>

      {/* 2. HUD LAYER */}
      <FloatingCommandBar
        balance={balance}
        status={status}
        view={view}
        currentHub={currentHub}
        onSetView={setView}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />

      {/* 3. NAVIGATION LAYER */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(v) => {
          setView(v as CommandView);
          setIsSidebarOpen(false);
        }}
      />

      {/* 4. INTERACTION LAYERS */}

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
        onSelect={handleHubSelect}
      />

      <EarnDrawer isOpen={view === "earn"} onClose={() => setView("idle")} />

      <ActivityDrawer
        isOpen={view === "activity"}
        onClose={() => setView("idle")}
      />

      <ManifestoDrawer
        isOpen={view === "manifesto"}
        onClose={() => setView("idle")}
      />

      {/* ✅ HARD GUARD: AuthDrawer ONLY renders if Anon */}
      {session.type === "anon" && (
        <AuthDrawer isOpen={view === "auth"} onClose={() => setView("idle")} />
      )}
    </main>
  );
}
