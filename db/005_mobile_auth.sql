begin;

create table if not exists mobile_auth_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references app_users(id) on delete cascade,
  login_email text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mobile_auth_sessions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references mobile_auth_accounts(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_mobile_auth_sessions_account_id
  on mobile_auth_sessions (account_id);

create index if not exists idx_mobile_auth_sessions_active
  on mobile_auth_sessions (session_token_hash, expires_at)
  where revoked_at is null;

insert into app_users (
  employee_code,
  full_name,
  initials,
  role_title,
  division,
  region,
  email,
  is_active
)
values (
  'EMP-010',
  'Rahul Negi',
  'RN',
  'Driller',
  null,
  null,
  'rahulnegi@drilling.co.nz',
  true
)
on conflict (employee_code) do update
set
  full_name = excluded.full_name,
  initials = excluded.initials,
  role_title = excluded.role_title,
  division = excluded.division,
  region = excluded.region,
  email = excluded.email,
  is_active = excluded.is_active;

insert into mobile_auth_accounts (
  user_id,
  login_email,
  password_hash,
  is_active
)
select
  au.id,
  'rahulnegi@drilling.co.nz',
  'scrypt$3930b92ab620974eaecf85a54fb9f839$69a19a9b1048bf74c6360b8a43eff6feccda695c3bd83330b854ae19c37ba03117c1a53d2b5477a6973b5739b053f6754c5ecf0ceb3cf248ed71575c2987e4af',
  true
from app_users au
where au.employee_code = 'EMP-010'
on conflict (login_email) do update
set
  user_id = excluded.user_id,
  password_hash = excluded.password_hash,
  is_active = excluded.is_active,
  updated_at = now();

drop trigger if exists set_updated_at_mobile_auth_accounts on mobile_auth_accounts;
create trigger set_updated_at_mobile_auth_accounts
before update on mobile_auth_accounts
for each row execute function set_updated_at();

commit;
