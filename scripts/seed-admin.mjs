import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the default admin.");
}

const sql = neon(databaseUrl);

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const username = normalizeUsername(process.env.DEFAULT_ADMIN_USERNAME ?? "");
const password = process.env.DEFAULT_ADMIN_PASSWORD ?? "";
if (!username || !password) {
  throw new Error("DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD are required to seed an admin.");
}
if (password.length < 12) {
  throw new Error("DEFAULT_ADMIN_PASSWORD must be at least 12 characters.");
}
const now = new Date().toISOString();

await sql`
  insert into admin_users (id, username, password_hash, status, created_at, updated_at)
  values ('admin_seed', ${username}, ${hashPassword(password)}, 'active', ${now}, ${now})
  on conflict (username) do update set
    password_hash = excluded.password_hash,
    status = 'active',
    updated_at = excluded.updated_at
`;

console.log(`Seeded admin account: ${username}`);
