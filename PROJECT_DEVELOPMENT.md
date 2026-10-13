# SubStrata Ops Manager development plan

Last inspected: 14 October 2026  
Current priority: Review the local planner implementation and validate staging before rollout  
Status: Planner persistence/personnel implementation and local validation complete; production rollout pending

## Implementation result

Implemented locally on 14 October 2026, including selectable assignment division/location. See [planner implementation and validation notes](docs/PLANNER_PERSISTENCE.md) for the API contract, migrations `014` and `015`, test commands, adopted permission/conflict defaults and staging checks. Build, five unit tests, eight integration test results (including the actual sibling Jobs reader), and local browser smoke checks passed. The disposable database was removed afterward. No production deployment or live assignment changes were made during implementation.

## Implementation scope

The implemented scope below preserves the existing Ops layout and working authentication. An authorised planner can create and edit real assignments in Ops and reload without losing changes. The actual Jobs reader was verified against the same disposable test database; live Jobs UI refresh and deployed database configuration remain staging checks.

This document records the investigation and recommended implementation scope. No planner functionality or production data was changed during this handoff. Role policy and conflict behaviour below are proposed defaults, not previously agreed product decisions.

Suggested opening prompt:

> Read PROJECT_DEVELOPMENT.md and inspect the repository. Implement the planner persistence and personnel assignment step, including compatibility with Substrata Jobs. Preserve the existing layout, use current user accounts for crew selection, and verify that saved assignments survive reload and appear in Jobs. Resolve routine implementation choices from the plan and ask only about material unresolved product decisions. Do not deploy or alter live assignments as part of local implementation.

## Product and deployment context

Ops owns users, authentication, roles, clients, jobs, equipment, personnel, and planned assignments. Jobs owns daily work records, actual crew attendance, activities, quantities, and offline synchronisation. Field owns technical point workflows. Planned crew and actual attendance must remain separate: changing an Ops plan must not silently rewrite an existing Jobs daily log.

The user has deployed and tested Jobs and Field and reports both working as expected. Jobs currently reports no planned assignments. These are the actual LAN application URLs:

| Application | URL |
| --- | --- |
| Ops | http://substrata.ops.mcm |
| Jobs | http://substrata-jobs.mcm |
| Field | http://substrata.field.mcm |

All are deployed through Coolify on the repository's server. Ops and Jobs are designed to use the same PostgreSQL core tables; verify the deployed database configuration before end-to-end testing rather than assuming it. No credentials belong in this document or client code.

Local repositories at the time of inspection:

- Ops: `C:\Users\SeanTempleton\OneDrive - McMillan Drilling Ltd\Documents\GitHub\SubStrata-OpsManager`
- Jobs: `C:\Users\SeanTempleton\OneDrive - McMillan Drilling Ltd\Documents\substrata-jobs`
- Field: `C:\Users\SeanTempleton\OneDrive - McMillan Drilling Ltd\Documents\GitHub\substrata-field`

Jobs' product boundaries are documented in the sibling repository's `docs/MVP_SPEC.md`. Jobs' next approval/reporting steps are separate from this Ops planner work.

## Verified current state

### Live browser inspection

The logged-in Ops workspace was inspected on 14 October 2026 with all regions and both divisions visible:

- The planner showed 15 rigs and no bars in its current October schedule.
- Navigating back to May-June displayed the historical seeded assignments.
- Every listed person showed zero active assignments; Sean's detail panel also said "No active planner assignments."
- Four historical equipment conflicts were still shown even when the current schedule was empty.
- The dashboard displayed a fixed March 2026 greeting/date. This is a hard-coded UI label, not proof that the server clock is wrong.

These observations support stale planning data as the explanation for Jobs' empty window. The deployed database rows were not queried directly during this inspection, and no live assignment was edited to test persistence.

### Repository inspection

The app uses React 18/Vite, an Express API, and PostgreSQL. Authentication and several write flows already exist. The root README's Netlify/static-site guidance and `db/README.md`'s "next backend steps" are outdated; they do not describe the current application accurately.

| Area | Current implementation and gap |
| --- | --- |
| `server/index.mjs` | Authenticated `/api/bootstrap` and writes for jobs, estimates, invoice/timesheet status, and user administration. No planner assignment create/update routes. |
| `server/repository.mjs` | Reads `planner_assignments` joined to equipment/jobs. Maps assignment UUIDs to `plannerJobs.id`; maps rig/job UUIDs to equipment codes/job numbers for display. No assignment write functions. |
| `src/data/AppDataContext.jsx` | Loads bootstrap data and exposes existing write callbacks. No planner mutation callbacks. |
| `src/App.jsx` | Passes jobs, equipment and planner data to `PlannerScreen`, but no staff or assignment save callbacks. |
| `src/screens/PlannerScreen.jsx` | Gantt and month views, equipment conflict detection, date editor and draggable bar edges. Edits only update component-local `jobDates`, keyed by array index. Bootstrap changes reset that local state. The `jobs` prop is currently unused. No assignment creation or crew editing workflow. |
| `src/screens/ResourcesScreen.jsx` | Personnel and leave displays derive from planner data. Personnel membership currently uses `personnel.includes(person.name)`, so it assumes arrays of name strings. This must change if assignment personnel becomes structured references. |
| `db/001_schema.sql` | Existing planner schema and update trigger; see contract below. |
| `db/004_planner_realworld_seed.sql` | Historical April-June 2026 assignments with name-string crew. Some names no longer match the current staff list. This migration deletes/reinserts assignments for selected rigs; do not rerun it to manufacture a current schedule. |
| `server/authorization.mjs` | Existing role helpers and ordering: FieldUser, Maintenance, Supervisor, Administrator, SuperUser. Reuse these for server-side enforcement. |
| `scripts/db-migrate.mjs` | Ordered, checksum-protected SQL migrations tracked in `schema_migrations`. Latest file is currently `013_revoke_existing_sessions.sql`. |
| `scripts/docker-start.mjs` | Runs pending migrations when `DATABASE_URL` is present, then starts the API. Deployment can therefore apply new migrations automatically. |

No development plan or repository `AGENTS.md` was found. The working tree was clean before this documentation change. `package.json` currently has no test or lint script; test coverage must be introduced for the new behaviour rather than described as already present.

## Shared data contract to preserve

`public.planner_assignments` currently contains:

- Permanent assignment UUID `id`.
- `equipment_id` UUID, required; `job_id` UUID, optional.
- `assignment_type`: `job`, `maintenance`, or `downtime`.
- Required `title`, optional client/site display fields, optional `color_hex`.
- Date-only `start_date` and `end_date`, with `end_date >= start_date`.
- `personnel` JSONB array, currently often name strings.
- `is_downtime`, `created_at`, and `updated_at`.

Ops display IDs differ from database IDs: `staff.id` is the employee code while `staff.dbId` is the user UUID; jobs similarly expose job number as `id` and UUID as `dbId`. Resolve and validate UUIDs on the server. Never store employee codes or job numbers in UUID foreign-key columns.

Jobs reads this table directly through its server in `server/repository.mjs`. It requests today through today + 13 days using New Zealand dates, and selects assignments where `end_date >= from` and `start_date <= to`. Its UI enables "My assignments only" by default, based on whether the authenticated user is in the resolved planned crew.

Jobs' personnel resolver supports legacy name strings and objects containing `userId`/`id`, `employeeCode`/`employee_code`, and `displayName`/`name`/`fullName`. It resolves against active `public.app_users`, preferring UUID, then employee code, then normalised name. Prefer writing structured references such as:

```json
[
  {
    "userId": "<app_users UUID>",
    "employeeCode": "<existing employee code>",
    "displayName": "<current full name>"
  }
]
```

Keep legacy reads working. Do not guess that a historical seed name refers to a similarly named current employee. Resolve only unambiguous matches and surface unresolved legacy crew for correction. Update every Ops consumer of personnel, including Gantt labels/tooltips and personnel/leave conflict displays, before switching writes to objects.

Jobs daily logs can reference assignment UUIDs. Edit assignments in place; do not delete and recreate rows to save date or crew changes. Keep job numbers unchanged across Ops, Jobs, Field and CORE-GS.

## Next implementation step

### 1. Assignment API and persistence

- Add authenticated create and update endpoints, for example `POST /api/planner-assignments` and `PATCH /api/planner-assignments/:id`.
- Implement parameterised queries and validation in the repository layer, returning the saved assignment in a consistent format.
- Validate real equipment/job references, valid assignment type, required fields, ISO date-only values, inclusive date ordering, and distinct active crew user IDs. Support a one-day assignment.
- For job assignments require a real job; allow maintenance/downtime without a job. Derive display context from authoritative records where appropriate and keep type/`is_downtime` consistent.
- Enforce permissions on the server and reflect them in the UI. Recommended default: Supervisor and above can plan; lower roles can view. Confirm any different division/region authority requirement rather than inferring it from cosmetic filters.
- Return meaningful 400/401/403/404 errors, and 409 for stale edits. Introduce an atomic concurrency check using a version or validated `updated_at` contract so one planner cannot silently overwrite another's changes.
- Preserve assignment UUIDs and timestamps. Use transactions where a write comprises several related changes.
- Assignment cancellation/deletion semantics are unresolved and are not required for the first create/edit slice. If introduced, define how Jobs excludes cancelled plans and preserves existing log references before implementing them.

### 2. Planner and crew editing

- Wire mutations through `AppDataContext` and `App.jsx` into `PlannerScreen`.
- Add an assignment form for rig, job or downtime context, dates, and crew. Keep the existing Gantt/month layout and filters.
- Default the crew picker to the selected assignment's division and region, with a "Show all users" option. Use active current user accounts; identifiers must be stable even when names change. This follows the user's established preference for the Jobs crew picker and is a recommended Ops default.
- Save changes from both date inputs and completed drag interactions. Do not send a request on every mouse movement.
- Replace array-index edit identity with assignment UUIDs. Refresh/bootstrap reordering must not cause a save to target the wrong assignment.
- Display pending/saved/error states. A failed request must not leave the interface presenting unsaved dates as a successful change.
- Refresh shared data after successful saves so planner, equipment summaries and Personnel agree. Prevent a background refresh from silently discarding an open unsaved editor.
- Replace name-string membership checks with canonical user identity matching, retaining legacy compatibility and labels.

### 3. Conflicts and dates

- Retain existing equipment overlap warnings and add planned crew overlap and approved-leave checks where the available data supports them.
- Recommended initial behaviour: warn clearly and allow an authorised planner to resolve or deliberately retain a conflict; whether conflicts must block saving is an unresolved product choice.
- Scope schedule warnings to the relevant displayed dates, or clearly label historical conflicts, so old overlaps do not imply a current scheduling problem.
- Treat planner dates as New Zealand calendar dates. Avoid UTC conversion that shifts a selected day. Check single-day, boundary-overlap and daylight-saving cases.

## Validation and completion criteria

Use a disposable local/test database for fixtures and write tests. Do not shift old production seed dates or add fake live assignments to make the Jobs list appear populated.

- [ ] A permitted user creates a job assignment with a rig, current dates and real crew.
- [ ] The row survives API restart and full browser reload, retaining the same UUID.
- [ ] Date-input and drag edits persist; crew edits update Personnel and planner labels.
- [ ] Maintenance/downtime and one-day assignments save correctly.
- [ ] Invalid references/dates/crew are rejected; unauthenticated and insufficient-role writes are rejected server-side.
- [ ] Simultaneous/stale edits produce an explicit conflict rather than silently overwriting data.
- [ ] Failed saves preserve recoverable edits and show an actionable error.
- [ ] Legacy string crew and new structured crew both render and match correctly; unresolved names are visible for correction.
- [ ] Equipment, crew and approved-leave overlaps are reported consistently.
- [ ] Jobs using the same test database sees a saved assignment after Refresh when its dates overlap the next 14 days.
- [ ] "My assignments only" shows it for an assigned user, hides it for an unassigned user, and disabling the filter shows it to both.
- [ ] An assignment outside that window is absent. Updating a plan does not rewrite previously recorded actual attendance/log content.
- [ ] `npm run build`, new focused tests and a local API/browser smoke check pass.

The current repo offers these commands:

```bash
npm ci
npm run db:migrate:status
npm run db:migrate
npm run dev:api
npm run dev
npm run build
```

Set `DATABASE_URL` in the API/migration process environment. Use the migration commands against the intended test database only; inspect pending migrations first because the historical files include seed/account changes. Run the API and Vite dev server in separate terminals; Vite proxies `/api` to port 3000. `npm start` runs the API directly; the container entrypoint additionally runs migrations. `node:20-alpine` is currently used by Docker; runtime upgrades are a separate task unless needed for this implementation.

Use a new numbered migration only if needed (currently next is `014_*.sql`; recheck before adding). Never edit applied migration files or replace existing planner data. Verify the migration against an existing database and preserve Jobs' read compatibility.

Before any later production rollout, review the resulting diff, migration effects, database permissions and the shared Jobs contract, then test on staging. This handoff does not authorise a production deployment.

## Subsequent backlog, separate from this step

- Update the root/database README to describe the current Express/PostgreSQL/Coolify deployment rather than static Netlify hosting.
- Replace fixed dashboard greeting/date and other remaining prototype labels with current data.
- Decide assignment cancellation and planner audit-history requirements.
- Implement Ops supervisor review/approval of Jobs daily logs in coordination with Jobs' later MVP steps.
- Review other modules individually for persisted versus display-only actions; the presence of database-backed bootstrap data does not establish that every UI action saves.
