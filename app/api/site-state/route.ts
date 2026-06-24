import { NextResponse } from "next/server";
import { readSiteState, saveSiteState } from "@/lib/data-store";
import type { SiteState } from "@/lib/site-state";
import { normalizeSiteState } from "@/lib/site-state";
import { getAdminFromRequest } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readSiteState();
  return NextResponse.json(state, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  });
}

export async function PUT(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = normalizeSiteState((await request.json()) as SiteState);
  const saved = await saveSiteState(payload);
  return NextResponse.json(saved);
}
