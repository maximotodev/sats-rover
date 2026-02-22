import { NextResponse } from "next/server";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const placeId = body?.placeId as string | undefined;
    const authEvent = request.headers.get("x-auth-event") || "";
    const authNonce = request.headers.get("x-auth-nonce") || "";
    const xPubkey = request.headers.get("x-pubkey") || "";
    if (!placeId) {
      return NextResponse.json({ error: "Missing placeId" }, { status: 400 });
    }
    if (!authEvent || !authNonce || !xPubkey) {
      return NextResponse.json(
        {
          reason_code: "missing_signer",
          message: "Missing signer/auth proof headers",
        },
        { status: 401 },
      );
    }

    const resp = await fetch(
      `${ENGINE_URL}/v1/checkins/intent?place_id=${encodeURIComponent(placeId)}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "x-auth-event": authEvent,
          "x-auth-nonce": authNonce,
          "x-pubkey": xPubkey,
        },
      },
    );

    const data = await resp.json().catch(() => null);
    return NextResponse.json(data ?? { message: "Intent request failed" }, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Intent request failed" },
      { status: 500 },
    );
  }
}
