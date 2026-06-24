import { NextResponse } from "next/server";
import { adminCookieOptions, createSessionToken, hashPassword, normalizeUsername, passwordNeedsRehash, verifyPassword } from "@/lib/admin-auth";
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

  const nextAdmin = {
    ...admin,
    passwordHash: passwordNeedsRehash(admin.passwordHash) ? hashPassword(password) : admin.passwordHash,
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
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
  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(nextAdmin.id), adminCookieOptions());
  return response;
}
