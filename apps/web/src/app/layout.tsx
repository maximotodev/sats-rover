// apps/web/src/app/layout.tsx
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import type { Metadata } from "next";
import { NostrSessionProvider } from "@/contexts/NostrSessionContext"; // ✅ Import

export const metadata: Metadata = {
  title: "SatsRover",
  description: "Sovereign Bitcoin Discovery",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Wrap Children */}
        <NostrSessionProvider>{children}</NostrSessionProvider>
      </body>
    </html>
  );
}
