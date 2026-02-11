import { NextResponse } from "next/server";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ placeId: string }> },
) {
  const { placeId } = await params;

  try {
    const resp = await fetch(
      `${ENGINE_URL}/v1/places/${encodeURIComponent(placeId)}/feed?limit=50`,
      {
        next: { revalidate: 10 },
        headers: { accept: "application/json" },
      },
    );

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Feed unavailable (${resp.status})` },
        { status: 200 },
      );
    }

    const data = await resp.json();
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Feed unavailable" },
      { status: 200 },
    );
  }
}
