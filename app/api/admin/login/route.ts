import { NextResponse } from "next/server";
import { createSessionToken, normalizeUsername, verifyPassword } from "@/lib/admin-auth";
import { findAdminUserByUsername, upsertAdminUser } from "@/lib/data-store";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = normalizeUsername(String(body.username ?? ""));
  const password = String(body.password ?? "");

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const admin = await findAdminUserByUsername(username);
  if (!admin || admin.status !== "active" || !verifyPassword(password, admin.passwordHash)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const nextAdmin = { ...admin, lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await upsertAdminUser(nextAdmin);

  const response = NextResponse.json({
    authenticated: true,
    admin: {
      id: nextAdmin.id,
      username: nextAdmin.username,
      status: nextAdmin.status,
      createdAt: nextAdmin.createdAt,
      updatedAt: nextAdmin.updatedAt,
      lastLoginAt: nextAdmin.lastLoginAt
    }
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(nextAdmin.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
