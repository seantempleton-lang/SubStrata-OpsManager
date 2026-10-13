# Planner persistence and Jobs compatibility

Implemented locally on 14 October 2026. No production deployment or live assignment writes were performed.

Supervisor, Administrator and SuperUser can create and edit assignments. Other roles can view them. This uses the development plan's proposed global role policy; region and division filters are display filters. Equipment, planned crew and approved-leave conflicts warn without blocking saves.

The existing Gantt and month views now have an assignment editor with selectable Division (Water/Geotech) and Location (North/South). New plans default to the selected job's division/region (rig context for non-job assignments); explicit choices remain when changing the linked job or rig. Choices save on the assignment and drive crew filtering and visibility in both planner views. Selected crew remain visible and selected when the context changes, with Show all users available. Crew is saved from active `app_users` as `{userId, employeeCode, displayName}` references. Legacy names resolve only when unambiguous; unresolved references remain visible and require explicit correction/removal before saving.

Date inputs save via Save assignment. Dragging previews dates and saves once on release. Dates and overlaps are inclusive, so one-day assignments and shared boundary days work. Date calculations use New Zealand calendar values. Open drafts keep their original UUID and version through bootstrap changes. Failed saves restore persisted bars and retain recoverable draft inputs. A stale edit offers an explicit reload that discards the draft; it never silently overwrites another planner.

## API and migration

- `POST /api/planner-assignments`: complete assignment input.
- `PATCH /api/planner-assignments/:id`: complete assignment input plus the last read integer `version`.
- Input: `equipmentId` (rig UUID), `jobId` (job UUID, required for job assignments), `assignmentType` (`job`, `maintenance`, `downtime`), `title`, `start`, `end` (YYYY-MM-DD), `crewUserIds` (distinct active user UUIDs), `division` (Water/Geotech), `region` (North/South), optional `color` (#RRGGBB). For older API clients, omitted division/region preserve saved choices or default to the linked job/rig.
- Responses use the bootstrap planner format, including UUID `id`, display rig/job codes, UUID `equipmentId`/`jobDbId`, personnel references, `version`, `createdAt` and `updatedAt`.
- Errors: 400 invalid input/reference, 401 unauthenticated, 403 role denied, 404 missing assignment, 409 stale version, 500 unexpected persistence failure.

`014_planner_assignment_version.sql` adds an integer version defaulting to 1 and an update trigger. Every update, including a direct external database update, increments the version. Updates lock the existing row and compare its version within a transaction. Existing assignment UUIDs, dates, personnel, timestamps and Jobs log references are preserved by migration. No cancellation or deletion API was added.

`015_planner_assignment_context.sql` adds nullable division/region overrides and validates allowed choices. It does not rewrite existing rows, timestamps or versions. Legacy plans use job/rig defaults until explicitly saved. Assignment choices do not change the linked job's or rig's own division/region; Jobs continues using its authoritative job context for actual work records.

Apply pending migrations before starting the new API. The Docker entrypoint does this automatically. A deployment already using migration 014 needs only the new 015 migration. Review migration status against staging first. A fresh database also runs the historical seed/account migrations. Do not rerun historical seeds to create a current schedule.

Jobs needs no source changes: its existing direct reader accepts the structured crew references. Ops saves in place in the shared `public.planner_assignments` table and never writes `jobs_app` daily logs or attendance. Confirm Ops and Jobs point to the same intended database before staging end-to-end tests.

## Validation

```powershell
npm test
npm run build
```

Integration tests require a migrated **disposable local database whose name ends in `_test`**. The guard refuses other hosts/database names. For example:

```powershell
docker run --detach --name substrata-planner-test --publish 127.0.0.1:55439:5432 --env POSTGRES_PASSWORD=planner-test-only --env POSTGRES_DB=planner_test postgres:16-alpine
$env:DATABASE_URL = 'postgresql://postgres:planner-test-only@127.0.0.1:55439/planner_test'
npm run db:migrate:status
npm run db:migrate
$env:TEST_DATABASE_URL = $env:DATABASE_URL
$env:JOBS_REPO_PATH = 'C:/path/to/substrata-jobs'
npm run test:integration
docker rm --force substrata-planner-test
```

`JOBS_REPO_PATH` enables tests against the actual sibling Jobs repository. Its migrations are applied only to the disposable test database if Jobs tables are absent. Without that path, the Jobs-reader test is explicitly skipped. Fixtures are removed after tests. Do not set these variables to a deployed database.

Local results: five unit tests and eight integration test results passed, with no skips. Covered validation, active crew, permissions, one-day/non-job assignments, UUID/timestamp preservation, API restart/bootstrap reload, concurrent saves, legacy reads, independent division/location persistence, older-client compatibility, Jobs' 14-day window and My assignments filter, crew changes, and unchanged actual attendance/log content. Build passed.

Browser smoke checks used the disposable database: create/save, current crew labels, native date input edit, full reload, completed drag save, Personnel membership, stale-save draft retention and explicit reload recovery. Month-view inclusive dates were also checked. Division/location selectors were verified by changing Water/North to Geotech/South, retaining selected crew, selecting matching crew, reloading and finding the assignment in both views under South/Geotech filters even when the rig itself belonged to North. Production database configuration and live Jobs UI refresh remain staging checks; this implementation does not authorize rollout.
