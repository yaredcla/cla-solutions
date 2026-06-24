import { NextResponse } from "next/server";
import { adminCookieOptions, hashPassword, normalizeUsername } from "@/lib/admin-auth";
import { ADMIN_SESSION_COOKIE, getAdminFromRequest } from "@/lib/admin-session";
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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const users = await readAdminUsers();
  const index = users.findIndex((item) => item.id === id);
  if (index < 0) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const current = users[index];
  const nextUsername = typeof body.username === "string" && body.username.trim() ? normalizeUsername(body.username) : current.username;
  const nextPassword = typeof body.password === "string" && body.password.trim() ? body.password : null;
  const nextStatus = body.status === "paused" ? "paused" : body.status === "active" ? "active" : current.status;

  if (nextUsername !== current.username && users.some((item) => item.username === nextUsername)) {
    return NextResponse.json({ error: "Username already exists." }, { status: 409 });
  }

  const updated: AdminAccount = {
    ...current,
    username: nextUsername,
    passwordHash: nextPassword ? hashPassword(nextPassword) : current.passwordHash,
    status: nextStatus,
    updatedAt: new Date().toISOString()
  };

  users[index] = updated;
  await saveAdminUsers(users);

  const response = NextResponse.json(toPublicAdmin(updated));
  if (updated.id === admin.id && updated.status !== "active") {
    response.cookies.set(ADMIN_SESSION_COOKIE, "", adminCookieOptions(0));
  }
  return response;
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const users = await readAdminUsers();
  const nextUsers = users.filter((item) => item.id !== id);
  if (nextUsers.length === users.length) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  await saveAdminUsers(nextUsers);
  const response = NextResponse.json({ ok: true });
  if (id === admin.id) {
    response.cookies.set(ADMIN_SESSION_COOKIE, "", adminCookieOptions(0));
  }
  return response;
}
