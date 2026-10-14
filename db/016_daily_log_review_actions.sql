-- Ops owns review decisions. Jobs schemas are installed by the Jobs deployment;
-- this migration remains usable when that service has not been provisioned yet.
begin;
create table public.ops_daily_log_review_actions (
  request_id uuid primary key,
  daily_log_id uuid not null,
  actor_user_id uuid not null references public.app_users(id) on delete restrict,
  action text not null check (action in ('approve', 'return')),
  request_hash text not null,
  document_revision integer not null check (document_revision > 0),
  base_server_revision bigint not null,
  comment text,
  self_review boolean not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
create index ops_daily_log_review_actions_log_idx
  on public.ops_daily_log_review_actions(daily_log_id, created_at desc);
commit;
