# Daily log review: first usable slice

## 15 October: bounded correction and project matrix increment

Implemented locally after reading the four Ops plans and inspecting both repositories, with the pre-existing documentation changes preserved. The 14 October slice below is historical; this section supersedes its statements that all supervisor editing and project figures are still future work.

**Ops:** at-a-glance activity durations by exact category/allocation, recorded item totals by exact type/code/description/unit, and source-review exceptions for measurement entries. Supervisor corrections cover existing item quantity, unit, description and notes plus daily notes. Time/crew/bore/allocation editing and item additions/removals are not implemented. Use the optional return path for field corrections outside this bounded editor; no mandatory driller confirmation was added.

`POST /api/daily-log-reviews/:id/actions` also accepts `action: "correct_and_lock"`, a required `comment` reason and `corrections: { notes?: string | null, items?: [{ id, quantity?, unit?, itemLabelSnapshot?, notes? }] }`. IDs and unsupported fields cannot be changed, item IDs must belong to the pinned source, and duplicate patches, invalid quantities/units/descriptions/notes and no-op correction requests are rejected. Both base server version and document revision remain mandatory. Retry identity includes the entire corrections payload and authenticated actor.

One transaction locks the request and record, verifies the original submitted projection, validates the allowed changes with the same portable work-item module used by Jobs, creates immutable revision N+1, updates the normalized Jobs item rows and aggregate, writes the decision and before/after Jobs audit event, and sets `approved`. Actor, timestamp, reason, source/new document revisions, source hash and self-review are retained. Current approval is explicitly reused as work lock-in. Originals, attendance, activities, bore records, signature assets and existing PDFs remain unchanged. A covering signature is removed from corrected work and retained against the earlier revision. Internal corrections create no new client artifact or email; both UIs identify unavailable internal-revision output and allow earlier PDFs to remain available.

**Project:** `GET /api/projects/:id/daily-work` requires global Supervisor authority. Optional `from`/`to` are inclusive NZ shift-start dates. The **Daily work** project tab shows operational material/service/subcontractor item rows and one column for each individual effective locked log, with crew/rig/shift/log reference/revision. Current revision and aggregate content must match, `approved` is required, and outstanding driller action excludes a record. Unreviewed/inconsistent records and measurement/test exceptions are shown separately. Cell drill-down retains entry IDs and bore attribution. Exact identity/unit grouping, explicit zero, absent cells and decimal addition preserve reconciliation. More than 250 matching submitted records returns a narrow-period error. Source-review edits cannot be discarded by selecting a different contribution or period; saved decisions prompt a matrix refresh.

This is not a commercial catalogue or requisition. No activity durations, bore progress or measurements are inferred into invoice lines; no rates, conversions, commercial adjustments, finalisation or accounting export were introduced. Already locked logs cannot be reopened or replaced through this slice. Future replacement/requisition rules must preserve the single effective source and freeze handed-off inputs before those operations are exposed.

### Coordinated Jobs changes and migration requirements

- Ship Jobs migration **006_log_item_quantity_precision.sql** and Ops migration **017_daily_log_corrections.sql** after their existing migrations. 006 removes the `numeric(14,3)` typmod from item quantity: the existing aggregate/schema allow more precision, so child rows must not round accepted captures. It does not backfill or change prior recorded values. Ops 017 extends its review action constraint; it leaves existing history intact. Missing correction prerequisites return 503 before mutation.
- Both apps ship `src/domain/reviewWork.js`; the integration test checks byte-equivalent normalized content. Jobs' draft validation uses the same item constraints as office correction validation. Only the listed item/note fields can change in Ops, so validated timeline/crew/point/identity content cannot be bypassed. Broader correction support must expand shared domain validation first.
- Jobs protects `officeCorrection` as server-owned metadata, accepts its additive schema, displays human-readable before/after changes and retains conflicting queued work. Clean devices receive revision N+1 and its locked state through the existing sync/read path.
- In addition to the grants for the original slice below, the Ops role needs **INSERT on `jobs_app.log_revisions`**, **SELECT on `jobs_app.log_items`**, **UPDATE (`quantity`, `unit`, `item_label_snapshot`, `notes`) on that table**, and **UPDATE (`current_document_revision`, `notes`, `client_acknowledgement`) on `jobs_app.daily_logs`**. It still needs the original workflow-column grants, SELECT on revisions and INSERT on audit events. No child DELETE, signature write, email or accounting privileges are required. Unchanged approve/return requests retain their original limited UPDATE query. Migration credentials require the respective DDL privileges. No deployed grants were changed here.

### Validation and remaining acceptance

**Current testing preference:** Coolify on the work server is the deployment target. Default to local builds and focused tests, then the user's remote walkthrough and feedback. Use local Docker only for a specific unresolved database/migration/transaction/integration question, explaining the purpose beforehand. The completed disposable run below supplied that evidence for this increment and has been removed; it need not be recreated for ordinary progress or documentation changes. See [the current Coolify handoff](COOLIFY_REVIEW_HANDOFF.md) for release prerequisites and the next user walkthrough.

- Ops: build, **10 unit tests**, **17 database integration results** and an **additional browser scenario** passed. The database scenario uses the actual Jobs services, a signed two-bore Water fixture, quantity correction beyond three decimal places, explicit zero, measurement exceptions, role denial, forged metadata, stale/repeated actions, preserved original snapshots/signatures/PDFs and normalized/aggregate/project reconciliation. Existing return/resubmit, self-review, concurrency and planner/Jobs compatibility checks still pass.
- Jobs: lint, **40 unit/domain/IndexedDB tests**, contract validation including a corrected locked aggregate, and PWA build passed. New checks cover strict shared item validation, quantity precision and corrected-version reconciliation while keeping queued work recoverable.
- The browser loads both actual applications on the disposable shared database, corrects an item and locks it with a required reason, opens the immutable original, drills into the project contribution and confirms Jobs receives the corrected locked revision. Browser page-error capture is empty. Screenshots are generated under `test-results/review-browser/` for local inspection.

Run Ops tests/build normally. When a targeted local database rerun is justified, set guarded `TEST_DATABASE_URL` (local database ending `_test`) and `JOBS_REPO_PATH`, migrate Ops to 017, then run `npm run test:integration`. That suite installs the Jobs fixture schema through 006 only in the guarded disposable database. For an optional local browser rerun, first build both apps, install Jobs' Playwright Chromium, then set `REVIEW_BROWSER_TEST=1` and run `node --test test/reviews.integration.test.mjs` (or the complete integration script). The helper uses local Jobs port 38086; it starts/stops its own server and browser. Submitted fixtures are intentionally immutable; discard the disposable database/container after testing. These commands are a reproduction reference, not a requirement to maintain a second local deployment.

Still required: shared constraints/editors for time/attendance/bore/allocation and adding/removing entries; representative Geotech and ancillary correction acceptance; real field-user/phone HTTPS offline/restart and target-environment grants; agreed item catalogue/measurement mapping; controlled reopen/replacement and requisition selection/freeze/reuse decisions. No deployed application, live record or client email was changed. The disposable database/container and local servers were removed after verification.

## 14 October original approve/return implementation

Implemented locally on 14 October 2026. This release covers the Ops inbox and submit → return → correct → resubmit → approve lifecycle. Priority corrected on 15 October: the next slice is supervisor editing/direct lock-in and effective project figures for invoicing, with optional return for driller correction/confirmation. Mandatory material-change confirmation is superseded. Client signatures/PDF/email refinements and final PDFs are optional follow-up. See `OFFICE_REVIEW_PLAN.md` for the revised scope; these next capabilities are not implemented by this release.

## Confirmed authority

The user confirmed that any Supervisor, Administrator or SuperUser may review any submitted log. Region/division controls are display filters. Self-approval is allowed and explicitly recorded in both the review history and Jobs audit events. Field users cannot call the Ops review endpoints.

## Ops behavior and contract

Daily Logs appears in the Ops navigation for Supervisor and higher. The inbox supports status, region/division filters and pagination. Unresolved submissions remain visible regardless of shift age. Detail displays an immutable submitted revision, actual attendance/activities/points/bore details/items, acknowledgement coverage, existing draft PDF and review history. Current assignment context is labelled separately from submitted work.

Endpoints (all require Ops authentication and Supervisor authority):

- `GET /api/daily-log-reviews?status=pending&page=1&region=all&divisions=Water,Geotech`
- `GET /api/daily-log-reviews/:id?revision=1`
- `POST /api/daily-log-reviews/:id/actions`
- `GET /api/daily-log-reviews/:id/revisions/:revision/pdf`

An action requires `requestId` (UUID), `action` (`approve` or `return`), `baseRevision` (aggregate server version), `documentRevision` (exact submitted version), and optional `comment` (required for return, at most 4000 characters). Reviewer identity comes from the authenticated session. A return comment survives failed requests. An interrupted action reuses the same request UUID; changed action content receives a new UUID. Reloading a newer revision explicitly discards the comment.

One transaction serializes the request and log, checks state and both revision tokens, verifies that current work matches the submitted snapshot, increments the aggregate server version, changes workflow state, saves the idempotent result and records the Jobs audit event. Concurrent/stale actions return 409. Reusing a request UUID with different content/actor returns 409. Invalid input returns 400, missing records 404, denied roles 403 and unauthenticated requests 401. Missing submission schemas or database grants produce an actionable error; the rest of Ops can still load.

Approval stores `approvedAt` and locks the record. Return stores the correction comment and marks the record as requiring driller action. Actual attendance/activities/quantities, signature assets and immutable submitted revisions are not rewritten by these actions. Existing draft PDFs remain tied to their original revisions. No review action generates client email.

## Jobs integration

Office transition writes are implemented once in Ops `server/dailyLogReviews.mjs`. The shared database is the integration boundary; Jobs reads the resulting authoritative state using its existing authenticated sync/read endpoints. No actor ID is trusted from another application's request body.

Jobs now displays return comments and approved state. Its draft sync preserves server-owned review metadata and refuses client-driven workflow state changes. Resubmission captures a new immutable document revision. Queued local work is retained during server pulls and rejected/conflicted if it attempts to overwrite an approved or newer record.

The Jobs rolling list includes unresolved workflow states and recently changed older records. A dormant device also fetches its locally pending review records individually when they are absent from that list, so an old approval can reach it before retention runs. PostgreSQL DATE parsing and the API's default 14-day window use New Zealand calendar days.

Jobs changes for this slice: `server/dailyLogs.mjs`, `server/submissions.mjs`, `server/db.mjs`, `server/calendar.mjs`, `server/index.mjs`, `src/foundation/syncManager.js`, `src/foundation/reviewUpdates.js`, `src/components/SubmissionReview.jsx`, the v1 daily-log schema and focused tests. These and the daily-sheet/bore-detail work are committed in the Jobs checkout at `7c50c70` as inspected on 15 October; verify the actual deployed revisions separately.

## Migration and staging release

Ops migration `016_daily_log_review_actions.sql` adds the Ops-owned idempotency/history table. It does not alter existing daily logs or install Jobs tables. Its log UUID is validated against Jobs by the service; every committed review also has a Jobs audit event whose foreign key preserves the log reference.

The shared database must already have Jobs submission migration 004 and the current Jobs migrations required by its code, including 005 for daily bore details. Actual applied state must be checked per environment. Ops needs its migrations through 015 plus 016. The Ops Docker entrypoint applies pending Ops migrations automatically; it does not apply sibling Jobs migrations.

Before staging writes, confirm database identity and least-privilege access. The Ops API role needs usage of `jobs_app`, SELECT on daily logs/revisions/document artifacts, UPDATE on daily-log workflow columns (`status`, `server_revision`, `aggregate`, `updated_at`), INSERT on Jobs audit events, and SELECT/INSERT on its own review-action table. Migration credentials also need the DDL privileges for 016. Existing Jobs grants cover its own persistence; it does not need access to the Ops review-action table. No grants or deployed credentials were changed during local implementation.

Deploy the compatible Jobs update and migrations, then the Ops update with 016, against staging. Confirm a real submitted log returns with a comment, resubmits as a new revision, is approved, and arrives locked in Jobs. Confirm a field account is denied review, self-review is visible, an old pending record remains in the inbox, and a failed/stale action is recoverable. Perform production rollout only after staging acceptance and database backup review.

## Validation results

- Ops: production build, seven unit tests, sixteen integration test results passed.
- Jobs: lint, thirty-three domain/server/IndexedDB tests, contract validation and PWA production build passed.
- Integration exercised the actual Jobs submission service, return/resubmit/approval, concurrent and duplicate actions, role/auth checks, old records, metadata forgery prevention, self-approval, signed rig records, unchanged attendance and draft PDFs, and no email delivery.
- Browser acceptance used a disposable shared database: Ops returned revision 1 with a mandatory comment; Jobs displayed the comment, autosaved a correction and submitted revision 2; Ops reviewed and approved revision 2; Jobs synchronized approval and hid editing/submission controls. Both submitted revisions and their draft PDFs remained available.

Run Ops unit/build checks normally. Full integration requires `TEST_DATABASE_URL` pointing to a disposable local database ending in `_test`, migrated through the current Ops files, and `JOBS_REPO_PATH` pointing to the sibling Jobs repository. Tests apply required Jobs fixtures/migrations only there. Submitted review fixtures are immutable and intentionally remain until the disposable database/container is removed. The Jobs unit suite regenerates its local PDF fixtures.

No production deployment, live daily-log changes or client email sending occurred. The disposable database and local test servers were removed after verification.
