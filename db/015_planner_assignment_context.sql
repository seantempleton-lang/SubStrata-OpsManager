-- Optional overrides preserve existing plans; legacy reads use job/rig defaults.
begin;
alter table public.planner_assignments
  add column division text,
  add column region text,
  add constraint planner_assignment_division_check check (division in ('Water', 'Geotech')),
  add constraint planner_assignment_region_check check (region in ('North', 'South'));
commit;
