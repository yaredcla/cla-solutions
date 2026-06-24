import { NextResponse } from "next/server";
import { readSiteState, saveSiteState } from "@/lib/data-store";
import type { SiteState } from "@/lib/site-state";

export async function GET() {
  const state = await readSiteState();
  return NextResponse.json(state);
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as SiteState;
  const saved = await saveSiteState(payload);
  return NextResponse.json(saved);
}
