import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is required.");
  }
  return secret;
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
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, encodedHash] = passwordHash.split("$");
  if (algorithm === "scrypt" && salt && encodedHash) {
    const current = Buffer.from(encodedHash, "hex");
    const next = scryptSync(password, salt, current.length);
    return current.length === next.length && timingSafeEqual(current, next);
  }

  // Legacy HMAC hashes are upgraded to scrypt after a successful login.
  const legacyHash = createHmac("sha256", getSessionSecret()).update(password).digest("hex");
  const current = Buffer.from(passwordHash, "hex");
  const next = Buffer.from(legacyHash, "hex");
  if (current.length !== next.length) return false;
  return timingSafeEqual(current, next);
}

export function passwordNeedsRehash(passwordHash: string) {
  return !passwordHash.startsWith("scrypt$");
}

export function createSessionToken(adminId: string) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = base64UrlEncode(JSON.stringify({ adminId, expiresAt }));
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
  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as { adminId?: string; expiresAt?: number };
    if (!parsed.adminId || !parsed.expiresAt || parsed.expiresAt < Date.now()) return null;
    return parsed.adminId;
  } catch {
    return null;
  }
}

export function adminCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  };
}
