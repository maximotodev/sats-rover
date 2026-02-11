import { NextResponse } from "next/server";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const intentToken = (request.headers.get("x-checkin-intent") || body?.intentToken || "") as string;

    const resp = await fetch(`${ENGINE_URL}/v1/checkins/confirm`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "x-checkin-intent": intentToken,
      },
      body: JSON.stringify({
        event_id: body?.eventId,
        place_id: body?.placeId,
        pubkey: body?.pubkey,
        payment_evidence: body?.paymentEvidence || null,
      }),
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.ok ? 200 : 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Confirm request failed" },
      { status: 500 },
    );
  }
}
