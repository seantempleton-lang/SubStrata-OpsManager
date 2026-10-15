# Next phase: daily work review and project invoicing basis

Priority and authority corrected by the user: 15 October 2026.

## Outcome

Jobs captures the right daily work information and submits it to Ops. The supervisor sees the important information at a glance, edits where necessary and locks the reviewed work into the project for invoicing. Changes may move back and forth between Jobs and Ops within the same increment.

The project collation vision is a matrix with work items down the rows and one individual daily log per column, showing each rig/crew's contribution alongside reviewed totals. Multiple logs on the same date remain separate. This supports an invoice requisition handed to admin for invoice preparation. See [PROJECT_WORK_COLLATION.md](PROJECT_WORK_COLLATION.md) for layout, source traceability, quantity rules and future requisition scope. This can be delivered in a separate chat; current cross-app work should preserve the required source data.

Client-facing daily-log PDFs, signatures and email are nice-to-have follow-up. Preserve existing functions, but their refinement/configuration and final-PDF work do not gate the internal pilot.

Confirmed authority: any Supervisor, Administrator or SuperUser may review any log, including their own, with self-review audited. The supervisor may edit and lock directly without mandatory driller confirmation. Returning to the driller for correction or confirmation remains an optional action. This supersedes the earlier mandatory material-change confirmation rule.

## 15 October implementation result and next sequence

The paired implementation now supports an operational summary, bounded item/daily-note corrections and direct lock-in, followed by a project work matrix. The preserved walkthrough fixture contains a signed Water log, two bores with separate quantities, subcontractor explicit zero, a measurement exception and unchanged activity/attendance; the browser also exercises a separate submitted log through correction, lock, project contribution and Jobs reconciliation. This is local fixture acceptance, not field-user or target-environment acceptance.

- Ops edits existing item quantities, explicit units, descriptions and item notes plus daily notes. A reason is required. Corrections cannot change identities, allocations, crew, times, bore details or add/delete items in this slice. Those editors remain next.
- `correct_and_lock` checks both versions and the original snapshot, creates an immutable supervisor revision, records actor/time/reason/before/after and self-review, updates normalized Jobs item rows and locks atomically. Optional return/correct/resubmit is retained for submitted work. Returning is available after discarding unsaved office edits; this slice does not save office corrections into an outstanding driller request.
- The project matrix totals recorded material/service/subcontractor quantities with exactly matching type/code/description/unit. Measurements/tests are visible exceptions requiring source review. Activity duration is summarized by allocation, never turned into billable hours. Blank cells differ from recorded zero.
- Only the current, matching, approved revision without required driller action contributes. Historical submitted revisions never become extra columns. No reopening or replacement of already locked records is enabled; define invoicing/requisition consequences before that work.
- Jobs shares validation, protects and displays correction metadata, retains queued offline work, and preserves quantity precision via migration 006. Ops requires migration 017 for corrections.

Ops build, 10 unit tests, 17 database integration results and the additional cross-app browser scenario passed; Jobs lint, 40 tests, contract validation and PWA build passed. Docker was restored for a disposable shared PostgreSQL workflow. Full notes, migration/grant requirements and commands are in [OFFICE_REVIEW_IMPLEMENTATION.md](OFFICE_REVIEW_IMPLEMENTATION.md#15-october-bounded-correction-and-project-matrix-increment).

Continue the sequence below for broader shared validation/editor coverage and representative Water/Geotech/ancillary field acceptance. Commercial catalogue mapping, measurement aggregation, project-level adjustments and controlled reopening/requisition freezing need explicit business decisions before implementation. Do not infer billing rules from this operational matrix.

## Historical baseline before this increment

Read-only source inspection on 15 October at Ops `af45f0a` confirms:

- Planner persistence and structured crew assignment are implemented; their deployed state is unverified.
- `src/screens/DailyLogReviewsScreen.jsx` lists submissions and shows attendance, activities, bore progress/details, quantities, comments and existing client output.
- `server/dailyLogReviews.mjs` supports versioned/idempotent approve and return only. Approval locks the current log and records the reviewer; return sends a comment to Jobs.
- Supervisor content editing and project invoice-preparation figures are not implemented by those actions. `src/screens/JobsModule.jsx` has project financial displays but no reviewed-daily-work handoff.
- Jobs supports submission, offline recovery, immutable revisions, returned corrections/resubmission and office-state synchronization. Existing PDF/email functions are supplementary.

See [OFFICE_REVIEW_IMPLEMENTATION.md](OFFICE_REVIEW_IMPLEMENTATION.md) for the shipped first-slice contract and historical local results. No runtime changes, live writes, deployments or fresh cross-app tests were performed during this planning update.

## 1. Pair the field and supervisor walkthroughs

Use a realistic Water or Geotech shift, including two bores, crew changes, activity descriptions/times, materials/services, readings, subcontractor work and exceptions. Check the Jobs inputs and what Ops needs to summarize rather than validating a client PDF as the primary output.

Agree the information needed at a glance: job/rig/owner/shift, attendance, activity totals, bore progress, quantities with units, subcontractor work, comments and exceptions. Retain detail behind the summary. Confirm what belongs under the project for invoice preparation and distinguish actual work from any chargeable classification. Do not invent rates, billing rules or invoice lines from raw log quantities.

Exit: a shared information/review example defines useful Jobs fields, Ops summary layout and project figures. Identify source gaps and adjust the apps together.

## 2. Refine capture and review together

Improve Jobs inputs/validation and Ops summary/detail screens around that example. Preserve job/point/crew attribution, original units, blank versus explicit zero, draft autosave and offline recovery. Make optional client acknowledgement/PDF/email secondary and prevent output problems from obstructing core submission/review.

Keep unresolved submissions visible regardless of age. Verify saved Ops plans and actual Jobs assignment reads separately from historical deployment reports.

Exit: a driller can submit the right information and a supervisor can understand the work without opening a PDF or reconstructing totals manually.

## 3. Supervisor edits and direct lock-in

Define one authoritative edit/lock contract in Ops and reconcile its result in Jobs. Use authenticated roles, permanent log/project IDs, expected server version, exact work revision and idempotent requests. Prevent stale saves and repeat locks from changing the wrong version.

Preserve the original submission and create attributable corrected versions with before/after values, actor, timestamp and reason. Supervisor corrections may include work times, attendance, quantities/units, bore/allocation and descriptions. Check domain constraints on the server; do not simply bypass Jobs validation. Prior client signatures, if any, stay attached to the earlier acknowledged work.

Offer two paths: edit and lock directly, or return with a clear request for correction/confirmation. Requested driller action remains visible until resolved or withdrawn by an audited supervisor decision; it is not mandatory for every material edit. Jobs must receive the resulting state/revision while retaining conflicting offline work for deliberate resolution.

Exit: review/edit/direct-lock and optional return/correct/resubmit work across both apps with role checks, stale/replayed requests, preserved original work and auditable changes.

## 4. Project view and controlled changes after lock

Expose reviewed work and agreed totals under the correct project, linking each figure to its effective locked log/revision. Define how current `approved` relates to project lock-in; reuse or extend it explicitly rather than adding a label that suggests an unimplemented financial transition.

Use the [daily-log contribution matrix vision](PROJECT_WORK_COLLATION.md): item code/description/unit rows, one rig/crew daily log per column with date/shift/log reference, per-log quantities, summary totals and drill-down to source revisions. Preserve multi-bore attribution, compatible units and blank versus zero. Keep recorded actuals, billing adjustments and project-level charges distinguishable. Agree separate requisition selection/locking and admin handoff before implementing the financial boundary.

Only the effective locked version contributes. Draft, returned, superseded and unresolved requested-action work must not be silently included. Reopening/replacement preserves prior versions and must not count both. Before implementing the boundary, define treatment of inputs already used in invoice preparation or an issued invoice.

Lock-in means reviewed work is available for invoice preparation. It does not itself create an invoice, establish charge rates, export to accounting or mean the work has been billed. Those capabilities remain separate scope.

Exit: accepted project figures reconcile to the reviewed source work, revisions cannot duplicate totals, and controlled corrections preserve history and Jobs state.

## 5. Verify and pilot the internal workflow

Verify shared database identity, compatible migrations/grants, Ops plans, CORE-GS reads and Jobs phone HTTPS offline/restart. Test Water/Geotech and ancillary records, cross-midnight work, repeated/stale edit/lock actions, optional driller return, reconnection conflicts and replaced versions in project totals.

Default to meaningful builds and focused tests for the changes in each app, followed by user walkthroughs and feedback through Coolify on the work server. The disposable shared-database/browser scenario has passed for this increment. Repeat local Docker checks only for a specific unresolved migration, transaction or integration question, explaining the purpose beforehand; Docker is not a routine progress gate. Use [the Coolify handoff](COOLIFY_REVIEW_HANDOFF.md) for the next compatible release and user acceptance steps. Record target-environment acceptance separately from local results. Pilot reliability remains two payroll fortnights without lost records or unresolved critical workflow defects.

Exit: accurate field capture → quick review/edit → direct lock or optional driller return → correct project figures, with recovery and attribution demonstrated. Client deliverables are not an exit criterion.

## Optional follow-up

Client signature/PDF presentation, final approved PDFs, Microsoft 365 authorisation, contact defaults and deliberate client delivery. Existing output stays linked to its original revision and email always requires an explicit Send action.

## Decisions needed for implementation

- Exact activity/quantity grouping and units for the review summary and project figures.
- Whether any chargeable/non-chargeable classification is needed in the first slice, distinct from recorded actuals.
- Controlled reopen/replacement behaviour, especially where locked work has already been used in invoicing.
- Displaying assignment division/location alongside recorded job context without rewriting actual work.

These do not reopen the confirmed authority decision: supervisors may edit and lock directly, with optional return for driller correction/confirmation.
