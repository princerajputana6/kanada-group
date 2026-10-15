import { NextResponse } from "next/server";

/** The live build's ID — compared against the one baked into an open tab. */
export function GET() {
  return NextResponse.json(
    { buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? "unknown" },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
