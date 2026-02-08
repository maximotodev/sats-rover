# SatsRover — Sovereign Coordination for the Bitcoin Economy

SatsRover is an experimental platform for visualizing and verifying activity in the Bitcoin economy. It combines a modern map-based frontend with a cryptographic verification backend to turn untrusted signals into verifiable data.

This repository is intentionally structured as a **full-stack operator workshop**: product-facing UI on the frontend, protocol enforcement and trust boundaries on the backend.

---

## Why SatsRover Exists

Most location and activity maps rely on centralized databases, moderation, and opaque trust assumptions.

SatsRover explores a different model:

- **Sovereign identity** instead of accounts
- **Cryptographic verification** instead of moderation
- **Protocol rules** instead of platform discretion

In short: **mathematics as moderation**.

Every signal is assumed hostile until proven valid by cryptographic signature and canonical serialization rules.

---

## Architecture Overview

```
sats-rover/
├── apps/
│ ├── web/     # Next.js + TypeScript UI (maps, identity, UX)
│ ├── api/     # FastAPI + Postgres/PostGIS services
│ └── indexer/ # Nostr ingestion + enrichment worker
├── docs/
│ └── architecture.md
└── README.md
```

For a deeper system design and tradeoff analysis, see `docs/architecture.md`.

---

## Frontend (apps/web)

- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **OpenStreetMap**
- Nostr identity and wallet-aware UX

The frontend focuses on **product clarity, UX, and signal visualization** rather than trust enforcement.

---

## Backend (apps/api)

- **FastAPI**
- **Python**
- **Pydantic**
- **secp256k1 / coincurve**

The backend acts as a **hostile verification layer**:

- Enforces **NIP-01 canonical serialization**
- Computes deterministic event IDs
- Verifies Schnorr signatures
- Rejects unverifiable or malformed events

No trust is placed in relays, clients, or inputs—only in cryptographic proof.

---

## Protocol Focus

- **Nostr**
  - NIP-01: Canonical event serialization and hashing
  - NIP-05: Identity conventions (where applicable)
- **Bitcoin-adjacent cryptography**
  - secp256k1 Schnorr signatures
  - Deterministic verification over convenience

---

## AI-Native Development Workflow

This project is built using an **AI-native workflow**.

LLMs are used to:

- Scaffold boilerplate
- Explore architectural variants
- Accelerate iteration speed

Critical paths (cryptography, serialization, trust boundaries) are:

- Manually designed
- Explicitly reviewed
- Enforced with strict invariants

AI handles speed.  
I handle correctness.

---

## Getting Started (Backend)

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run API
uvicorn app.main:app --reload
```
