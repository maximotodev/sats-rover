// apps/web/src/app/layout.tsx
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import type { Metadata } from "next";
import { IdentityProvider } from "@/context/identity-context";
import { NostrSessionProvider } from "@/contexts/NostrSessionContext";
import { WalletProvider } from "@/context/wallet-context";

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
        <IdentityProvider>
          <NostrSessionProvider>
            <WalletProvider>{children}</WalletProvider>
          </NostrSessionProvider>
        </IdentityProvider>
      </body>
    </html>
  );
}
