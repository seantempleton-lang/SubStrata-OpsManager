begin;

alter table supplier_invoices
  add column if not exists received_at date,
  add column if not exists approved_by_user_id uuid references app_users(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists notes text;

update supplier_invoices
set received_at = coalesce(received_at, issue_date);

commit;
