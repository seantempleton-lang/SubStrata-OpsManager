-- SubStrata Ops Manager
-- Seed data aligned with the current demo app.

begin;

insert into app_users (employee_code, full_name, initials, role_title, division, region, email)
values
  ('EMP-001', 'Sean Templeton', 'ST', 'Lead Geotech', 'Geotech', 'South', 'sean@example.com'),
  ('EMP-002', 'Craig Tait', 'CT', 'Driller', 'Water', 'South', 'craig@example.com'),
  ('EMP-003', 'Dave Rudd', 'DR', 'Driller', 'Water', 'South', 'dave@example.com'),
  ('EMP-004', 'Tracey Flatman', 'TF', 'Administrator', 'Operations', 'South', 'tracey.flatman@drilling.co.nz'),
  ('EMP-005', 'Mike Brown', 'MB', 'Geotech Field Tech', 'Geotech', 'South', 'mike@example.com'),
  ('EMP-006', 'Tom Lubbe', 'TL', 'Supervisor', 'Operations', 'South', 'tom.lubbe@drilling.co.nz'),
  ('EMP-007', 'Pete Hapai', 'PH', 'Driller', 'Geotech', 'North', 'pete@example.com'),
  ('EMP-008', 'Tony Walsh', 'TW', 'Drillers Assistant', 'Water', 'South', 'tony@example.com'),
  ('EMP-009', 'Greg Cossar', 'GC', 'User', 'Operations', 'South', 'greg.cossar@drilling.co.nz')
on conflict (employee_code) do update
set
  full_name = excluded.full_name,
  initials = excluded.initials,
  role_title = excluded.role_title,
  division = excluded.division,
  region = excluded.region,
  email = excluded.email;

insert into clients (client_code, name, industry, region, billing_email, city)
values
  ('INZ', 'Irrigation NZ Ltd', 'Agriculture', 'South', 'accounts@irrigationnz.example.com', 'Leeston'),
  ('TNT', 'Tonkin + Taylor', 'Engineering', 'South', 'ap@tonkintaylor.example.com', 'Christchurch'),
  ('SDC', 'Selwyn District Council', 'Local Government', 'South', 'finance@selwyndc.example.com', 'Rolleston'),
  ('LU', 'Lincoln University', 'Education', 'South', 'ap@lincolnuni.example.com', 'Lincoln'),
  ('HCF', 'High Country Farms', 'Agriculture', 'South', 'office@highcountryfarms.example.com', 'Canterbury'),
  ('NZTA', 'NZTA', 'Transport', 'North', 'ap@nzta.example.com', 'Auckland'),
  ('NCV', 'North Canterbury Vineyards', 'Agriculture', 'South', 'admin@ncv.example.com', 'Waipara'),
  ('AE', 'Aurora Energy', 'Energy', 'North', 'ap@aurora.example.com', 'Auckland')
on conflict (client_code) do update
set
  name = excluded.name,
  industry = excluded.industry,
  region = excluded.region,
  billing_email = excluded.billing_email,
  city = excluded.city;

insert into client_contacts (client_id, full_name, job_title, email, mobile, is_primary)
select c.id, v.full_name, v.job_title, v.email, v.mobile, true
from (
  values
    ('INZ', 'Tom Willis', 'Project Engineer', 'tom.willis@irrigationnz.example.com', '+64 21 111 1111'),
    ('TNT', 'Rachel Wong', 'Senior Consultant', 'rachel.wong@tonkintaylor.example.com', '+64 21 222 2222'),
    ('NZTA', 'Mark Peters', 'Project Manager', 'mark.peters@nzta.example.com', '+64 21 333 3333')
) as v(client_code, full_name, job_title, email, mobile)
join clients c on c.client_code = v.client_code
on conflict do nothing;

insert into jobs (
  job_number,
  title,
  client_id,
  client_code,
  division,
  region,
  status,
  job_type,
  manager_user_id,
  supervisor_user_id,
  contract_value,
  invoiced_value,
  hours_logged,
  start_date,
  end_date,
  site_name,
  site_address
)
select
  v.job_number,
  v.title,
  c.id,
  v.client_code,
  v.division,
  v.region,
  v.status,
  v.job_type,
  manager_user.id,
  supervisor_user.id,
  v.contract_value,
  v.invoiced_value,
  v.hours_logged,
  v.start_date,
  v.end_date,
  v.site_name,
  v.site_address
from (
  values
    ('100018', 'Bore Installation - Station Road Farm', 'INZ', 'Water', 'South', 'active', 'water_bore', 'EMP-001', 'EMP-002', 42500.00, 21250.00, 184.00, date '2026-02-10', date '2026-03-20', 'Station Road Farm', 'Station Road, Leeston'),
    ('200042', 'Ground Investigation - Prestons Road', 'TNT', 'Geotech', 'South', 'active', 'geotechnical', 'EMP-004', 'EMP-005', 68000.00, 0.00, 96.00, date '2026-03-01', date '2026-04-15', 'Prestons Road Site', 'Prestons Road, Christchurch'),
    ('100015', 'Monitoring Bore Network - Selwyn District', 'SDC', 'Water', 'South', 'complete', 'monitoring_bore', 'EMP-001', 'EMP-002', 115000.00, 115000.00, 620.00, date '2025-11-01', date '2026-02-28', 'Selwyn District', 'Multiple, Selwyn District'),
    ('200038', 'CPT Testing - Lincoln University Campus', 'LU', 'Geotech', 'South', 'quoted', 'cpt_testing', 'EMP-004', null, 24000.00, 0.00, 0.00, null, null, 'Lincoln University', 'Lincoln University, Lincoln'),
    ('100021', 'Irrigation Bore - Rakaia Gorge', 'HCF', 'Water', 'South', 'approved', 'water_bore', 'EMP-001', 'EMP-003', 55000.00, 0.00, 0.00, date '2026-03-15', date '2026-05-01', 'Rakaia Gorge', 'Rakaia Gorge Road, Canterbury'),
    ('200029', 'Slope Stability Investigation - State Highway 73', 'NZTA', 'Geotech', 'North', 'active', 'geotechnical', 'EMP-006', 'EMP-007', 132000.00, 44000.00, 410.00, date '2026-01-20', date '2026-04-30', 'SH73 Corridor', 'SH73, West Auckland'),
    ('100009', 'Rural Water Supply - Waipara Valley', 'NCV', 'Water', 'South', 'on_hold', 'water_bore', 'EMP-001', 'EMP-002', 38000.00, 9500.00, 88.00, date '2026-01-15', null, 'Waipara Valley', 'Waipara Valley, North Canterbury'),
    ('200044', 'Contamination Assessment - Industrial Site', 'AE', 'Geotech', 'North', 'enquiry', 'environmental', null, null, null, 0.00, 0.00, null, null, 'East Tamaki', 'East Tamaki, Auckland')
) as v(job_number, title, client_code, division, region, status, job_type, manager_code, supervisor_code, contract_value, invoiced_value, hours_logged, start_date, end_date, site_name, site_address)
join clients c on c.client_code = v.client_code
left join app_users manager_user on manager_user.employee_code = v.manager_code
left join app_users supervisor_user on supervisor_user.employee_code = v.supervisor_code
on conflict (job_number) do update
set
  title = excluded.title,
  client_id = excluded.client_id,
  client_code = excluded.client_code,
  division = excluded.division,
  region = excluded.region,
  status = excluded.status,
  job_type = excluded.job_type,
  manager_user_id = excluded.manager_user_id,
  supervisor_user_id = excluded.supervisor_user_id,
  contract_value = excluded.contract_value,
  invoiced_value = excluded.invoiced_value,
  hours_logged = excluded.hours_logged,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  site_name = excluded.site_name,
  site_address = excluded.site_address;

insert into estimates (
  estimate_number,
  reference_number,
  revision,
  client_id,
  job_id,
  division,
  region,
  status,
  title,
  site_address,
  prepared_by_user_id,
  prepared_at,
  valid_until,
  contact_name,
  contact_mobile,
  scope_of_work,
  notes
)
select
  v.estimate_number,
  v.reference_number,
  v.revision,
  c.id,
  j.id,
  v.division,
  v.region,
  v.status,
  v.title,
  v.site_address,
  u.id,
  v.prepared_at,
  v.valid_until,
  v.contact_name,
  v.contact_mobile,
  v.scope_of_work,
  v.notes::jsonb
from (
  values
    ('EST-2026-0001', '23560', 1, 'LU', '200038', 'Geotech', 'South', 'sent', 'CPT Testing - Lincoln University Campus', 'Lincoln University, Lincoln', 'EMP-004', date '2026-03-05', date '2026-04-05', 'Rachel Wong', '+64 21 222 2222', 'Provide CPT testing and field reporting.', '["GST excluded", "Valid for 30 days"]'),
    ('EST-2026-0002', '23561', 1, 'AE', null, 'Geotech', 'North', 'draft', 'Contamination Assessment - Industrial Site', 'East Tamaki, Auckland', 'EMP-006', date '2026-03-09', date '2026-04-09', 'Mark Peters', '+64 21 333 3333', 'Preliminary contamination sampling and reporting.', '["Draft only"]'),
    ('EST-2026-0003', '23562', 1, 'HCF', '100021', 'Water', 'South', 'approved', 'Irrigation Bore - Rakaia Gorge', 'Rakaia Gorge Road, Canterbury', 'EMP-001', date '2026-03-01', date '2026-03-31', 'Tom Willis', '+64 21 111 1111', 'Supply and install irrigation bore.', '["Approved by client"]')
) as v(estimate_number, reference_number, revision, client_code, job_number, division, region, status, title, site_address, prepared_by_code, prepared_at, valid_until, contact_name, contact_mobile, scope_of_work, notes)
join clients c on c.client_code = v.client_code
left join jobs j on j.job_number = v.job_number
left join app_users u on u.employee_code = v.prepared_by_code
on conflict (estimate_number) do update
set
  reference_number = excluded.reference_number,
  revision = excluded.revision,
  client_id = excluded.client_id,
  job_id = excluded.job_id,
  division = excluded.division,
  region = excluded.region,
  status = excluded.status,
  title = excluded.title,
  site_address = excluded.site_address,
  prepared_by_user_id = excluded.prepared_by_user_id,
  prepared_at = excluded.prepared_at,
  valid_until = excluded.valid_until,
  contact_name = excluded.contact_name,
  contact_mobile = excluded.contact_mobile,
  scope_of_work = excluded.scope_of_work,
  notes = excluded.notes;

insert into estimate_sections (estimate_id, sort_order, title)
select e.id, v.sort_order, v.title
from (
  values
    ('EST-2026-0001', 1, 'Fieldwork'),
    ('EST-2026-0001', 2, 'Reporting'),
    ('EST-2026-0002', 1, 'Sampling'),
    ('EST-2026-0003', 1, 'Drilling'),
    ('EST-2026-0003', 2, 'Completion')
) as v(estimate_number, sort_order, title)
join estimates e on e.estimate_number = v.estimate_number
on conflict (estimate_id, sort_order) do update
set title = excluded.title;

insert into estimate_items (section_id, sort_order, description, quantity, unit, rate)
select s.id, v.item_order, v.description, v.quantity, v.unit, v.rate
from (
  values
    ('EST-2026-0001', 'Fieldwork', 1, 'CPT mobilisation', 1.00, 'ls', 2500.00),
    ('EST-2026-0001', 'Fieldwork', 2, 'CPT pushes', 2.00, 'ea', 4800.00),
    ('EST-2026-0001', 'Reporting', 1, 'Interpretive letter report', 1.00, 'ls', 1800.00),
    ('EST-2026-0002', 'Sampling', 1, 'Site mobilisation', 1.00, 'ls', 2200.00),
    ('EST-2026-0002', 'Sampling', 2, 'Soil samples', 12.00, 'ea', 180.00),
    ('EST-2026-0003', 'Drilling', 1, 'Bore installation to 60m', 1.00, 'ls', 42000.00),
    ('EST-2026-0003', 'Completion', 1, 'Pump test and completion report', 1.00, 'ls', 7500.00)
) as v(estimate_number, section_title, item_order, description, quantity, unit, rate)
join estimates e on e.estimate_number = v.estimate_number
join estimate_sections s on s.estimate_id = e.id and s.title = v.section_title
on conflict (section_id, sort_order) do update
set
  description = excluded.description,
  quantity = excluded.quantity,
  unit = excluded.unit,
  rate = excluded.rate;

insert into invoices (invoice_number, job_id, client_id, issue_date, due_date, amount, status)
select
  v.invoice_number,
  j.id,
  c.id,
  v.issue_date,
  v.due_date,
  v.amount,
  v.status
from (
  values
    ('INV-2026-0031', '100018', 'INZ', date '2026-02-24', date '2026-03-25', 21250.00, 'sent'),
    ('INV-2026-0028', '200029', 'NZTA', date '2026-01-31', date '2026-03-01', 44000.00, 'overdue'),
    ('INV-2026-0025', '100009', 'NCV', date '2026-01-29', date '2026-02-28', 9500.00, 'paid'),
    ('INV-2026-0022', '100015', 'SDC', date '2026-01-16', date '2026-02-15', 57500.00, 'paid')
) as v(invoice_number, job_number, client_code, issue_date, due_date, amount, status)
join jobs j on j.job_number = v.job_number
join clients c on c.client_code = v.client_code
on conflict (invoice_number) do update
set
  job_id = excluded.job_id,
  client_id = excluded.client_id,
  issue_date = excluded.issue_date,
  due_date = excluded.due_date,
  amount = excluded.amount,
  status = excluded.status;

insert into timesheets (
  user_id,
  week_start,
  status,
  submitted_at,
  supervisor_approved_by,
  supervisor_approved_at,
  manager_approved_by,
  manager_approved_at,
  total_hours,
  total_overnights
)
select
  u.id,
  v.week_start,
  v.status,
  v.submitted_at,
  sup.id,
  v.supervisor_approved_at,
  mgr.id,
  v.manager_approved_at,
  v.total_hours,
  v.total_overnights
from (
  values
    ('EMP-002', date '2026-03-09', 'supervisor_approved', timestamptz '2026-03-09 18:30+13', 'EMP-001', timestamptz '2026-03-10 09:00+13', null, null, 47.00, 2),
    ('EMP-003', date '2026-03-09', 'submitted', timestamptz '2026-03-09 17:45+13', null, null, null, null, 40.00, 0),
    ('EMP-007', date '2026-03-09', 'manager_approved', timestamptz '2026-03-09 16:00+13', 'EMP-006', timestamptz '2026-03-10 08:00+13', 'EMP-006', timestamptz '2026-03-11 12:00+13', 42.00, 2)
) as v(user_code, week_start, status, submitted_at, supervisor_code, supervisor_approved_at, manager_code, manager_approved_at, total_hours, total_overnights)
join app_users u on u.employee_code = v.user_code
left join app_users sup on sup.employee_code = v.supervisor_code
left join app_users mgr on mgr.employee_code = v.manager_code
on conflict (user_id, week_start) do update
set
  status = excluded.status,
  submitted_at = excluded.submitted_at,
  supervisor_approved_by = excluded.supervisor_approved_by,
  supervisor_approved_at = excluded.supervisor_approved_at,
  manager_approved_by = excluded.manager_approved_by,
  manager_approved_at = excluded.manager_approved_at,
  total_hours = excluded.total_hours,
  total_overnights = excluded.total_overnights;

insert into timesheet_days (timesheet_id, work_date, day_type, leave_type, overnight, notes)
select t.id, v.work_date, v.day_type, v.leave_type, v.overnight, v.notes
from (
  values
    ('EMP-002', date '2026-03-09', date '2026-03-09', 'work', null, false, 'Drilling to 45m, casing run'),
    ('EMP-002', date '2026-03-09', date '2026-03-08', 'work', null, false, 'Drilling 30-42m depth'),
    ('EMP-002', date '2026-03-09', date '2026-03-07', 'work', null, true, 'Remote site overnight'),
    ('EMP-002', date '2026-03-09', date '2026-03-06', 'work', null, true, 'Mobilised to Leeston'),
    ('EMP-002', date '2026-03-09', date '2026-03-05', 'work', null, false, 'Rig prep and load-out'),
    ('EMP-003', date '2026-03-09', date '2026-03-09', 'work', null, false, 'Site setup Rakaia Gorge'),
    ('EMP-003', date '2026-03-09', date '2026-03-08', 'work', null, false, 'Equipment check and prep'),
    ('EMP-007', date '2026-03-09', date '2026-03-09', 'work', null, false, 'CPT testing SH73 Site C'),
    ('EMP-007', date '2026-03-09', date '2026-03-08', 'work', null, false, 'Fieldwork'),
    ('EMP-007', date '2026-03-09', date '2026-03-07', 'work', null, true, 'Overnight Auckland')
) as v(user_code, week_start, work_date, day_type, leave_type, overnight, notes)
join app_users u on u.employee_code = v.user_code
join timesheets t on t.user_id = u.id and t.week_start = v.week_start
on conflict (timesheet_id, work_date) do update
set
  day_type = excluded.day_type,
  leave_type = excluded.leave_type,
  overnight = excluded.overnight,
  notes = excluded.notes;

insert into timesheet_entries (timesheet_day_id, job_id, hours, rate_type, notes, crew_with)
select td.id, j.id, v.hours, v.rate_type, v.notes, v.crew_with::jsonb
from (
  values
    ('EMP-002', date '2026-03-09', date '2026-03-09', '100018', 10.00, 'ordinary', 'Drilling to 45m, casing run', '["Tony Walsh"]'),
    ('EMP-002', date '2026-03-09', date '2026-03-08', '100018', 9.00, 'ordinary', 'Drilling 30-42m depth', '["Tony Walsh"]'),
    ('EMP-002', date '2026-03-09', date '2026-03-07', '100018', 10.00, 'ordinary', 'Overnight remote site', '["Tony Walsh"]'),
    ('EMP-003', date '2026-03-09', date '2026-03-09', '100021', 8.00, 'ordinary', 'Site setup', '["Tony Walsh"]'),
    ('EMP-003', date '2026-03-09', date '2026-03-08', '100021', 8.00, 'ordinary', 'Equipment check and prep', '[]'),
    ('EMP-007', date '2026-03-09', date '2026-03-09', '200029', 9.00, 'ordinary', 'CPT testing SH73 Site C', '["James Tuhoe"]'),
    ('EMP-007', date '2026-03-09', date '2026-03-08', '200029', 9.00, 'ordinary', 'Fieldwork', '["James Tuhoe"]')
) as v(user_code, week_start, work_date, job_number, hours, rate_type, notes, crew_with)
join app_users u on u.employee_code = v.user_code
join timesheets t on t.user_id = u.id and t.week_start = v.week_start
join timesheet_days td on td.timesheet_id = t.id and td.work_date = v.work_date
join jobs j on j.job_number = v.job_number
on conflict do nothing;

insert into timesheet_expenses (timesheet_id, expense_type, description, amount, has_receipt)
select t.id, v.expense_type, v.description, v.amount, v.has_receipt
from (
  values
    ('EMP-002', date '2026-03-09', 'tools', 'Tri-cone bit replacement', 145.00, true),
    ('EMP-007', date '2026-03-09', 'receipt', 'Accommodation - Auckland 2 nights', 310.00, true)
) as v(user_code, week_start, expense_type, description, amount, has_receipt)
join app_users u on u.employee_code = v.user_code
join timesheets t on t.user_id = u.id and t.week_start = v.week_start
on conflict do nothing;

insert into suppliers (supplier_code, name, category, division, region, contact_name, email, phone, payment_terms_days)
values
  ('SUP-001', 'DrillCo Supplies', 'Consumables', 'Water', 'South', 'Amy Fisher', 'amy@drillco.example.com', '+64 3 111 1111', 20),
  ('SUP-002', 'GeoLab NZ', 'Laboratory', 'Geotech', 'South', 'Ben Harrison', 'ben@geolab.example.com', '+64 3 222 2222', 30),
  ('SUP-003', 'HireFleet', 'Plant Hire', 'Geotech', 'North', 'Chris Lee', 'chris@hirefleet.example.com', '+64 9 333 3333', 14)
on conflict (supplier_code) do update
set
  name = excluded.name,
  category = excluded.category,
  division = excluded.division,
  region = excluded.region,
  contact_name = excluded.contact_name,
  email = excluded.email,
  phone = excluded.phone,
  payment_terms_days = excluded.payment_terms_days;

insert into purchase_orders (po_number, supplier_id, job_id, description, status, issue_date, amount)
select v.po_number, s.id, j.id, v.description, v.status, v.issue_date, v.amount
from (
  values
    ('PO-2026-0001', 'SUP-001', '100018', 'Drilling consumables for Station Road Farm', 'issued', date '2026-03-04', 1450.00),
    ('PO-2026-0002', 'SUP-002', '200042', 'Lab testing for Prestons Road samples', 'partially_billed', date '2026-03-06', 3200.00)
) as v(po_number, supplier_code, job_number, description, status, issue_date, amount)
join suppliers s on s.supplier_code = v.supplier_code
join jobs j on j.job_number = v.job_number
on conflict (po_number) do update
set
  supplier_id = excluded.supplier_id,
  job_id = excluded.job_id,
  description = excluded.description,
  status = excluded.status,
  issue_date = excluded.issue_date,
  amount = excluded.amount;

insert into supplier_invoices (supplier_id, purchase_order_id, supplier_invoice_number, issue_date, due_date, amount, status)
select s.id, po.id, v.invoice_number, v.issue_date, v.due_date, v.amount, v.status
from (
  values
    ('SUP-001', 'PO-2026-0001', 'DC-55101', date '2026-03-07', date '2026-03-27', 145.00, 'approved'),
    ('SUP-002', 'PO-2026-0002', 'GL-8834', date '2026-03-10', date '2026-04-09', 1120.00, 'received')
) as v(supplier_code, po_number, invoice_number, issue_date, due_date, amount, status)
join suppliers s on s.supplier_code = v.supplier_code
join purchase_orders po on po.po_number = v.po_number
on conflict (supplier_id, supplier_invoice_number) do update
set
  purchase_order_id = excluded.purchase_order_id,
  issue_date = excluded.issue_date,
  due_date = excluded.due_date,
  amount = excluded.amount,
  status = excluded.status;

insert into equipment (equipment_code, name, equipment_type, category, division, region, status)
values
  ('RIG-001', 'Drill Rig 1 - South', 'rig', 'drilling', 'Water', 'South', 'deployed'),
  ('RIG-002', 'Drill Rig 2 - North', 'rig', 'drilling', 'Geotech', 'North', 'deployed'),
  ('UTE-001', 'Support Ute 1', 'vehicle', 'support', 'Water', 'South', 'available'),
  ('TRK-001', 'Service Truck', 'vehicle', 'support', 'Geotech', 'South', 'maintenance')
on conflict (equipment_code) do update
set
  name = excluded.name,
  equipment_type = excluded.equipment_type,
  category = excluded.category,
  division = excluded.division,
  region = excluded.region,
  status = excluded.status;

insert into equipment_inspections (equipment_id, inspection_type, inspection_date, due_date, status, inspector_user_id, notes, findings)
select e.id, v.inspection_type, v.inspection_date, v.due_date, v.status, u.id, v.notes, v.findings::jsonb
from (
  values
    ('RIG-001', 'Pre-start', date '2026-03-09', date '2026-03-10', 'pass', 'EMP-002', 'All clear for drilling.', '[]'),
    ('TRK-001', 'Monthly', date '2026-03-08', date '2026-04-08', 'action_required', 'EMP-005', 'Service brake pads before next deployment.', '["Brake pad wear noted"]')
) as v(equipment_code, inspection_type, inspection_date, due_date, status, inspector_code, notes, findings)
join equipment e on e.equipment_code = v.equipment_code
left join app_users u on u.employee_code = v.inspector_code
on conflict do nothing;

insert into planner_assignments (equipment_id, job_id, assignment_type, title, client_name, site_address, start_date, end_date, color_hex, personnel, is_downtime)
select
  e.id,
  j.id,
  v.assignment_type,
  v.title,
  c.name,
  j.site_address,
  v.start_date,
  v.end_date,
  v.color_hex,
  v.personnel::jsonb,
  v.is_downtime
from (
  values
    ('RIG-001', '100018', 'job', 'Station Road Farm Bore', 'INZ', date '2026-03-05', date '2026-03-20', '#3B82F6', '["Craig Tait", "Tony Walsh"]', false),
    ('RIG-002', '200029', 'job', 'SH73 Slope Stability', 'NZTA', date '2026-03-01', date '2026-03-18', '#0D9488', '["Pete Hapai", "James Tuhoe"]', false),
    ('TRK-001', null, 'maintenance', 'Truck maintenance', null, date '2026-03-10', date '2026-03-14', '#F97316', '[]', true)
) as v(equipment_code, job_number, assignment_type, title, client_code, start_date, end_date, color_hex, personnel, is_downtime)
join equipment e on e.equipment_code = v.equipment_code
left join jobs j on j.job_number = v.job_number
left join clients c on c.client_code = v.client_code
on conflict do nothing;

insert into leave_requests (user_id, leave_type, start_date, end_date, day_count, status, notes, submitted_at, approved_by_user_id, approved_at)
select
  u.id,
  v.leave_type,
  v.start_date,
  v.end_date,
  v.day_count,
  v.status,
  v.notes,
  v.submitted_at,
  approver.id,
  v.approved_at
from (
  values
    ('EMP-002', 'annual', date '2026-03-30', date '2026-04-03', 5.00, 'pending', 'Pre-approved by email', timestamptz '2026-03-09 10:00+13', null, null),
    ('EMP-007', 'annual', date '2026-04-14', date '2026-04-17', 4.00, 'pending', 'School holidays', timestamptz '2026-03-07 10:00+13', null, null),
    ('EMP-003', 'sick', date '2026-03-06', date '2026-03-06', 1.00, 'approved', 'GP cert attached', timestamptz '2026-03-06 09:00+13', 'EMP-001', timestamptz '2026-03-07 08:00+13')
) as v(user_code, leave_type, start_date, end_date, day_count, status, notes, submitted_at, approver_code, approved_at)
join app_users u on u.employee_code = v.user_code
left join app_users approver on approver.employee_code = v.approver_code
on conflict do nothing;

insert into hse_sssps (sssp_number, job_id, client_id, status, next_review_date, hazards, actions)
select
  v.sssp_number,
  j.id,
  c.id,
  v.status,
  v.next_review_date,
  v.hazards::jsonb,
  v.actions::jsonb
from (
  values
    ('SSSP-2026-003', '200042', 'TNT', 'active', date '2026-04-01', '["Ground collapse", "Traffic management", "SPT rebound"]', '[]'),
    ('SSSP-2026-002', '100018', 'INZ', 'active', date '2026-03-20', '["Rotary drilling", "High pressure air", "Remote location"]', '["Update emergency contacts"]'),
    ('SSSP-2026-001', '200029', 'NZTA', 'active', date '2026-03-25', '["Traffic - live highway", "Slope instability", "Working at height"]', '["Traffic management plan due"]')
) as v(sssp_number, job_number, client_code, status, next_review_date, hazards, actions)
join jobs j on j.job_number = v.job_number
join clients c on c.client_code = v.client_code
on conflict (sssp_number) do update
set
  job_id = excluded.job_id,
  client_id = excluded.client_id,
  status = excluded.status,
  next_review_date = excluded.next_review_date,
  hazards = excluded.hazards,
  actions = excluded.actions;

insert into hse_incidents (incident_number, job_id, reported_by_user_id, severity, occurred_at, summary, status)
select
  'INC-2026-0001',
  j.id,
  u.id,
  'near_miss',
  timestamptz '2026-03-02 14:10+13',
  'Minor slip hazard identified during site setup and corrected before work resumed.',
  'closed'
from jobs j
join app_users u on u.employee_code = 'EMP-005'
where j.job_number = '200042'
on conflict (incident_number) do update
set
  job_id = excluded.job_id,
  reported_by_user_id = excluded.reported_by_user_id,
  severity = excluded.severity,
  occurred_at = excluded.occurred_at,
  summary = excluded.summary,
  status = excluded.status;

commit;
