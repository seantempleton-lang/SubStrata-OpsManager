begin;

update app_sessions
set
  revoked_at = now(),
  updated_at = now()
where revoked_at is null;

commit;
