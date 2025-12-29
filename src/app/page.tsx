// src/app/page.tsx
import MapView from "@/components/map/MapView";

export default function Home() {
  return (
    <main className="fixed inset-0 flex flex-col bg-gray-100">
      {/* Header - Z-index ensures it sits ON TOP of the map */}
      <header className="absolute top-0 left-0 z-20 w-full bg-linear-to-b from-black/50 to-transparent p-4 pointer-events-none">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">
          SatsRover 🌍
        </h1>
      </header>

      {/* The Map Wrapper */}
      <div className="w-full h-full relative">
        <MapView />
      </div>
    </main>
  );
}
