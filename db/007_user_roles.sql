begin;

alter table app_users
  add column if not exists app_role text;

update app_users
set app_role = case
  when employee_code = 'EMP-001'
    or lower(full_name) = 'sean templeton'
    or lower(coalesce(email, '')) = 'sean@example.com'
    or lower(coalesce(email, '')) = 'stempleton@drilling.co.nz'
    then 'SuperUser'
  when role_title in ('Regional Manager', 'Operations Manager') then 'Administrator'
  when role_title in ('Lead Geotech') then 'Supervisor'
  when role_title ilike '%maintenance%' then 'Maintenance'
  else 'FieldUser'
end
where app_role is null
   or app_role not in ('SuperUser', 'Administrator', 'Supervisor', 'Maintenance', 'FieldUser');

update app_users
set app_role = 'SuperUser'
where employee_code = 'EMP-001'
   or lower(full_name) = 'sean templeton'
   or lower(coalesce(email, '')) = 'sean@example.com'
   or lower(coalesce(email, '')) = 'stempleton@drilling.co.nz';

alter table app_users
  alter column app_role set default 'FieldUser';

update app_users
set app_role = 'FieldUser'
where app_role is null;

alter table app_users
  alter column app_role set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'app_users_app_role_check'
  ) then
    alter table app_users
      add constraint app_users_app_role_check
      check (app_role in ('SuperUser', 'Administrator', 'Supervisor', 'Maintenance', 'FieldUser'));
  end if;
end $$;

create index if not exists idx_app_users_app_role
  on app_users (app_role);

commit;
