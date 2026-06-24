import { NextResponse } from "next/server";
import { adminCookieOptions, createSessionToken, hashPassword, normalizeUsername } from "@/lib/admin-auth";
import { getAdminFromRequest, ADMIN_SESSION_COOKIE } from "@/lib/admin-session";
import { readAdminUsers, saveAdminUsers } from "@/lib/data-store";
import type { AdminAccount } from "@/lib/site-state";

function toPublicAdmin(admin: AdminAccount) {
  return {
    id: admin.id,
    username: admin.username,
    status: admin.status,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
    lastLoginAt: admin.lastLoginAt
  };
}

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await readAdminUsers();
  return NextResponse.json(users.map(toPublicAdmin));
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const username = normalizeUsername(String(body.username ?? ""));
  const password = String(body.password ?? "");
  const status = body.status === "paused" ? "paused" : "active";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const users = await readAdminUsers();
  if (users.some((item) => item.username === username)) {
    return NextResponse.json({ error: "Username already exists." }, { status: 409 });
  }

  const createdAt = new Date().toISOString();
  const nextUser: AdminAccount = {
    id: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    username,
    passwordHash: hashPassword(password),
    status,
    createdAt,
    updatedAt: createdAt
  };

  await saveAdminUsers([nextUser, ...users]);
  const response = NextResponse.json(toPublicAdmin(nextUser), { status: 201 });
  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(admin.id), adminCookieOptions());
  return response;
}
