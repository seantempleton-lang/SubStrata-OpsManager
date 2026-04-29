begin;

create table if not exists app_password_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  token_hash text not null unique,
  purpose text not null,
  expires_at timestamptz not null,
  created_by_user_id uuid references app_users(id) on delete set null,
  consumed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint app_password_tokens_purpose_check
    check (purpose in ('invite', 'reset'))
);

create index if not exists idx_app_password_tokens_user_id
  on app_password_tokens (user_id);

create index if not exists idx_app_password_tokens_active
  on app_password_tokens (token_hash, expires_at)
  where consumed_at is null
    and revoked_at is null;

commit;
