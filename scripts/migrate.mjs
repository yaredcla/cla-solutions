import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run migrations.");
}

const sql = neon(databaseUrl);
const migrations = [
  {
    version: "001_initial",
    file: "001_initial.sql"
  }
];

await sql`
  create table if not exists schema_migrations (
    version text primary key,
    applied_at timestamptz not null default now()
  )
`;

for (const migration of migrations) {
  const existing = await sql`select version from schema_migrations where version = ${migration.version}`;
  if (existing.length) {
    console.log(`Skipping ${migration.version}`);
    continue;
  }

  const sqlText = readFileSync(join(process.cwd(), "migrations", migration.file), "utf8");
  const statements = sqlText
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  await sql.transaction((tx) => [
    ...statements.map((statement) => tx.query(statement)),
    tx`insert into schema_migrations (version) values (${migration.version})`
  ]);
  console.log(`Applied ${migration.version}`);
}

console.log("Database migrations complete.");
