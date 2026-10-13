-- Additive concurrency token; keeps all assignments and Jobs log references intact.
begin;
alter table public.planner_assignments add column version integer not null default 1;
create function public.increment_planner_assignment_version()
returns trigger language plpgsql as $$
begin
  new.version = old.version + 1;
  return new;
end;
$$;
create trigger planner_assignment_version before update on public.planner_assignments
for each row execute function public.increment_planner_assignment_version();
commit;
