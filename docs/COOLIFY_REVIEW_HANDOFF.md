# Daily-work review: Coolify handoff and next steps

Updated: 15 October 2026. These are instructions for the next user-managed release and walkthrough; no remote deployment, push, server migration or live-record change has been performed by this documentation update.

## Development and verification approach

Coolify on the work server is the deployment target for Ops and Jobs. Use local builds and focused tests by default, then use the user's remote walkthrough and feedback to guide the next increment. Local Docker is optional for a specific unresolved migration/database/transaction/integration question; explain its purpose before starting it. It is not a routine prerequisite to continuing development or requesting feedback.

The completed local database run specifically verified shared-schema migrations, immutable corrected revisions, atomic/replayed/stale actions, quantity precision and Jobs/Ops/project reconciliation. Its disposable container/database and local servers were removed. Results remain recorded in [OFFICE_REVIEW_IMPLEMENTATION.md](OFFICE_REVIEW_IMPLEMENTATION.md); no repeat container run is needed for this documentation change.

## Current deliverable

- Ops: work summaries, correction of existing item quantities/units/descriptions/notes and daily notes, required correction reason, direct lock and attributable immutable before/after revisions. Optional return/correct/resubmit remains available.
- Project Daily work: separate log columns with date/shift/rig/crew/reference, exact recorded item identity/unit totals, explicit zero, excluded work/measurement exceptions and source-entry/revision drill-down. Only the matching effective locked revision contributes.
- Jobs: shared item validation, server-owned correction metadata, corrected revision display/synchronization and preservation of captured item precision.

Local checks already passed: Ops build, 10 unit tests, 17 database integration results plus the actual-app browser scenario; Jobs lint, 40 tests, contracts and PWA build. These results do not establish deployed acceptance.

## Next user-managed Coolify release

1. Ensure the compatible source changes from **both repositories** are available on the branches configured in Coolify. The changes were left in the working trees; local implementation does not establish that they have been committed, pushed or deployed. Preserve the existing documentation and other uncommitted work when preparing a release.
2. Confirm both configured applications use the intended shared PostgreSQL database. Retain their working domains, authentication and runtime configuration. Jobs requires its migrations through **006_log_item_quantity_precision.sql**; Ops requires its migrations through **017_daily_log_corrections.sql**.
3. Follow the existing migration/startup arrangement: Jobs' container startup runs pending migrations unless `RUN_MIGRATIONS=false`, using the migration connection when configured; Ops' container startup runs pending Ops migrations when `DATABASE_URL` is present. Neither app applies the sibling repository's migrations. The migration role must have the required DDL privileges, and Ops' runtime role needs the additional revision INSERT, item SELECT/limited UPDATE and daily-log-column UPDATE privileges documented in [the implementation notes](OFFICE_REVIEW_IMPLEMENTATION.md#coordinated-jobs-changes-and-migration-requirements).
4. Deploy the compatible Jobs update and its migration before enabling the new Ops correction workflow, then deploy Ops and verify its migration/startup results. Check the actual deployed revisions and application health. A successful build alone does not confirm migrations or runtime grants.
5. Reload the apps to load the new bundles. Preserve device storage containing unsynced work. Use a user-selected test project/records for the walkthrough below; local fixture log IDs and accounts are not remote deployment data.

This handoff does not require setting up a new remote environment or replacing the existing Coolify configuration. Jobs' detailed settings remain in its `docs/COOLIFY_DEPLOYMENT.md`. Client email and signature/PDF refinement are optional and are not required for this walkthrough.

## User walkthrough and useful feedback

1. In Jobs, complete and submit a representative shift with crew, activities/descriptions, two bores and quantities with explicit units. Include an explicit zero and a measurement/test entry. A client signature is optional.
2. As a Supervisor or higher in Ops, open Daily Logs and check whether the summary is useful at a glance. Correct an existing item or daily note, enter a reason and select **Correct and lock**. Confirm the original revision and before/after history remain available. This release does not edit times, crew, bores, allocations or add/remove items in Ops.
3. Open the project's **Daily work** tab. Check separate columns for multiple logs on the same date, including different rigs/crews where available. Reconcile a contribution to its source entries/bore/revision. Check blank versus zero, measurement exceptions and that pending/returned work is excluded. If a source review is saved from this view, refresh the matrix when prompted.
4. Sync Jobs and confirm the corrected locked revision and reason appear. Separately exercise **Return for correction / confirmation**, owner correction and resubmission on a suitable submitted test record. Already locked records cannot be reopened through this increment.
5. Report the app/screen, log reference/revision, expected versus actual result and any visible error. For server errors, the relevant Coolify application log or migration/grant error is useful; exclude credentials. Note unclear labels, missing data, excessive steps and item/unit groupings that need changing. Phone offline/restart acceptance can follow on a valid HTTPS origin.

## Subsequent development

Use feedback to refine capture/review and extend the shared validation and editors to times, attendance, bore/progress/allocation and item additions/removals. Agree commercial item mapping and measurement treatment before promoting raw recorded quantities into requisition quantities. Define controlled reopening/replacement and requisition selection/freeze/reuse, including already-invoiced work, before exposing those operations. Pricing, commercial adjustments, requisition finalisation and accounting integration remain outside this increment; do not invent rates or billing rules.
