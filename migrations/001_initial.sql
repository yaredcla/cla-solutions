create table if not exists schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists site_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

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
);

create index if not exists messages_created_at_idx on messages (created_at desc);
create index if not exists messages_status_idx on messages (status);

create table if not exists admin_users (
  id text primary key,
  username text not null unique,
  password_hash text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  constraint admin_users_status_check check (status in ('active', 'paused'))
);

create index if not exists admin_users_username_idx on admin_users (username);
