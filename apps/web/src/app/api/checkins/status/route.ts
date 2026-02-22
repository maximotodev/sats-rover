import { NextResponse } from "next/server";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const checkinId = url.searchParams.get("checkin_id") || "";
    if (!checkinId) {
      return NextResponse.json(
        {
          reason_code: "missing_checkin_id",
          message: "Missing checkin_id",
        },
        { status: 400 },
      );
    }

    const resp = await fetch(
      `${ENGINE_URL}/v1/checkins/status?checkin_id=${encodeURIComponent(checkinId)}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      },
    );

    const data = await resp.json().catch(() => null);
    return NextResponse.json(
      data ?? { message: "Status request failed" },
      { status: resp.status },
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Status request failed" },
      { status: 500 },
    );
  }
}
