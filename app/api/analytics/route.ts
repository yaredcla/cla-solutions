import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/data-store";
import { getAdminFromRequest } from "@/lib/admin-session";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAnalytics());
}
