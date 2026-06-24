import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-session";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ authenticated: false, admin: null });
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      id: admin.id,
      username: admin.username,
      status: admin.status,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      lastLoginAt: admin.lastLoginAt
    }
  });
}
