# SatsRover 🌍⚡

**SatsRover** is a sovereign coordination layer for the Bitcoin economy. It combines global merchant discovery (OSM/BTCMap) with cryptographic social proof (Nostr) and non-custodial spending (NWC).

> **Status:** Live in Production  
> **Mission:** Field-testing Bitcoin circular economy friction across Europe.

![SatsRover Preview](https://github.com/user-attachments/assets/placeholder-image) _(Optional: Add a screenshot here later)_

## 🚀 The Core Problem

Most Bitcoin maps are static directories. They suffer from two failures:

1.  **The Empty Map Problem:** Users open the map and see nothing nearby, assuming Bitcoin doesn't work there.
2.  **The Stale Data Problem:** Listings are often years old; nodes are offline, or staff has changed.

**SatsRover solves this via architecture, not aggregation:**

- **Pull-Based Discovery:** Users "scan" sectors (Geocoding + Overpass API) rather than relying on a centralized database.
- **Proof-of-Presence:** We replaced "Reviews" with "Signals." A signed event confirming a successful Lightning payment is the only metric that matters.

## 🏗 Architecture

### 1. The Identity Layer (Nostr)

We use a **Primal-style onboarding flow**.

- **Keys First, Profile Second:** Users generate keys client-side (ephemeral session).
- **Sovereignty:** No database. No email. Identity is derived purely from the private key (`nsec`).
- **State Machine:** Auth is treated as a state (`Anon` vs `Authenticated`), strictly guarding UI components via a global Session Context.

### 2. The Economic Layer (NWC)

Money is orthogonal to identity.

- **Protocol:** NIP-47 (Nostr Wallet Connect).
- **Non-Custodial:** The app acts as a remote control for the user's existing node (Alby Hub, Mutiny, etc.).
- **The Loop:** `Scan Invoice` -> `Pay via NWC` -> `Auto-publish Reliability Signal`.

### 3. The Reality Layer (Map & Signals)

We decouple **Ontology** (What exists) from **Epistemology** (What we trust).

- **Base Layer:** OpenStreetMap (Raw claims).
- **Seed Layer:** BTC Map (Community verified).
- **Signal Layer:** Real-time Nostr events (Kind 1) tagged with geohashes.
- **Visual Logic:** All markers are **Bitcoin Orange**. Trust is visualized via **Intensity (Glow)**, not color coding.

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **State:** React Context + NDK (Nostr Dev Kit)
- **Maps:** MapLibre GL JS + Carto Dark Matter Tiles
- **Styling:** Tailwind CSS (Cypherpunk/Terminal Aesthetic)
- **Icons:** Lucide React

## ⚡ Getting Started

1.  **Clone the repo:**

    ```bash
    git clone https://github.com/your-username/sats-rover.git
    cd sats-rover
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run development server:**

    ```bash
    npm run dev
    ```

4.  **Open:** `http://localhost:3000`

## 📂 Project Structure

src/
├── app/ # Next.js App Router
├── components/
│ ├── auth/ # Primal-style Wizard (AuthDrawer)
│ ├── earn/ # Proof-of-Presence (ActivityDrawer)
│ ├── map/ # MapLibre & Merchant Logic
│ ├── ui/ # HUD & Floating Command Bar
│ └── wallet/ # NWC Interface
├── contexts/ # Global Session Orchestrator
├── hooks/ # Custom Logic (useLightningEngine, useNostr)
└── lib/ # Constants & Types

## 📜 Manifesto

SatsRover does not "certify" merchants. We record **signals**.

- Every marker is a claim.
- Every glow is earned.
- Every truth is emergent.

We do not aggregate trust. We let it form.

---

_Built with 🧡 by maximotodev_

## Preview deployment returns 401 for `/manifest.json`

If `GET /manifest.json` returns `401` in Vercel **Preview** deployments, this is usually **not** an app code bug.

Root cause:
- Vercel Deployment Protection / Vercel Authentication is enabled for Preview deployments.
- That protection can challenge static assets too (including `/manifest.json`) until authenticated.
- Middleware or route changes in this app will not fix a protection-level 401.

How to fix:
1. Open **Vercel Dashboard** → **Project** → **Settings**.
2. Go to **Deployment Protection** (or **Security / Vercel Authentication**, depending on UI version).
3. For Preview deployments, either:
   - disable protection (make previews public), **or**
   - explicitly allow unauthenticated access to required assets/routes.
4. Re-deploy and verify `/manifest.json` returns `200`.

Quick sanity checks:
- Manifest exists: `apps/web/public/manifest.json`
- Icon exists (manifest references `/icon.png`): `apps/web/public/icon.png`

Local check command:
```bash
test -f apps/web/public/icon.png && echo "icon.png present"
```
