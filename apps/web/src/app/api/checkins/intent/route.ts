import { NextResponse } from "next/server";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const placeId = body?.placeId as string | undefined;
    if (!placeId) {
      return NextResponse.json({ error: "Missing placeId" }, { status: 400 });
    }

    const resp = await fetch(
      `${ENGINE_URL}/v1/checkins/intent?place_id=${encodeURIComponent(placeId)}`,
      {
        method: "POST",
        headers: { accept: "application/json" },
      },
    );

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.ok ? 200 : 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Intent request failed" },
      { status: 500 },
    );
  }
}
