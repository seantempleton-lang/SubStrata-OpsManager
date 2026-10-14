# Next phase: supervisor review of Jobs daily logs

Agreed priority: supervisor review and approval of Jobs daily logs. Plan prepared on 14 October 2026. This update records the plan; no deployment, live record changes or client email sending were performed.

## Current implementation progress

The first usable inbox/approve/return/resubmit slice is implemented and locally verified. See [implementation and release notes](OFFICE_REVIEW_IMPLEMENTATION.md). Environment rollout/submission acceptance still requires staging verification. The next implementation slice is material supervisor corrections and driller confirmation; reopening and final PDFs follow it.

Confirmed decisions: any Supervisor, Administrator or SuperUser may review any log; self-approval is permitted and explicitly audited. Display filters do not restrict authority.

## Starting position at planning (historical)

- Ops planner persistence, current-user crew selection, and selectable assignment division/location are implemented and committed. The latest inspected commit is `aed4093` on `main`. The deployment of that exact build and migration 015 has not been verified in this chat.
- Planner local validation passed: build, five unit tests, eight integration test results, and browser smoke checks. Jobs compatibility was tested against the actual reader using a disposable database.
- Jobs Step 5 (submission, immutable revisions, signatures, draft PDFs and deliberate email delivery) is implemented locally. Its production configuration and staging acceptance remain outstanding. Inspect its current repository before assuming the deployed service includes all of Step 5.
- Jobs exposes a Supervisor-only, read-only office log endpoint. Approve/return/correct/reopen routes and an Ops review inbox are the next workflow work.
- The existing office list uses a 14-day window and keeps older draft/returned/reopened records, but can omit older submitted records. A pending-review inbox must retain unresolved submissions regardless of age.

Source references: Ops `docs/PLANNER_PERSISTENCE.md`; sibling Jobs `docs/MVP_SPEC.md`, `PROJECT_DEVELOPMENT.md`, `server/dailyLogs.mjs`, `server/submissions.mjs`, and `db/004_submission_output.sql`. The Jobs MVP calls office review **Step 6**; submission/client output is **Step 5**.

## 1. Close planner rollout and submission acceptance

Confirm the latest Ops build is running, migrations 014/015 are recorded, and Ops/Jobs use the intended shared database. In staging, verify a current assignment with real user identities, division/location edits, reload, Jobs Refresh and My assignments filtering. Confirm changing a plan preserves existing daily logs and attendance.

Verify a completed Jobs log can submit an immutable revision and generate its draft PDF. Confirm which Step 5 migrations, signature configuration and document storage are deployed. Mailbox/contact configuration is needed for deliberate email delivery, but should not delay independent review-inbox development. Do not send email as part of acceptance without explicit authorization for the recipient and purpose.

**Exit:** deployment/configuration evidence is recorded, and an actual submitted revision is available to review in staging. Continue local review development with disposable fixtures while environment checks are outstanding.

## 2. Agree and implement the review contract

Ops owns the supervisor screens and review authority. Jobs retains ownership of daily-log aggregates, immutable document revisions, actual attendance, signatures and document artifacts. Implement state-transition rules once and exercise them across both repositories. Choose the API/module boundary after inspecting current authentication and database grants; do not copy independent SQL workflows into both applications or forward an unauthenticated actor ID between services.

Define the transition contract around permanent log UUIDs, expected aggregate server revision, exact document revision, authenticated reviewer, action, reason/comment and idempotency key. A transition must validate role/state/version and atomically record its result and audit event. A stale action must return a recoverable conflict. Synchronization revision and document revision remain separate values.

Proposed authority follows current roles: Supervisor, Administrator and SuperUser can review; field users can act on their own returned records and confirmation requests. Any job/region-specific reviewer restriction needs an explicit product decision before those restrictions are implemented.

**Exit:** allowed transitions, error responses, schema changes and cross-app synchronization behavior are documented and covered by focused tests. Applied migrations remain unchanged.

## 3. First usable slice: inbox, detail, approve and return

Add a Daily Logs review screen in Ops with pending/reviewed states, job, rig, owner, division, shift dates and filters. Pending work must remain visible beyond the Jobs 14-day assignment/device window.

Detail shows the exact submitted revision, actual crew attendance, activity timeline, point progress, quantities, acknowledgement/signature coverage and draft PDF. Mark assignment context and actual log context clearly where they differ.

Support two explicit actions:

- **Approve:** approve and lock the exact revision the supervisor reviewed, recording who and when.
- **Return:** require a correction comment; expose it to the owner in Jobs. Owner edits and resubmission create a new immutable document revision and preserve the original.

Jobs must receive office state changes on refresh/sync, retaining unsynced local work for explicit conflict recovery. Offline retries must not overwrite submitted/approved content or duplicate review actions. Start with approve/return; keep supervisor content editing disabled until the next slice is complete.

**Exit:** driller submits → supervisor returns → driller corrects/resubmits → supervisor approves, with matching states in Ops and Jobs and complete revision/audit history. Cover unauthorized users, stale reviewers, duplicate retries and old pending submissions.

## 4. Corrections and driller confirmation

Distinguish administrative notes/presentation changes from material changes to times, attendance, quantities, points, work descriptions or allocations. Preserve before/after revisions and attributable audit events.

Material corrections create an awaiting-confirmation state. The owner can accept or reject them in Jobs; approval remains blocked while confirmation is unresolved. Signatures stay attached to the originally acknowledged revision and cannot be edited by supervisors. Administrative changes must not become a route around material-change confirmation.

**Exit:** accepted and rejected correction scenarios work through offline refresh/sync, without silently altering signed or approved revisions.

## 5. Reopen, final PDF and pilot

Allow authorized reopening only with a mandatory reason. Preserve the previous approved revision and begin a new review cycle. Generate a final PDF for the approved revision, excluding internal notes, payroll codes and audit details. Preserve the earlier draft artifact and explicit delivery history; approval/PDF generation never sends email automatically.

Pilot the full lifecycle with Water and Geotech users, a rig log and an ancillary record, a cross-midnight shift, absent coverage, duplicate retries, stale review actions and signed material corrections. Ancillary records remain internal and do not acquire client-PDF/signature functions.

**Exit:** role/transition tests, real-Postgres integration, builds and both-app browser checks pass; staging acceptance is recorded before production rollout. Track field pilot reliability against the Jobs MVP's two-payroll-fortnight acceptance target.

## Decisions to settle before the relevant slice

- How Jobs should display selectable assignment division/location alongside the authoritative job context; changing an Ops plan currently does not change the job's division.
- Which administrative edits are permitted without owner confirmation; use the existing Jobs MVP categories as the baseline.

Independent inbox, contract and test preparation can proceed while these product decisions are being settled.

## Follow-on backlog

After the review slice: planner cancellation and change history; catalogue administration; client contact selection for deliberate PDF delivery; audit other Ops write paths; replace fixed dashboard labels; update root/database deployment documentation. Payroll export, invoicing integration and wider CORE-GS integration follow a validated review lifecycle.
