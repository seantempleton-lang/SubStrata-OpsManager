-- SubStrata Ops Manager
-- PostgreSQL schema for Coolify-hosted application data.

begin;

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  full_name text not null,
  initials text not null,
  role_title text not null,
  division text,
  region text,
  email text unique,
  phone text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_users_division_check
    check (division in ('Water', 'Geotech', 'Operations', 'Finance', 'HSE') or division is null),
  constraint app_users_region_check
    check (region in ('North', 'South') or region is null)
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  client_code text not null unique,
  name text not null,
  industry text,
  region text,
  billing_email text,
  billing_phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  country text default 'New Zealand',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_region_check
    check (region in ('North', 'South') or region is null)
);

create table if not exists client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  full_name text not null,
  job_title text,
  email text,
  mobile text,
  office_phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text not null unique,
  title text not null,
  client_id uuid not null references clients(id) on delete restrict,
  client_code text,
  division text not null,
  region text not null,
  status text not null,
  job_type text not null,
  manager_user_id uuid references app_users(id) on delete set null,
  supervisor_user_id uuid references app_users(id) on delete set null,
  contract_value numeric(14,2),
  invoiced_value numeric(14,2) not null default 0,
  hours_logged numeric(10,2) not null default 0,
  start_date date,
  end_date date,
  site_name text,
  site_address text,
  scope_of_work text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_division_check
    check (division in ('Water', 'Geotech')),
  constraint jobs_region_check
    check (region in ('North', 'South')),
  constraint jobs_status_check
    check (status in ('enquiry', 'quoted', 'approved', 'active', 'on_hold', 'complete', 'cancelled'))
);

create table if not exists estimates (
  id uuid primary key default gen_random_uuid(),
  estimate_number text not null unique,
  reference_number text,
  revision integer not null default 1,
  client_id uuid not null references clients(id) on delete restrict,
  job_id uuid references jobs(id) on delete set null,
  division text not null,
  region text not null,
  status text not null default 'draft',
  title text not null,
  site_address text,
  prepared_by_user_id uuid references app_users(id) on delete set null,
  prepared_at date not null,
  valid_until date,
  contact_name text,
  contact_mobile text,
  scope_of_work text,
  notes jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint estimates_division_check
    check (division in ('Water', 'Geotech')),
  constraint estimates_region_check
    check (region in ('North', 'South')),
  constraint estimates_status_check
    check (status in ('draft', 'sent', 'under_review', 'approved', 'declined'))
);

create table if not exists estimate_sections (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references estimates(id) on delete cascade,
  sort_order integer not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (estimate_id, sort_order)
);

create table if not exists estimate_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references estimate_sections(id) on delete cascade,
  sort_order integer not null,
  description text not null,
  quantity numeric(12,2),
  unit text,
  rate numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, sort_order)
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  job_id uuid not null references jobs(id) on delete restrict,
  client_id uuid not null references clients(id) on delete restrict,
  issue_date date not null,
  due_date date not null,
  amount numeric(14,2) not null,
  status text not null,
  paid_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_status_check
    check (status in ('draft', 'sent', 'paid', 'overdue', 'void'))
);

create table if not exists timesheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete restrict,
  week_start date not null,
  status text not null default 'draft',
  submitted_at timestamptz,
  supervisor_approved_by uuid references app_users(id) on delete set null,
  supervisor_approved_at timestamptz,
  manager_approved_by uuid references app_users(id) on delete set null,
  manager_approved_at timestamptz,
  total_hours numeric(10,2) not null default 0,
  total_overnights integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start),
  constraint timesheets_status_check
    check (status in ('draft', 'submitted', 'supervisor_approved', 'manager_approved', 'rejected'))
);

create table if not exists timesheet_days (
  id uuid primary key default gen_random_uuid(),
  timesheet_id uuid not null references timesheets(id) on delete cascade,
  work_date date not null,
  day_type text not null,
  leave_type text,
  overnight boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (timesheet_id, work_date),
  constraint timesheet_days_day_type_check
    check (day_type in ('work', 'leave', 'off')),
  constraint timesheet_days_leave_type_check
    check (leave_type in ('annual', 'sick', 'unpaid', 'other', 'public') or leave_type is null)
);

create table if not exists timesheet_entries (
  id uuid primary key default gen_random_uuid(),
  timesheet_day_id uuid not null references timesheet_days(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  start_time time,
  end_time time,
  hours numeric(8,2),
  rate_type text not null default 'ordinary',
  notes text,
  crew_with jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timesheet_entries_rate_type_check
    check (rate_type in ('ordinary', 'time_half', 'double', 'day_off'))
);

create table if not exists timesheet_expenses (
  id uuid primary key default gen_random_uuid(),
  timesheet_id uuid not null references timesheets(id) on delete cascade,
  expense_type text not null,
  description text not null,
  amount numeric(12,2) not null,
  has_receipt boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timesheet_expenses_type_check
    check (expense_type in ('tools', 'receipt'))
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  supplier_code text not null unique,
  name text not null,
  category text not null,
  division text,
  region text,
  contact_name text,
  email text,
  phone text,
  payment_terms_days integer,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_division_check
    check (division in ('Water', 'Geotech') or division is null),
  constraint suppliers_region_check
    check (region in ('North', 'South') or region is null),
  constraint suppliers_status_check
    check (status in ('active', 'inactive'))
);

create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique,
  supplier_id uuid not null references suppliers(id) on delete restrict,
  job_id uuid references jobs(id) on delete set null,
  description text not null,
  status text not null,
  issue_date date not null,
  amount numeric(14,2) not null,
  currency text not null default 'NZD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_orders_status_check
    check (status in ('draft', 'issued', 'partially_billed', 'closed', 'cancelled'))
);

create table if not exists supplier_invoices (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete restrict,
  purchase_order_id uuid references purchase_orders(id) on delete set null,
  supplier_invoice_number text not null,
  issue_date date not null,
  due_date date,
  amount numeric(14,2) not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supplier_id, supplier_invoice_number),
  constraint supplier_invoices_status_check
    check (status in ('received', 'approved', 'paid', 'disputed'))
);

create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  equipment_code text not null unique,
  name text not null,
  equipment_type text not null,
  category text,
  division text,
  region text,
  status text not null,
  serial_number text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint equipment_division_check
    check (division in ('Water', 'Geotech') or division is null),
  constraint equipment_region_check
    check (region in ('North', 'South') or region is null),
  constraint equipment_status_check
    check (status in ('available', 'deployed', 'maintenance', 'out_of_service'))
);

create table if not exists equipment_inspections (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  inspection_type text not null,
  inspection_date date not null,
  due_date date,
  status text not null,
  inspector_user_id uuid references app_users(id) on delete set null,
  notes text,
  findings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint equipment_inspections_status_check
    check (status in ('pass', 'action_required', 'open'))
);

create table if not exists planner_assignments (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  assignment_type text not null,
  title text not null,
  client_name text,
  site_address text,
  start_date date not null,
  end_date date not null,
  color_hex text,
  personnel jsonb not null default '[]'::jsonb,
  is_downtime boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planner_assignments_type_check
    check (assignment_type in ('job', 'maintenance', 'downtime')),
  constraint planner_assignments_date_check
    check (end_date >= start_date)
);

create table if not exists leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete restrict,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  day_count numeric(8,2) not null,
  status text not null default 'pending',
  notes text,
  submitted_at timestamptz not null default now(),
  approved_by_user_id uuid references app_users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leave_requests_type_check
    check (leave_type in ('annual', 'sick', 'unpaid', 'other', 'public')),
  constraint leave_requests_status_check
    check (status in ('pending', 'approved', 'declined')),
  constraint leave_requests_date_check
    check (end_date >= start_date)
);

create table if not exists hse_sssps (
  id uuid primary key default gen_random_uuid(),
  sssp_number text not null unique,
  job_id uuid not null references jobs(id) on delete cascade,
  client_id uuid not null references clients(id) on delete restrict,
  status text not null,
  next_review_date date,
  hazards jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hse_sssps_status_check
    check (status in ('draft', 'active', 'closed'))
);

create table if not exists hse_incidents (
  id uuid primary key default gen_random_uuid(),
  incident_number text not null unique,
  job_id uuid references jobs(id) on delete set null,
  reported_by_user_id uuid references app_users(id) on delete set null,
  severity text not null,
  occurred_at timestamptz not null,
  summary text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hse_incidents_severity_check
    check (severity in ('near_miss', 'minor', 'major', 'critical')),
  constraint hse_incidents_status_check
    check (status in ('open', 'investigating', 'closed'))
);

create or replace view estimate_totals_v as
select
  e.id,
  e.estimate_number,
  e.client_id,
  e.job_id,
  e.status,
  e.division,
  e.region,
  coalesce(sum(coalesce(i.quantity, 0) * i.rate), 0)::numeric(14,2) as total_value
from estimates e
left join estimate_sections s on s.estimate_id = e.id
left join estimate_items i on i.section_id = s.id
group by e.id;

create or replace view timesheet_totals_v as
select
  t.id,
  t.user_id,
  t.week_start,
  t.status,
  coalesce(sum(
    case
      when te.hours is not null then te.hours
      when te.start_time is not null and te.end_time is not null
        then extract(epoch from (te.end_time - te.start_time)) / 3600.0
      else 0
    end
  ), 0)::numeric(10,2) as computed_total_hours,
  count(distinct td.id) filter (where td.overnight) as computed_total_overnights
from timesheets t
left join timesheet_days td on td.timesheet_id = t.id
left join timesheet_entries te on te.timesheet_day_id = td.id
group by t.id;

create index if not exists idx_jobs_client_id on jobs(client_id);
create index if not exists idx_jobs_region_division_status on jobs(region, division, status);
create index if not exists idx_estimates_client_id on estimates(client_id);
create index if not exists idx_estimates_status_region_division on estimates(status, region, division);
create index if not exists idx_invoices_status_due_date on invoices(status, due_date);
create index if not exists idx_timesheets_user_week on timesheets(user_id, week_start desc);
create index if not exists idx_timesheet_entries_job_id on timesheet_entries(job_id);
create index if not exists idx_purchase_orders_supplier_id on purchase_orders(supplier_id);
create index if not exists idx_equipment_status_region on equipment(status, region);
create index if not exists idx_planner_assignments_equipment_dates on planner_assignments(equipment_id, start_date, end_date);
create index if not exists idx_leave_requests_user_dates on leave_requests(user_id, start_date, end_date);

do $$
declare
  record_item record;
begin
  for record_item in
    select table_name
    from information_schema.columns
    where table_schema = 'public'
      and column_name = 'updated_at'
  loop
    execute format('drop trigger if exists set_updated_at_%1$s on %1$s', record_item.table_name);
    execute format(
      'create trigger set_updated_at_%1$s before update on %1$s for each row execute function set_updated_at()',
      record_item.table_name
    );
  end loop;
end $$;

commit;
