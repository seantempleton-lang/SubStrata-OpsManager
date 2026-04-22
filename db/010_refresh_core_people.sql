begin;

update app_users
set
  is_active = false,
  updated_at = now()
where lower(full_name) in ('lisa park', 'kevin lam');

update app_auth_accounts
set
  is_active = false,
  updated_at = now()
where user_id in (
  select id
  from app_users
  where lower(full_name) in ('lisa park', 'kevin lam')
)
or lower(login_email) in ('lisa@example.com', 'kevin@example.com');

update app_users
set
  role_title = 'Administrator',
  app_role = 'Administrator',
  division = 'Operations',
  region = coalesce(region, 'South'),
  email = coalesce(email, 'tracey.flatman@drilling.co.nz'),
  is_active = true,
  updated_at = now()
where lower(full_name) = 'tracey flatman';

update app_users
set
  role_title = 'Supervisor',
  app_role = 'Supervisor',
  division = 'Operations',
  region = coalesce(region, 'South'),
  email = coalesce(email, 'tom.lubbe@drilling.co.nz'),
  is_active = true,
  updated_at = now()
where lower(full_name) = 'tom lubbe';

update app_users
set
  role_title = 'User',
  app_role = 'FieldUser',
  division = 'Operations',
  region = coalesce(region, 'South'),
  email = coalesce(email, 'greg.cossar@drilling.co.nz'),
  is_active = true,
  updated_at = now()
where lower(full_name) = 'greg cossar';

insert into app_auth_accounts (
  user_id,
  login_email,
  password_hash,
  is_active
)
select
  u.id,
  seed.login_email,
  seed.password_hash,
  true
from (
  values
    ('tracey flatman', 'tracey.flatman@drilling.co.nz', 'scrypt$f5e65d0eb31b2accc16412ec634ff592$a3b426c416cd9b2722ce4ac608e1bbf8d40965b2797921a537687918360ca7c25bd2941af7581d5a2796254b8d69e7bbda3d6b3156c675a2736b3f66001f5f61'),
    ('tom lubbe', 'tom.lubbe@drilling.co.nz', 'scrypt$b187ab906b1f7668bb10c78065a48631$c28ecfe9362f9f8004dc7f069add7391c8d05408d172493a6930f4305f2dcaf6caf8459fd7c7f84a7161402a992303d3a4d1f966fb5404d03fb509b0aa7d7991'),
    ('greg cossar', 'greg.cossar@drilling.co.nz', 'scrypt$21a1f6d5036842a2e5e27ff5e0998904$076b3ba07d67c1ec924348073341f34f942d659c01b397d899e4578f497051f0d1450a1dbdc92f35bb6e3d0f003eb63f5d12c56737cc5de71bd2149af6f1548b')
) as seed(full_name, login_email, password_hash)
join app_users u on lower(u.full_name) = seed.full_name
on conflict (user_id) do update
set
  login_email = excluded.login_email,
  password_hash = excluded.password_hash,
  is_active = true,
  updated_at = now();

commit;
