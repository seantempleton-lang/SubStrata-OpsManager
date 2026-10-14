# Daily log review: first usable slice

Implemented locally on 14 October 2026. This release covers the Ops inbox and the complete submit → return → correct → resubmit → approve lifecycle. Supervisor content corrections, driller confirmation requests, reopening and final PDFs remain later slices in `OFFICE_REVIEW_PLAN.md`.

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

Jobs changes for this slice: `server/dailyLogs.mjs`, `server/submissions.mjs`, `server/db.mjs`, `server/calendar.mjs`, `server/index.mjs`, `src/foundation/syncManager.js`, `src/foundation/reviewUpdates.js`, `src/components/SubmissionReview.jsx`, the v1 daily-log schema and focused tests. Existing daily-sheet/bore-detail work was present before this slice and remains in the Jobs working tree; review the combined release before pushing.

## Migration and staging release

Ops migration `016_daily_log_review_actions.sql` adds the Ops-owned idempotency/history table. It does not alter existing daily logs or install Jobs tables. Its log UUID is validated against Jobs by the service; every committed review also has a Jobs audit event whose foreign key preserves the log reference.

The shared database must already have the Jobs submission migration 004 and the current Jobs migrations required by its code. In the inspected sibling checkout, daily-sheet work also requires its pending migration 005. Ops needs its existing migrations through 015 plus 016. The Ops Docker entrypoint applies pending Ops migrations automatically; it does not apply sibling Jobs migrations.

Before staging writes, confirm database identity and least-privilege access. The Ops API role needs usage of `jobs_app`, SELECT on daily logs/revisions/document artifacts, UPDATE on daily-log workflow columns (`status`, `server_revision`, `aggregate`, `updated_at`), INSERT on Jobs audit events, and SELECT/INSERT on its own review-action table. Migration credentials also need the DDL privileges for 016. Existing Jobs grants cover its own persistence; it does not need access to the Ops review-action table. No grants or deployed credentials were changed during local implementation.

Deploy the compatible Jobs update and migrations, then the Ops update with 016, against staging. Confirm a real submitted log returns with a comment, resubmits as a new revision, is approved, and arrives locked in Jobs. Confirm a field account is denied review, self-review is visible, an old pending record remains in the inbox, and a failed/stale action is recoverable. Perform production rollout only after staging acceptance and database backup review.

## Validation results

- Ops: production build, seven unit tests, sixteen integration test results passed.
- Jobs: lint, thirty-three domain/server/IndexedDB tests, contract validation and PWA production build passed.
- Integration exercised the actual Jobs submission service, return/resubmit/approval, concurrent and duplicate actions, role/auth checks, old records, metadata forgery prevention, self-approval, signed rig records, unchanged attendance and draft PDFs, and no email delivery.
- Browser acceptance used a disposable shared database: Ops returned revision 1 with a mandatory comment; Jobs displayed the comment, autosaved a correction and submitted revision 2; Ops reviewed and approved revision 2; Jobs synchronized approval and hid editing/submission controls. Both submitted revisions and their draft PDFs remained available.

Run Ops unit/build checks normally. Full integration requires `TEST_DATABASE_URL` pointing to a disposable local database ending in `_test`, migrated through the current Ops files, and `JOBS_REPO_PATH` pointing to the sibling Jobs repository. Tests apply required Jobs fixtures/migrations only there. Submitted review fixtures are immutable and intentionally remain until the disposable database/container is removed. The Jobs unit suite regenerates its local PDF fixtures.

No production deployment, live daily-log changes or client email sending occurred. The disposable database and local test servers were removed after verification.
