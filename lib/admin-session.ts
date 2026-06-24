import { findAdminUserById } from "./data-store";
import { verifySessionToken } from "./admin-auth";
import type { AdminAccount } from "./site-state";

export const ADMIN_SESSION_COOKIE = "cla_admin_session";

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!cookie) return null;
  return decodeURIComponent(cookie.slice(name.length + 1));
}

export async function getAdminFromRequest(request: Request): Promise<AdminAccount | null> {
  const token = readCookie(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);
  if (!token) return null;
  const adminId = verifySessionToken(token);
  if (!adminId) return null;
  const admin = await findAdminUserById(adminId);
  if (!admin || admin.status !== "active") return null;
  return admin;
}
