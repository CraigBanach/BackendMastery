import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.POSTHOG_KEY ?? null;

  return NextResponse.json(
    { apiKey },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
