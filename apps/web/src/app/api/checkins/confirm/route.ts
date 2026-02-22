import { NextResponse } from "next/server";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody || "{}");
    const intentToken = (request.headers.get("x-checkin-intent") || body?.intentToken || "") as string;
    const authEvent = request.headers.get("x-auth-event") || "";
    const authNonce = request.headers.get("x-auth-nonce") || "";
    if (!authEvent || !authNonce) {
      return NextResponse.json(
        {
          reason_code: "missing_signer",
          message: "Missing signer/auth proof headers",
        },
        { status: 401 },
      );
    }

    const resp = await fetch(`${ENGINE_URL}/v1/checkins/confirm`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "x-checkin-intent": intentToken,
        "x-auth-event": authEvent,
        "x-auth-nonce": authNonce,
      },
      body: rawBody,
    });

    const data = await resp.json().catch(() => null);
    return NextResponse.json(data ?? { message: "Confirm request failed" }, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Confirm request failed" },
      { status: 500 },
    );
  }
}
