-- Additive: existing actions and immutable Jobs submissions remain unchanged.
begin;
alter table public.ops_daily_log_review_actions drop constraint ops_daily_log_review_actions_action_check;
alter table public.ops_daily_log_review_actions add constraint ops_daily_log_review_actions_action_check
  check (action in ('approve', 'return', 'correct_and_lock'));
commit;
