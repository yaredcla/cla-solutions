import { createHmac, timingSafeEqual } from "crypto";

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "cla-solutions-admin-session-secret";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function hashPassword(password: string) {
  return createHmac("sha256", getSessionSecret()).update(password).digest("hex");
}

export function verifyPassword(password: string, passwordHash: string) {
  const nextHash = hashPassword(password);
  const current = Buffer.from(passwordHash, "hex");
  const next = Buffer.from(nextHash, "hex");
  if (current.length !== next.length) return false;
  return timingSafeEqual(current, next);
}

export function createSessionToken(adminId: string) {
  const payload = base64UrlEncode(adminId);
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  const current = Buffer.from(signature, "hex");
  const next = Buffer.from(expected, "hex");
  if (current.length !== next.length) return null;
  if (!timingSafeEqual(current, next)) return null;
  return base64UrlDecode(payload);
}
