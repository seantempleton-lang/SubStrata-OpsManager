begin;

create table if not exists app_auth_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references app_users(id) on delete cascade,
  login_email text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_sessions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references app_auth_accounts(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_sessions_account_id
  on app_sessions (account_id);

create index if not exists idx_app_sessions_active
  on app_sessions (session_token_hash, expires_at)
  where revoked_at is null;

alter table jobs
  add column if not exists created_by_user_id uuid references app_users(id) on delete set null;

alter table estimates
  add column if not exists created_by_user_id uuid references app_users(id) on delete set null;

alter table supplier_invoices
  add column if not exists last_action_by_user_id uuid references app_users(id) on delete set null,
  add column if not exists last_action_at timestamptz;

alter table timesheets
  add column if not exists last_action_by_user_id uuid references app_users(id) on delete set null,
  add column if not exists last_action_at timestamptz;

insert into app_auth_accounts (
  user_id,
  login_email,
  password_hash,
  is_active,
  last_login_at
)
select
  maa.user_id,
  maa.login_email,
  maa.password_hash,
  maa.is_active,
  maa.last_login_at
from mobile_auth_accounts maa
on conflict (login_email) do update
set
  user_id = excluded.user_id,
  password_hash = excluded.password_hash,
  is_active = excluded.is_active,
  last_login_at = excluded.last_login_at,
  updated_at = now();

insert into app_auth_accounts (
  user_id,
  login_email,
  password_hash,
  is_active
)
select
  au.id,
  v.login_email,
  v.password_hash,
  true
from (
  values
    ('EMP-001', 'sean@example.com', 'scrypt$3178da955ccb5d7e8edead16b3aeb8ed$4765c4939153ad5b736d0f4f1b9f7e1367b45d021f040829c82298b4f811093cea24b0acf22da1917344c9d75b82b5e2ddef69ffd3162f0767c24d22fbe958aa'),
    ('EMP-004', 'lisa@example.com', 'scrypt$de9a892425e6b4002f4469ccc6f43bb5$f87953009a6e010dee72ec5e31513a3f99040a349ef9605323f44d7ddd72236a2d0d3db557588bf08e0e927e602dbfe224a260d76ec510565e04833f20acefbd'),
    ('EMP-006', 'kevin@example.com', 'scrypt$c4cd47f2a5583980d6c78196f6130533$9ebd2908a663efd95779020c234f827eb260d26d90b1e9c051be70e341b7d823ef4842c648349a0ab8ea4dcd03e9a9bf5bcb8cdec641bf7e3cbe9d0fe0847a03'),
    ('EMP-010', 'rahulnegi@drilling.co.nz', 'scrypt$34c10e38ab1c21c1416a827e6eafc13b$e23188bf3dd1f57ee39e92db52c4f9f85444d41e939f34d19a2ec59d18f56f43732f0eaf94ebbc9ff6780f364a61cc77382785e19c924e5d8f82e34664df08d4')
) as v(employee_code, login_email, password_hash)
join app_users au on au.employee_code = v.employee_code
on conflict (login_email) do update
set
  user_id = excluded.user_id,
  password_hash = excluded.password_hash,
  is_active = excluded.is_active,
  updated_at = now();

drop trigger if exists set_updated_at_app_auth_accounts on app_auth_accounts;
create trigger set_updated_at_app_auth_accounts
before update on app_auth_accounts
for each row execute function set_updated_at();

drop trigger if exists set_updated_at_app_sessions on app_sessions;
create trigger set_updated_at_app_sessions
before update on app_sessions
for each row execute function set_updated_at();

commit;
