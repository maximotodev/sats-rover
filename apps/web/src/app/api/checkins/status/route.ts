import { NextResponse } from "next/server";

const ENGINE_URL = process.env.ROVER_ENGINE_URL || "http://localhost:8000";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const checkinId = url.searchParams.get("checkin_id") || "";
    const pubkey = url.searchParams.get("pubkey") || "";
    const placeId = url.searchParams.get("place_id") || "";
    if (!checkinId) {
      return NextResponse.json(
        {
          status: "failed",
          reason_code: "missing_checkin_id",
          message: "Missing checkin_id",
        },
        { status: 400 },
      );
    }

    const upstreamUrl = new URL(`${ENGINE_URL}/v1/checkins/status`);
    upstreamUrl.searchParams.set("checkin_id", checkinId);
    if (pubkey) upstreamUrl.searchParams.set("pubkey", pubkey);
    if (placeId) upstreamUrl.searchParams.set("place_id", placeId);

    const resp = await fetch(
      upstreamUrl.toString(),
      {
        method: "GET",
        headers: { accept: "application/json" },
      },
    );

    const data = await resp.json().catch(() => null);
    if (resp.status === 404) {
      const reasonCode =
        data && typeof data.reason_code === "string"
          ? data.reason_code
          : "indexing_delay";
      const mappedStatus =
        reasonCode === "unknown_checkin" || reasonCode === "not_found"
          ? "not_found"
          : "pending";
      return NextResponse.json(
        {
          status: mappedStatus,
          reason_code: reasonCode,
          event_id: checkinId,
        },
        { status: 200 },
      );
    }

    if (!resp.ok) {
      return NextResponse.json(
        {
          status: "pending",
          reason_code: "indexing_delay",
          event_id: checkinId,
        },
        { status: 200 },
      );
    }

    const normalized =
      data && typeof data.status === "string"
        ? {
            status: data.status,
            reason_code:
              typeof data.reason_code === "string" ? data.reason_code : null,
            event_id:
              typeof data.event_id === "string" ? data.event_id : checkinId,
          }
        : {
            status: "pending",
            reason_code: "indexing_delay",
            event_id: checkinId,
          };

    return NextResponse.json(
      normalized,
      { status: 200 },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Status request failed";
    return NextResponse.json(
      {
        status: "pending",
        reason_code: "indexing_delay",
        message,
      },
      { status: 200 },
    );
  }
}
