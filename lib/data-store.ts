import { neon } from "@neondatabase/serverless";
import { hashPassword, normalizeUsername } from "./admin-auth";
import {
  AnalyticsSummary,
  AdminAccount,
  defaultSiteState,
  InboxMessage,
  SiteState
} from "./site-state";

const SITE_STATE_ID = "main";

let schemaReady: Promise<void> | null = null;

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database storage.");
  }
  return neon(databaseUrl);
}

function toIsoString(value: string | Date | null | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toDateValue(value: unknown) {
  return value as string | Date | null | undefined;
}

function toAdminAccount(row: Record<string, unknown>): AdminAccount {
  return {
    id: String(row.id),
    username: String(row.username),
    passwordHash: String(row.password_hash),
    status: row.status === "paused" ? "paused" : "active",
    createdAt: toIsoString(toDateValue(row.created_at)) ?? new Date().toISOString(),
    updatedAt: toIsoString(toDateValue(row.updated_at)) ?? new Date().toISOString(),
    lastLoginAt: toIsoString(toDateValue(row.last_login_at))
  };
}

function toInboxMessage(row: Record<string, unknown>): InboxMessage {
  const status = ["new", "read", "replied", "archived"].includes(String(row.status))
    ? (String(row.status) as InboxMessage["status"])
    : "new";

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    company: String(row.company ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    service: String(row.service ?? ""),
    message: String(row.message ?? ""),
    status,
    createdAt: toIsoString(toDateValue(row.created_at)) ?? new Date().toISOString()
  };
}

async function ensureSchema() {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const sql = getSql();
    await sql`
      create table if not exists schema_migrations (
        version text primary key,
        applied_at timestamptz not null default now()
      )
    `;
    await sql`
      create table if not exists site_state (
        id text primary key,
        data jsonb not null,
        updated_at timestamptz not null default now()
      )
    `;
    await sql`
      create table if not exists messages (
        id text primary key,
        name text not null,
        company text not null default '',
        email text not null,
        phone text not null default '',
        service text not null default '',
        message text not null,
        status text not null default 'new',
        created_at timestamptz not null default now(),
        constraint messages_status_check check (status in ('new', 'read', 'replied', 'archived'))
      )
    `;
    await sql`create index if not exists messages_created_at_idx on messages (created_at desc)`;
    await sql`create index if not exists messages_status_idx on messages (status)`;
    await sql`
      create table if not exists admin_users (
        id text primary key,
        username text not null unique,
        password_hash text not null,
        status text not null default 'active',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        last_login_at timestamptz,
        constraint admin_users_status_check check (status in ('active', 'paused'))
      )
    `;
    await sql`create index if not exists admin_users_username_idx on admin_users (username)`;
    await seedDefaults();
  })();

  return schemaReady;
}

async function seedDefaults() {
  const sql = getSql();
  const createdAt = new Date(2026, 0, 1).toISOString();

  await sql`
    insert into site_state (id, data, updated_at)
    values (${SITE_STATE_ID}, ${JSON.stringify(defaultSiteState)}::jsonb, now())
    on conflict (id) do nothing
  `;

  await sql`
    insert into admin_users (id, username, password_hash, status, created_at, updated_at)
    values (
      'admin_seed',
      ${normalizeUsername("admin")},
      ${hashPassword("admin12345")},
      'active',
      ${createdAt},
      ${createdAt}
    )
    on conflict (username) do nothing
  `;
}

export async function readSiteState(): Promise<SiteState> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`select data from site_state where id = ${SITE_STATE_ID}`;
  const data = rows[0]?.data;
  if (!data) return defaultSiteState;
  return typeof data === "string" ? JSON.parse(data) as SiteState : data as SiteState;
}

export async function saveSiteState(state: SiteState): Promise<SiteState> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    insert into site_state (id, data, updated_at)
    values (${SITE_STATE_ID}, ${JSON.stringify(state)}::jsonb, now())
    on conflict (id) do update set
      data = excluded.data,
      updated_at = excluded.updated_at
  `;
  return state;
}

export async function readMessages(): Promise<InboxMessage[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select id, name, company, email, phone, service, message, status, created_at
    from messages
    order by created_at desc
  `;
  return rows.map(toInboxMessage);
}

export async function saveMessages(messages: InboxMessage[]): Promise<InboxMessage[]> {
  await ensureSchema();
  const sql = getSql();
  await sql`delete from messages`;
  if (!messages.length) return messages;

  await sql.transaction((tx) =>
    messages.map((message) =>
      tx`
        insert into messages (id, name, company, email, phone, service, message, status, created_at)
        values (
          ${message.id},
          ${message.name},
          ${message.company},
          ${message.email},
          ${message.phone},
          ${message.service},
          ${message.message},
          ${message.status},
          ${message.createdAt}
        )
      `
    )
  );
  return messages;
}

export async function appendMessage(message: InboxMessage): Promise<InboxMessage> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    insert into messages (id, name, company, email, phone, service, message, status, created_at)
    values (
      ${message.id},
      ${message.name},
      ${message.company},
      ${message.email},
      ${message.phone},
      ${message.service},
      ${message.message},
      ${message.status},
      ${message.createdAt}
    )
  `;
  return message;
}

export async function updateMessage(id: string, patch: Partial<InboxMessage>): Promise<InboxMessage | null> {
  await ensureSchema();
  const messages = await readMessages();
  const current = messages.find((item) => item.id === id);
  if (!current) return null;
  const next = { ...current, ...patch };
  const sql = getSql();

  await sql`
    update messages set
      name = ${next.name},
      company = ${next.company},
      email = ${next.email},
      phone = ${next.phone},
      service = ${next.service},
      message = ${next.message},
      status = ${next.status}
    where id = ${id}
  `;
  return next;
}

export async function deleteMessage(id: string): Promise<boolean> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`delete from messages where id = ${id} returning id`;
  return rows.length > 0;
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const [state, messages] = await Promise.all([readSiteState(), readMessages()]);
  const unreadMessages = messages.filter((item) => item.status === "new").length;
  const respondedMessages = messages.filter((item) => item.status === "replied").length;
  const leadScore = Math.min(100, unreadMessages * 6 + respondedMessages * 9 + state.services.length * 5 + state.portfolio.length * 4);
  const monthlyTrend = [
    { label: "Mon", value: Math.max(8, messages.length - 6) },
    { label: "Tue", value: Math.max(10, messages.length - 4) },
    { label: "Wed", value: Math.max(12, messages.length - 2) },
    { label: "Thu", value: Math.max(14, messages.length + 1) },
    { label: "Fri", value: Math.max(16, messages.length + 3) },
    { label: "Sat", value: Math.max(12, messages.length + 2) },
    { label: "Sun", value: Math.max(9, messages.length - 1) }
  ];
  const serviceCounts = state.services.map((service, index) => ({
    label: service.title,
    value: Math.max(1, Math.round((messages.length + state.portfolio.length + index * 2) / 2))
  }));

  return {
    totalMessages: messages.length,
    unreadMessages,
    respondedMessages,
    totalServices: state.services.length,
    totalPortfolioItems: state.portfolio.length,
    leadScore,
    monthlyTrend,
    serviceCounts
  };
}

export async function readAdminUsers(): Promise<AdminAccount[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select id, username, password_hash, status, created_at, updated_at, last_login_at
    from admin_users
    order by created_at desc
  `;
  return rows.map(toAdminAccount);
}

export async function saveAdminUsers(users: AdminAccount[]): Promise<AdminAccount[]> {
  await ensureSchema();
  const sql = getSql();
  await sql`delete from admin_users`;
  if (!users.length) return users;

  await sql.transaction((tx) =>
    users.map((user) =>
      tx`
        insert into admin_users (id, username, password_hash, status, created_at, updated_at, last_login_at)
        values (
          ${user.id},
          ${normalizeUsername(user.username)},
          ${user.passwordHash},
          ${user.status},
          ${user.createdAt},
          ${user.updatedAt},
          ${user.lastLoginAt ?? null}
        )
      `
    )
  );
  return users;
}

export async function upsertAdminUser(user: AdminAccount): Promise<AdminAccount> {
  await ensureSchema();
  const sql = getSql();
  const normalizedUsername = normalizeUsername(user.username);
  await sql`
    insert into admin_users (id, username, password_hash, status, created_at, updated_at, last_login_at)
    values (
      ${user.id},
      ${normalizedUsername},
      ${user.passwordHash},
      ${user.status},
      ${user.createdAt},
      ${user.updatedAt},
      ${user.lastLoginAt ?? null}
    )
    on conflict (id) do update set
      username = excluded.username,
      password_hash = excluded.password_hash,
      status = excluded.status,
      updated_at = excluded.updated_at,
      last_login_at = excluded.last_login_at
  `;
  return { ...user, username: normalizedUsername };
}

export async function findAdminUserByUsername(username: string) {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select id, username, password_hash, status, created_at, updated_at, last_login_at
    from admin_users
    where username = ${normalizeUsername(username)}
    limit 1
  `;
  return rows[0] ? toAdminAccount(rows[0]) : null;
}

export async function findAdminUserById(id: string) {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select id, username, password_hash, status, created_at, updated_at, last_login_at
    from admin_users
    where id = ${id}
    limit 1
  `;
  return rows[0] ? toAdminAccount(rows[0]) : null;
}
