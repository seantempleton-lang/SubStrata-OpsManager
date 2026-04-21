-- Real-world planner seed data based on the Auckland / upper North programme.

begin;

insert into app_users (employee_code, full_name, initials, role_title, division, region, email)
values
  ('EMP-010', 'Caleb Foster', 'CF', 'Driller', 'Water', 'North', 'caleb.foster@substrata.local'),
  ('EMP-011', 'Shiloh Te Rangi', 'SR', 'Driller', 'Water', 'North', 'shiloh.terangi@substrata.local'),
  ('EMP-012', 'Royden Blake', 'RB', 'Driller', 'Water', 'North', 'royden.blake@substrata.local'),
  ('EMP-013', 'Ben Harris', 'BH', 'Drillers Assistant', 'Water', 'North', 'ben.harris@substrata.local'),
  ('EMP-014', 'Lea Martin', 'LM', 'Field Technician', 'Geotech', 'North', 'lea.martin@substrata.local'),
  ('EMP-015', 'Akash Patel', 'AP', 'Field Technician', 'Geotech', 'North', 'akash.patel@substrata.local'),
  ('EMP-016', 'Lei Zhou', 'LZ', 'Field Technician', 'Water', 'North', 'lei.zhou@substrata.local'),
  ('EMP-017', 'Jaz Singh', 'JS', 'Driller', 'Water', 'North', 'jaz.singh@substrata.local'),
  ('EMP-018', 'Rahul Kumar', 'RK', 'Field Technician', 'Geotech', 'North', 'rahul.kumar@substrata.local'),
  ('EMP-019', 'Regan Moore', 'RM', 'Field Technician', 'Geotech', 'North', 'regan.moore@substrata.local')
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
  ('AUR', 'Aurecon', 'Engineering', 'North', 'accounts@aurecon.example.com', 'Auckland'),
  ('BECA', 'Beca', 'Engineering', 'North', 'accounts@beca.example.com', 'Auckland'),
  ('BECM', 'Beca/Mafia', 'Engineering', 'North', 'accounts@becamafia.example.com', 'Auckland'),
  ('AECJ', 'AECOM/Jacobs', 'Engineering', 'North', 'accounts@aecj.example.com', 'Auckland'),
  ('WAT', 'Watercare', 'Utilities', 'North', 'accounts@watercare.example.com', 'Auckland'),
  ('AKR', 'Aurecon/KiwiRail', 'Transport', 'North', 'accounts@kiwirail.example.com', 'Auckland'),
  ('DOW', 'Downer', 'Infrastructure', 'North', 'accounts@downer.example.com', 'Auckland'),
  ('GHD', 'GHD', 'Engineering', 'North', 'accounts@ghd.example.com', 'Auckland'),
  ('WSP', 'WSP', 'Engineering', 'North', 'accounts@wsp.example.com', 'Auckland'),
  ('ACC', 'Acciona', 'Infrastructure', 'North', 'accounts@acciona.example.com', 'Auckland'),
  ('PDP', 'PDP', 'Waste', 'North', 'accounts@pdp.example.com', 'Auckland'),
  ('JCB', 'Jacobs', 'Engineering', 'North', 'accounts@jacobs.example.com', 'Auckland'),
  ('ENG', 'Engeo', 'Engineering', 'North', 'accounts@engeo.example.com', 'Auckland')
on conflict (client_code) do update
set
  name = excluded.name,
  industry = excluded.industry,
  region = excluded.region,
  billing_email = excluded.billing_email,
  city = excluded.city;

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
  seed.job_number,
  seed.title,
  client_row.id,
  seed.client_code,
  seed.division,
  seed.region,
  seed.status,
  seed.job_type,
  manager_row.id,
  supervisor_row.id,
  seed.contract_value,
  seed.invoiced_value,
  seed.hours_logged,
  seed.start_date,
  seed.end_date,
  seed.site_name,
  seed.site_address
from (
  values
    ('302630', 'Northland Corridor Stage 2B', 'AUR', 'Water', 'North', 'active', 'drilling', 'EMP-001', 'EMP-010', 425000.00, 212000.00, 1180.00, date '2026-01-12', date '2026-06-20', 'Northland Corridor Stage 2B', 'Northland Corridor Stage 2B'),
    ('SI-23120', 'Tahiti', 'BECM', 'Water', 'North', 'active', 'drilling', 'EMP-006', 'EMP-002', 96000.00, 24000.00, 220.00, date '2026-04-28', date '2026-05-22', 'Tahiti', 'Tahiti'),
    ('302675', 'Takanini Level Crossings', 'AECJ', 'Geotech', 'North', 'active', 'geotechnical', 'EMP-006', 'EMP-012', 182000.00, 91000.00, 760.00, date '2026-01-19', date '2026-05-30', 'Takanini Level Crossings', 'Takanini Level Crossings'),
    ('302676', 'Orewa 3 (6 x 15m, 2 piezos) + 2 CPTs', 'WAT', 'Geotech', 'North', 'active', 'cpt_testing', 'EMP-006', 'EMP-015', 74000.00, 18500.00, 210.00, date '2026-04-28', date '2026-05-05', 'Orewa 3', 'Orewa 3 (6 x 15m, 2 piezos) + 2 CPTs'),
    ('SI-23551', 'AHTPAPU - Hamilton', 'AKR', 'Geotech', 'North', 'approved', 'investigation', 'EMP-006', 'EMP-015', 32000.00, 0.00, 24.00, date '2026-05-29', date '2026-05-30', 'AHTPAPU - Hamilton', 'AHTPAPU - Hamilton'),
    ('302762', 'AUT - TMP holes', 'BECA', 'Geotech', 'North', 'active', 'geotechnical', 'EMP-006', 'EMP-013', 18000.00, 9000.00, 44.00, date '2026-04-16', date '2026-04-21', 'AUT - TMP holes', 'AUT - TMP holes'),
    ('302670', 'W2T', 'ACC', 'Water', 'North', 'approved', 'drilling', 'EMP-001', 'EMP-017', 128000.00, 0.00, 0.00, date '2026-05-18', date '2026-06-26', 'W2T', 'W2T'),
    ('302819', '1852 East Coast Road', 'GHD', 'Geotech', 'North', 'active', 'geotechnical', 'EMP-006', 'EMP-014', 8400.00, 4200.00, 10.00, date '2026-04-20', date '2026-04-21', '1852 East Coast Road', '1852 East Coast Road'),
    ('302766', 'Birdwood Road', 'GHD', 'Geotech', 'North', 'active', 'geotechnical', 'EMP-006', 'EMP-014', 8200.00, 4100.00, 10.00, date '2026-04-21', date '2026-04-22', 'Birdwood Road', 'Birdwood Road'),
    ('302822', 'Mahurangi West Road', 'WSP', 'Geotech', 'North', 'approved', 'geotechnical', 'EMP-006', 'EMP-014', 9600.00, 0.00, 0.00, date '2026-04-28', date '2026-04-29', 'Mahurangi West Road', 'Mahurangi West Road'),
    ('302722', 'Redoubt Road', 'DOW', 'Water', 'North', 'approved', 'drilling', 'EMP-001', 'EMP-014', 42000.00, 0.00, 0.00, date '2026-05-18', date '2026-05-28', 'Redoubt Road', 'Redoubt Road'),
    ('302700', 'Rosedale Landfill inclos', 'PDP', 'Water', 'North', 'active', 'drilling', 'EMP-001', 'EMP-016', 64000.00, 18000.00, 88.00, date '2026-04-22', date '2026-05-02', 'Rosedale landfill inclos', 'Rosedale landfill inclos'),
    ('302778', 'Wicks Landfill', 'JCB', 'Water', 'North', 'approved', 'drilling', 'EMP-001', 'EMP-016', 38000.00, 0.00, 0.00, date '2026-05-04', date '2026-05-08', 'Wicks Landfill', 'Wicks Landfill'),
    ('302797', 'Avondale Lynfield/Whau', 'WAT', 'Water', 'North', 'active', 'drilling', 'EMP-001', 'EMP-017', 112000.00, 28000.00, 190.00, date '2026-05-04', date '2026-05-22', 'Avondale Lynfield/Whau', 'Avondale Lynfield/Whau'),
    ('302558', 'Waitakere/Hunua Dams (EGL scope)', 'WAT', 'Water', 'North', 'active', 'drilling', 'EMP-001', 'EMP-017', 69000.00, 34500.00, 124.00, date '2026-04-14', date '2026-05-04', 'Waitakere/Hunua Dams', 'Waitakere/Hunua Dams (EGL scope)'),
    ('302653', 'Mangakura No.2 Dam', 'WAT', 'Water', 'North', 'approved', 'drilling', 'EMP-001', 'EMP-017', 58000.00, 0.00, 0.00, date '2026-05-11', date '2026-05-21', 'Mangakura No.2 Dam', 'Mangakura No.2 Dam'),
    ('302258', 'Upper Huia Dam', 'WAT', 'Water', 'North', 'approved', 'drilling', 'EMP-001', 'EMP-017', 56000.00, 0.00, 0.00, date '2026-05-25', date '2026-06-05', 'Upper Huia Dam', 'Upper Huia Dam'),
    ('302825', 'tbc', 'JCB', 'Geotech', 'North', 'approved', 'cpt_testing', 'EMP-006', 'EMP-018', 12000.00, 0.00, 0.00, date '2026-04-21', date '2026-04-24', 'tbc', 'tbc'),
    ('302817', '86 Papaka Road, Karaka', 'ENG', 'Geotech', 'North', 'approved', 'cpt_testing', 'EMP-006', 'EMP-019', 14000.00, 0.00, 0.00, date '2026-04-23', date '2026-04-24', '86 Papaka Road, Karaka', '86 Papaka Road, Karaka')
) as seed(job_number, title, client_code, division, region, status, job_type, manager_code, supervisor_code, contract_value, invoiced_value, hours_logged, start_date, end_date, site_name, site_address)
join clients client_row on client_row.client_code = seed.client_code
left join app_users manager_row on manager_row.employee_code = seed.manager_code
left join app_users supervisor_row on supervisor_row.employee_code = seed.supervisor_code
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

insert into equipment (equipment_code, name, equipment_type, category, division, region, status, metadata)
values
  ('N101', 'N101 - D&B 8', 'rig', 'D&B 8', 'Water', 'North', 'deployed', '{"year": 2018, "rego": "N101DB8"}'::jsonb),
  ('N102', 'N102 - D&B 10', 'rig', 'D&B 10', 'Water', 'North', 'deployed', '{"year": 2019, "rego": "N102DB10"}'::jsonb),
  ('N103', 'N103 - D&B 10', 'rig', 'D&B 10', 'Water', 'North', 'deployed', '{"year": 2019, "rego": "N103DB10"}'::jsonb),
  ('N107', 'N107 - Delta', 'rig', 'Delta', 'Water', 'North', 'deployed', '{"year": 2017, "rego": "N107DELTA"}'::jsonb),
  ('N111', 'N111 - D&B 8', 'rig', 'D&B 8', 'Water', 'North', 'deployed', '{"year": 2018, "rego": "N111DB8"}'::jsonb),
  ('N118', 'N118 - Massenza MM3', 'rig', 'Massenza MM3', 'Water', 'North', 'maintenance', '{"year": 2020, "rego": "N118MM3"}'::jsonb),
  ('N119', 'N119 - Commachio', 'rig', 'Commachio', 'Geotech', 'North', 'deployed', '{"year": 2021, "rego": "N119CMM"}'::jsonb),
  ('N121', 'N121 - D&B 10', 'rig', 'D&B 10', 'Water', 'North', 'available', '{"year": 2018, "rego": "N121DB10"}'::jsonb),
  ('N125', 'N125 - Massenza MM3', 'rig', 'Massenza MM3', 'Water', 'North', 'deployed', '{"year": 2020, "rego": "N125MM3"}'::jsonb),
  ('N126', 'N126 - Hanjin D&B8-Truck', 'rig', 'Hanjin D&B8-Truck', 'Water', 'North', 'deployed', '{"year": 2016, "rego": "N126HJT"}'::jsonb),
  ('P272', 'P272 - Hanjin D&B8 SI', 'rig', 'Hanjin D&B8 SI', 'Geotech', 'North', 'maintenance', '{"year": 2015, "rego": "P272HSI"}'::jsonb),
  ('N106', 'N106 - Heli/Truck', 'rig', 'Heli/Truck', 'Water', 'North', 'deployed', '{"year": 2017, "rego": "N106HT"}'::jsonb),
  ('CPT', 'CPT - Platform', 'rig', 'CPT', 'Geotech', 'North', 'deployed', '{"year": 2022, "rego": "CPTPLT"}'::jsonb)
on conflict (equipment_code) do update
set
  name = excluded.name,
  equipment_type = excluded.equipment_type,
  category = excluded.category,
  division = excluded.division,
  region = excluded.region,
  status = excluded.status,
  metadata = excluded.metadata;

delete from planner_assignments
where equipment_id in (
  select id
  from equipment
  where equipment_code in ('N101', 'N102', 'N103', 'N107', 'N111', 'N118', 'N119', 'N121', 'N125', 'N126', 'P272', 'N106', 'CPT')
);

insert into planner_assignments (
  equipment_id,
  job_id,
  assignment_type,
  title,
  client_name,
  site_address,
  start_date,
  end_date,
  color_hex,
  personnel,
  is_downtime
)
select
  equipment_row.id,
  job_row.id,
  seed.assignment_type,
  seed.title,
  client_row.name,
  seed.site_address,
  seed.start_date,
  seed.end_date,
  seed.color_hex,
  seed.personnel::jsonb,
  seed.is_downtime
from (
  values
    ('N101', '302630', 'job', 'Northland Corridor Stage 2B', 'AUR', 'Northland Corridor Stage 2B', date '2026-04-28', date '2026-06-06', '#16A34A', '["Caleb Foster"]', false),
    ('N101', null, 'maintenance', 'Workshop - Planned maintenance', null, 'North yard workshop', date '2026-04-14', date '2026-04-25', '#EF4444', '[]', true),
    ('N102', '302630', 'job', 'Northland Corridor Stage 2B', 'AUR', 'Northland Corridor Stage 2B', date '2026-04-21', date '2026-06-20', '#16A34A', '["Shiloh Te Rangi"]', false),
    ('N103', '302630', 'job', 'Northland Corridor Stage 2B', 'AUR', 'Northland Corridor Stage 2B', date '2026-04-20', date '2026-05-04', '#16A34A', '["Craig Tait"]', false),
    ('N103', 'SI-23120', 'job', 'Tahiti', 'BECM', 'Tahiti', date '2026-04-28', date '2026-05-18', '#FACC15', '["Craig Tait"]', false),
    ('N103', null, 'maintenance', 'Workshop - Maintenance assessment', null, 'North yard workshop', date '2026-05-05', date '2026-05-14', '#EF4444', '[]', true),
    ('N107', '302675', 'job', 'Takanini Level Crossings', 'AECJ', 'Takanini Level Crossings', date '2026-04-20', date '2026-05-04', '#16A34A', '["Royden Blake"]', false),
    ('N111', '302762', 'job', 'AUT - TMP holes', 'BECA', 'AUT - TMP holes', date '2026-04-20', date '2026-04-24', '#16A34A', '["Ben Harris"]', false),
    ('N111', '302630', 'job', 'Northland Corridor Stage 2B', 'AUR', 'Northland Corridor Stage 2B', date '2026-04-24', date '2026-05-22', '#16A34A', '["Ben Harris"]', false),
    ('N111', '302670', 'job', 'W2T', 'ACC', 'W2T', date '2026-05-18', date '2026-06-26', '#FACC15', '[]', false),
    ('N118', '302819', 'job', '1852 East Coast Road', 'GHD', '1852 East Coast Road', date '2026-04-21', date '2026-04-22', '#16A34A', '["Lea Martin"]', false),
    ('N118', '302766', 'job', 'Birdwood Road', 'GHD', 'Birdwood Road', date '2026-04-22', date '2026-04-23', '#16A34A', '["Lea Martin"]', false),
    ('N118', '302822', 'job', 'Mahurangi West Road', 'WSP', 'Mahurangi West Road', date '2026-04-28', date '2026-04-29', '#FACC15', '["Lea Martin"]', false),
    ('N118', null, 'maintenance', 'Workshop - Maintenance assessment', null, 'North yard workshop', date '2026-04-29', date '2026-05-04', '#EF4444', '[]', true),
    ('N118', '302722', 'job', 'Redoubt Road', 'DOW', 'Redoubt Road', date '2026-05-18', date '2026-05-28', '#16A34A', '["Lea Martin"]', false),
    ('N119', '302675', 'job', 'Takanini Level Crossings', 'AECJ', 'Takanini Level Crossings', date '2026-04-20', date '2026-04-28', '#16A34A', '["Akash Patel"]', false),
    ('N119', '302676', 'job', 'Orewa 3 (6 x 15m, 2 piezos) + 2 CPTs', 'WAT', 'Orewa 3 (6 x 15m, 2 piezos) + 2 CPTs', date '2026-04-28', date '2026-05-05', '#16A34A', '["Akash Patel"]', false),
    ('N119', 'SI-23551', 'job', 'AHTPAPU - Hamilton', 'AKR', 'AHTPAPU - Hamilton', date '2026-05-29', date '2026-05-30', '#16A34A', '["Akash Patel"]', false),
    ('N119', '302670', 'job', 'W2T', 'ACC', 'W2T', date '2026-05-18', date '2026-06-26', '#FACC15', '["Akash Patel"]', false),
    ('N121', '302670', 'job', 'W2T', 'ACC', 'W2T', date '2026-05-18', date '2026-06-26', '#FACC15', '[]', false),
    ('N125', '302700', 'job', 'Rosedale Landfill inclos', 'PDP', 'Rosedale landfill inclos', date '2026-04-23', date '2026-05-03', '#16A34A', '["Lei Zhou"]', false),
    ('N125', '302778', 'job', 'Wicks Landfill', 'JCB', 'Wicks Landfill', date '2026-05-05', date '2026-05-12', '#16A34A', '["Lei Zhou"]', false),
    ('N126', '302797', 'job', 'Avondale Lynfield/Whau', 'WAT', 'Avondale Lynfield/Whau', date '2026-05-05', date '2026-05-24', '#FACC15', '["Jaz Singh"]', false),
    ('P272', '302630', 'job', 'Northland Corridor Stage 2B', 'AUR', 'Northland Corridor Stage 2B', date '2026-04-20', date '2026-04-28', '#16A34A', '["Caleb Foster"]', false),
    ('P272', null, 'downtime', 'Back to SI', null, 'Service interval return', date '2026-04-28', date '2026-05-02', '#EF4444', '[]', true),
    ('N106', '302558', 'job', 'Waitakere/Hunua Dams (EGL scope)', 'WAT', 'Waitakere/Hunua Dams (EGL scope)', date '2026-04-20', date '2026-05-04', '#16A34A', '["Jaz Singh"]', false),
    ('N106', '302653', 'job', 'Mangakura No.2 Dam', 'WAT', 'Mangakura No.2 Dam', date '2026-05-11', date '2026-05-25', '#FACC15', '["Jaz Singh"]', false),
    ('N106', '302258', 'job', 'Upper Huia Dam', 'WAT', 'Upper Huia Dam', date '2026-05-25', date '2026-06-05', '#FACC15', '["Jaz Singh"]', false),
    ('CPT', '302675', 'job', 'Takanini Level Crossings', 'AECJ', 'Takanini Level Crossings', date '2026-04-20', date '2026-04-22', '#16A34A', '["Rahul Kumar"]', false),
    ('CPT', '302676', 'job', 'Orewa 3 (6 x 15m, 2 piezos) + 2 CPTs', 'WAT', 'Orewa 3 (6 x 15m, 2 piezos) + 2 CPTs', date '2026-04-23', date '2026-04-24', '#16A34A', '["Regan Moore"]', false),
    ('CPT', '302825', 'job', 'tbc', 'JCB', 'tbc', date '2026-04-28', date '2026-04-30', '#16A34A', '["Rahul Kumar"]', false),
    ('CPT', '302817', 'job', '86 Papaka Road, Karaka', 'ENG', '86 Papaka Road, Karaka', date '2026-04-23', date '2026-04-24', '#16A34A', '["Regan Moore"]', false)
) as seed(equipment_code, job_number, assignment_type, title, client_code, site_address, start_date, end_date, color_hex, personnel, is_downtime)
join equipment equipment_row on equipment_row.equipment_code = seed.equipment_code
left join jobs job_row on job_row.job_number = seed.job_number
left join clients client_row on client_row.client_code = seed.client_code;

commit;
