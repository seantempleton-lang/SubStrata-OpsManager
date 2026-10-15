# Project work collation and invoice requisition vision

Recorded: 15 October 2026. An initial operational matrix is implemented locally; commercial mapping and invoice requisition remain planned.

## Initial implementation, 15 October

The project's **Daily work** tab uses `GET /api/projects/:project UUID/daily-work?from=YYYY-MM-DD&to=YYYY-MM-DD` with inclusive NZ shift-start dates. Supervisor-and-higher authority is global. Each current locked log has its own date/shift/rig/owner/crew/reference/revision column; two same-day records remain separate. Row identity is exact recorded item type/code/description/unit, including custom `OTHER` descriptions. This is operational collation, not an agreed commercial catalogue or invoice calculation.

Material/service/subcontractor contributions reconcile to source item IDs and bore segments. Zero is retained; absent contributions stay blank. Measurement/test entries are listed as exceptions for source review; no automatic measurement, bore-depth or billing conversions are defined. Decimal addition avoids binary-addition artefacts. Periods exceeding 250 submitted records require narrowing and return an explicit error, never a silently truncated total.

Selecting a cell reveals underlying entries and opens its immutable revision; headers open the source review. Current `approved` means reviewed work locked for preparation. Only the matching current immutable revision with no required driller action contributes. Supervisor-corrected columns and before/after changes are identified; superseded submissions do not contribute a second time. Saved source decisions require an explicit matrix refresh, and unsaved source reviews block contribution/period switching.

No reopening/replacement after lock, requisition selection/freeze, partial claims, commercial adjustments, rates, invoice finalisation or accounting export is enabled. These remain subject to the decisions below. Local unit/database/browser acceptance passed, including two bores, same-day records, precision, explicit zero and source drill-down; deployed/field acceptance remains outstanding. See [implementation notes](OFFICE_REVIEW_IMPLEMENTATION.md#15-october-bounded-correction-and-project-matrix-increment).

## Purpose

Ops should bring individual Jobs daily logs together in a project-level matrix, so a supervisor can compare contributions, review/correct work and prepare an invoice requisition for the admin team. This builds on the review/edit/direct-lock workflow in [OFFICE_REVIEW_PLAN.md](OFFICE_REVIEW_PLAN.md).

The essential layout is **work items down the rows and individual daily logs across the columns**, alongside project/requisition totals. Each daily-log column represents one rig/crew's submitted work record. It is not merely a calendar date: several rigs, crews or shifts can produce separate logs on the same day. The same rig can contribute several separate records over a period.

This document records a general workflow and layout only. The private reference image, its identifying information and commercial contents are not included or linked.

## Matrix layout

- **Rows:** work-item code, description and explicit unit, grouped into relevant work categories. The item list is extensible and may differ by project and division; no single example defines an exhaustive catalogue.
- **Summary columns:** reviewed quantity for the selected scope; later, authoritative rates, amounts and estimate comparison where those commercial rules are agreed. Operational collation must be usable before pricing integration.
- **Daily-log columns:** date/shift, rig, owner/crew reference, log reference and review/lock status in the header. Include bore/point context where useful; multiple bores remain distinguishable in the underlying record.
- **Cells:** the contribution of that specific log to that work item in the stated unit. Blank/unrecorded is distinct from an explicit zero. An unmapped or incompatible entry is an exception to review rather than a silently omitted quantity.
- **Drill-down:** selecting a column opens the source log/review; selecting a contribution reveals its source entries, bore/allocation and exact revision. A source entry may contribute to more than one billed item only under an explicit agreed mapping, never by accidental duplication.

Keep row labels and log headers readable when scrolling many logs. Provide a selectable date/period and useful rig/status filters while clearly identifying which records contribute to the displayed totals. Detailed interaction design is future work.

## Review and quantities

Keep the original recorded actuals, supervisor-corrected work and any billing adjustment distinguishable. The supervisor can edit and lock directly, or optionally send a log back for driller correction/confirmation. The original submission and changes remain attributable.

Project invoice-preparation totals use the effective locked revision of each included log. Pending/returned/requested-action and superseded records may be visible for review, but must be clearly separated from eligible totals. Do not count both an original and its replacement. Concurrent changes must produce a recoverable version conflict rather than changing a requisition silently.

Aggregate only compatible item identities and units, preserving source mappings. Define explicit conversions where necessary. Do not derive chargeable rig hours, crew-days, lump sums or project allowances merely by adding every recorded duration or occurrence; these need agreed measurement/billing rules. Rates and estimate comparisons come from authoritative project/commercial data when available.

Project-level charges, allowances and adjustments may not originate in a driller's daily log. Provide a separately identifiable supervisor-entered contribution if required, with reason and audit history. Do not fabricate a daily-log source for it or require the crew to enter commercial adjustments.

## Invoice requisition handoff

The intended administrative handoff is a supervisor-reviewed invoice requisition: selected project work, agreed quantities and any authorised commercial adjustments, with links to the contributing daily logs. Admin then prepares the invoice. Locking a daily log, locking a requisition and issuing an invoice are distinct events; their exact implementation must be agreed.

Define how the selected logs/revisions are frozen into a requisition and how additions, corrections, partial claims and already-requisitioned or invoiced work are handled. A later edit must not silently rewrite a handed-off requisition or cause the same work to be charged twice. Pricing, invoice creation and accounting export remain separate implementation scope.

Client-facing daily-log PDFs, signatures and email remain optional follow-up. The collation/requisition view should operate on structured work data without requiring those deliverables.

## Delivery and acceptance

The initial operational matrix is implemented as described above. The next checkpoint is user feedback through the remotely deployed Coolify apps, using [the review handoff](COOLIFY_REVIEW_HANDOFF.md). Broader commercial collation and requisition handoff can follow in a later increment. Preserve stable item/log/project IDs, units, attribution, revisions and review states so those features can use structured sources directly.

1. Agree representative work items and how daily activity/quantity entries map to them, including exceptions and project-level contributions.
2. Validate the existing project matrix with several individual log columns on the user's remote deployment, including two logs on one date, different rigs/crews and a multi-bore log. Verify drill-down and compatible-unit totals; refine the UI from feedback.
3. Extend the existing bounded item/note corrections and direct lock to the remaining shared domain/editor coverage. Retain optional driller return, clear eligibility and effective-version totals.
4. Agree requisition selection, locking and admin handoff, including correction/reuse controls before any financial workflow is enabled.

Acceptance: the supervisor can identify each daily log's contribution, reconcile project totals to the source work, resolve exceptions and hand admin a traceable requisition basis. Changing a source revision cannot silently duplicate work or alter a previously handed-off requisition.
