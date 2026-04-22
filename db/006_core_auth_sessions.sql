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
    ('EMP-004', 'tracey.flatman@drilling.co.nz', 'scrypt$f5e65d0eb31b2accc16412ec634ff592$a3b426c416cd9b2722ce4ac608e1bbf8d40965b2797921a537687918360ca7c25bd2941af7581d5a2796254b8d69e7bbda3d6b3156c675a2736b3f66001f5f61'),
    ('EMP-006', 'tom.lubbe@drilling.co.nz', 'scrypt$b187ab906b1f7668bb10c78065a48631$c28ecfe9362f9f8004dc7f069add7391c8d05408d172493a6930f4305f2dcaf6caf8459fd7c7f84a7161402a992303d3a4d1f966fb5404d03fb509b0aa7d7991'),
    ('EMP-009', 'greg.cossar@drilling.co.nz', 'scrypt$21a1f6d5036842a2e5e27ff5e0998904$076b3ba07d67c1ec924348073341f34f942d659c01b397d899e4578f497051f0d1450a1dbdc92f35bb6e3d0f003eb63f5d12c56737cc5de71bd2149af6f1548b'),
    ('EMP-010', 'rahulnegi@drilling.co.nz', 'scrypt$34c10e38ab1c21c1416a827e6eafc13b$e23188bf3dd1f57ee39e92db52c4f9f85444d41e939f34d19a2ec59d18f56f43732f0eaf94ebbc9ff6780f364a61cc77382785e19c924e5d8f82e34664df08d4')
) as v(employee_code, login_email, password_hash)
join app_users au on au.employee_code = v.employee_code
on conflict (login_email) do update
set
  user_id = excluded.user_id,
  password_hash = excluded.password_hash,
  is_active = excluded.is_active,
  updated_at = now();

update app_auth_accounts
set
  is_active = false,
  updated_at = now()
where lower(login_email) in ('lisa@example.com', 'kevin@example.com');

drop trigger if exists set_updated_at_app_auth_accounts on app_auth_accounts;
create trigger set_updated_at_app_auth_accounts
before update on app_auth_accounts
for each row execute function set_updated_at();

drop trigger if exists set_updated_at_app_sessions on app_sessions;
create trigger set_updated_at_app_sessions
before update on app_sessions
for each row execute function set_updated_at();

commit;
