import { neon } from "@neondatabase/serverless";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
const sessionSecret = process.env.ADMIN_SESSION_SECRET;
if (!databaseUrl || !sessionSecret) {
  throw new Error("DATABASE_URL and ADMIN_SESSION_SECRET are required.");
}

const sql = neon(databaseUrl);
const migrations = await sql`select version from schema_migrations order by version`;
const tables = await sql`
  select table_name
  from information_schema.tables
  where table_schema = 'public'
    and table_name in ('schema_migrations', 'site_state', 'messages', 'admin_users')
  order by table_name
`;
const stateRows = await sql`select data from site_state where id = 'main' limit 1`;
const admins = await sql`
  select username, password_hash, status
  from admin_users
  order by created_at
`;

const state = stateRows[0]?.data ?? {};
const requiredCollections = [
  "services",
  "portfolio",
  "testimonials",
  "faqs",
  "trustSignals",
  "features",
  "heroStats",
  "heroHighlights",
  "growthMetrics",
  "performanceMetrics",
  "process",
  "blogPosts",
  "team"
];
const missingCollections = requiredCollections.filter(
  (key) => !Array.isArray(state[key])
);

console.log(
  JSON.stringify(
    {
      migrations: migrations.map((row) => row.version),
      tables: tables.map((row) => row.table_name),
      siteStateFound: Boolean(stateRows.length),
      missingCollections,
      contact: {
        location: state.settings?.location,
        email: state.settings?.email,
        phone: state.settings?.phone,
        whatsapp: state.settings?.whatsapp
      },
      socialLinksConfigured: Boolean(
        state.settings?.telegram &&
          state.settings?.linkedin &&
          state.settings?.instagram &&
          state.settings?.facebook
      ),
      branding: {
        logoPathConfigured: Boolean(state.settings?.logoPath),
        introVideoEnabled: Boolean(state.settings?.introVideoEnabled),
        introVideoPathConfigured: Boolean(state.settings?.introVideoPath)
      },
      admins: admins.map((admin) => ({
        username: admin.username,
        status: admin.status,
        passwordAlgorithm: String(admin.password_hash).startsWith("scrypt$")
          ? "scrypt"
          : "legacy"
      }))
    },
    null,
    2
  )
);
