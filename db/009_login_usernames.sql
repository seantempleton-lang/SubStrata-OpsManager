begin;

alter table app_users
  add column if not exists login_username text;

with generated_usernames as (
  select
    id,
    coalesce(nullif(regexp_replace(full_name, '[^A-Za-z0-9]+', '', 'g'), ''), employee_code) as base_username
  from app_users
),
ranked_usernames as (
  select
    id,
    base_username,
    row_number() over (
      partition by lower(base_username)
      order by base_username, id
    ) as duplicate_rank
  from generated_usernames
)
update app_users u
set login_username = case
  when ranked_usernames.duplicate_rank = 1 then ranked_usernames.base_username
  else ranked_usernames.base_username || ranked_usernames.duplicate_rank::text
end
from ranked_usernames
where u.id = ranked_usernames.id
  and (
    u.login_username is null
    or btrim(u.login_username) = ''
  );

update app_users
set login_username = employee_code
where login_username is null
   or btrim(login_username) = '';

create unique index if not exists idx_app_users_login_username_lower
  on app_users (lower(login_username));

alter table app_users
  alter column login_username set not null;

commit;
