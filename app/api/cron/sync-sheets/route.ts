import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const syncAllUrl = new URL("/api/sheets/sync-all", request.url);
  const response = await fetch(syncAllUrl, {
    method: "GET",
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({
    success: false,
    error: "Failed to parse sync-all response.",
  }));

  return NextResponse.json(payload, {
    status: response.status,
  });
}
