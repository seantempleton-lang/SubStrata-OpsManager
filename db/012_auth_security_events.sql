begin;

alter table app_auth_accounts
  add column if not exists failed_login_count integer not null default 0,
  add column if not exists last_failed_login_at timestamptz,
  add column if not exists locked_until timestamptz;

create table if not exists app_auth_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  account_id uuid references app_auth_accounts(id) on delete set null,
  user_id uuid references app_users(id) on delete set null,
  session_id uuid references app_sessions(id) on delete set null,
  login_identifier text,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_app_auth_events_created_at
  on app_auth_events (created_at desc);

create index if not exists idx_app_auth_events_type_created_at
  on app_auth_events (event_type, created_at desc);

create index if not exists idx_app_auth_events_account_created_at
  on app_auth_events (account_id, created_at desc)
  where account_id is not null;

create index if not exists idx_app_auth_events_user_created_at
  on app_auth_events (user_id, created_at desc)
  where user_id is not null;

create index if not exists idx_app_auth_events_login_identifier_created_at
  on app_auth_events (login_identifier, created_at desc)
  where login_identifier is not null;

create index if not exists idx_app_auth_events_ip_created_at
  on app_auth_events (ip_address, created_at desc)
  where ip_address is not null;

commit;
