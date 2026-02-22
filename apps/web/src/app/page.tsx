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
import { useIdentity } from "@/context/identity-context";
import { useWallet } from "@/context/wallet-context";

export default function Home() {
  const { session } = useIdentity();
  const { state, balance, connectNWC, disconnect, payInvoice } = useWallet();

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- closes stale auth drawer after identity state updates
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
        status={state === "disconnected" ? "idle" : state}
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
        status={state === "disconnected" ? "idle" : state}
        balance={balance}
        onConnect={connectNWC}
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
