# Database Setup

This folder gives you a PostgreSQL starting point for the current SubStrata Ops Manager app.

## Files

- `001_schema.sql`: core tables, indexes, update triggers, and reporting views
- `002_seed.sql`: demo data aligned with the current frontend modules

## What The Schema Covers

- users and staff
- clients and client contacts
- jobs
- estimates, sections, and line items
- invoices
- timesheets, day rows, entries, and expenses
- suppliers, purchase orders, and supplier invoices
- equipment, inspections, and planner assignments
- leave requests
- HSE SSSPs and incidents

## Coolify Setup

1. In Coolify, create a new PostgreSQL resource in the same project/environment as the app.
2. Save the generated database name, username, password, and the internal connection URL.
3. Use the internal URL from Coolify when your app and database are in the same network.
4. Enable scheduled backups for the PostgreSQL resource before loading real data.

## Load The Schema

If you have `psql` locally:

```bash
psql "$DATABASE_URL" -f db/001_schema.sql
psql "$DATABASE_URL" -f db/002_seed.sql
```

If you are importing through Coolify and want to use plain SQL instead of a custom `pg_dump` archive, use `psql` as the import command for the SQL files.

## Suggested App Environment Variables

```env
DATABASE_URL=postgres://user:password@host:5432/database
PGHOST=host
PGPORT=5432
PGDATABASE=database
PGUSER=user
PGPASSWORD=password
```

## Suggested Next Backend Steps

1. Add a small API layer between the frontend and PostgreSQL.
2. Replace hard-coded module seed data with read queries by feature.
3. Move write flows first for estimates, jobs, and timesheets.
4. Add migrations so schema changes stay versioned.

## Notes

- The schema uses text constraints instead of PostgreSQL enums to keep future app changes easier to deploy.
- The two views in `001_schema.sql` are there to simplify estimate total and timesheet total reads.
- Seed data is intentionally small enough to understand and large enough to exercise the current modules.
