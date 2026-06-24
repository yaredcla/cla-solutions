import { createHmac } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the default admin.");
}

const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "cla-solutions-admin-session-secret";
const sql = neon(databaseUrl);

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function hashPassword(password) {
  return createHmac("sha256", sessionSecret).update(password).digest("hex");
}

const username = normalizeUsername(process.env.DEFAULT_ADMIN_USERNAME ?? "admin");
const password = process.env.DEFAULT_ADMIN_PASSWORD ?? "admin12345";
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
