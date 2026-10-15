import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReviewRequest, reviewContent } from '../server/dailyLogReviews.mjs';
import { applyWorkCorrections } from '../src/domain/reviewWork.js';
import { summarizeWork, addQuantity, formatQuantity } from '../src/domain/dailyWork.js';
import { collateProjectWork } from '../server/projectDailyWork.mjs';
const id = '31eb28f2-0bf1-4cee-813c-075f0436b5e7';
const body = { requestId: id, action: 'approve', baseRevision: 4, documentRevision: 2 };
test('review commands pin both revisions and require a return comment', () => {
  assert.equal(validateReviewRequest(id, body).comment, null);
  assert.equal(validateReviewRequest(id, { ...body, action: 'return', comment: '  Correct attendance  ' }).comment, 'Correct attendance');
  for (const invalid of [{ ...body, requestId: 'bad' }, { ...body, baseRevision: 0 }, { ...body, baseRevision: '4' },
    { ...body, documentRevision: 0 }, { ...body, action: 'delete' }, { ...body, action: 'return', comment: ' ' },
    { ...body, comment: {} }]) assert.throws(() => validateReviewRequest(id, invalid), { statusCode: 400 });
});
test('reviewed work excludes server decision metadata but retains nested point details', () => {
  const log = { id, logType: 'rig_shift', points: [{ dailyDetails: { groundwater: 4 } }], crew: [{ displayNameSnapshot: 'Crew' }] };
  assert.deepEqual(reviewContent({ ...log, officeReview: { comment: 'Internal' }, approvedAt: 'timestamp', status: 'approved' }), reviewContent(log));
  assert.notDeepEqual(reviewContent({ ...log, crew: [] }), reviewContent(log));
});
const item = { id, itemType: 'material', itemCode: 'OTHER', itemLabelSnapshot: 'Cement', quantity: 2, unit: 'bag', notes: null };
test('bounded corrections preserve identities, explicit zero and before/after; reject invalid work and field injection', () => {
  const source = { notes: null, items: [item], points: [{ id: 'bore-a' }] };
  const { log, changes } = applyWorkCorrections(source, { items: [{ id, quantity: 0 }] });
  assert.equal(log.items[0].quantity, 0); assert.equal(source.items[0].quantity, 2);
  assert.deepEqual(changes, [{ path: `items/${id}/quantity`, before: 2, after: 0 }]);
  assert.deepEqual(log.points, source.points);
  for (const invalid of [{ items: [{ id, quantity: -1 }] }, { items: [{ id, quantity: '' }] }, { items: [{ id, unit: ' ' }] },
    { items: [{ id, itemLabelSnapshot: null }] }, { items: [{ id, itemCode: 'PRICE' }] }, { items: [{ id, pointSegmentId: 'other' }] },
    { items: [{ id: 'unknown', quantity: 1 }] }, { items: [{ id, quantity: 3 }, { id, quantity: 4 }] }, { notes: {} }, { crew: [] }, {}, { items: [{ id, notes: 3 }] }]) {
    assert.throws(() => applyWorkCorrections(source, invalid), { statusCode: 400 });
  }
  assert.throws(() => validateReviewRequest(id, { ...body, corrections: {} }), { statusCode: 400 });
  assert.throws(() => validateReviewRequest(id, { ...body, action: 'correct_and_lock', corrections: { notes: 'Correction' } }), { statusCode: 400 });
});
test('operational summaries separate descriptions, units and allocations and flag readings', () => {
  assert.equal(addQuantity(0.1, 0.2), 0.3);
  assert.equal(addQuantity(1e-7, 1e-8), 1.1e-7);
  assert.notEqual(formatQuantity(1e-13), '0');
  const summary = summarizeWork({ items: [item, { ...item, id: 'zero', quantity: 0 }, { ...item, unit: 'kg' }, { ...item, itemLabelSnapshot: 'Backfill' }, { ...item, itemType: 'measurement' }],
    activities: [{ activityCode: 'DRILL', activityLabelSnapshot: 'Drilling', startedAt: '2026-10-14T10:00:00Z', endedAt: '2026-10-14T11:00:00Z', allocation: { type: 'job', jobNumber: 'A' } },
      { activityCode: 'DRILL', activityLabelSnapshot: 'Drilling', startedAt: '2026-10-14T11:00:00Z', endedAt: '2026-10-14T12:00:00Z', allocation: { type: 'ancillary', ancillaryCode: 'WORKSHOP' } }] });
  assert.equal(summary.items.length, 3); assert.equal(summary.items[0].quantity, 2); assert.equal(summary.items[0].entries.length, 2);
  assert.equal(summary.activities.length, 2); assert.equal(summary.activities[0].minutes, 60); assert.equal(summary.exceptions.length, 1);
});
test('matrix keeps same-day logs separate, preserves blank/zero and excludes unreviewed or mismatched revisions', () => {
  const snapshot = { id, notes: null, items: [item], shift: { startedAt: '2026-10-14T10:00:00Z', label: 'night' }, equipment: { equipmentCode: 'RIG-1' }, owner: { displayName: 'Driller' }, crew: [], points: [] };
  const record = { id, status: 'approved', revision: 2, snapshot, aggregate: { ...snapshot, officeReview: { documentRevision: 2 }, requiresDrillerAction: false } };
  const zero = { ...snapshot, items: [{ ...item, quantity: 0 }] }, other = { ...snapshot, items: [{ ...item, unit: 'kg' }] };
  const matrix = collateProjectWork([record, { ...record, id: 'same-day', snapshot: zero, aggregate: { ...zero, officeReview: { documentRevision: 2 } } },
    { ...record, id: 'unit-split', snapshot: other, aggregate: { ...other, officeReview: { documentRevision: 2 } } },
    { ...record, id: 'returned', status: 'returned' }, { ...record, id: 'action', aggregate: { ...record.aggregate, requiresDrillerAction: true } },
    { ...record, id: 'old', aggregate: { ...record.aggregate, officeReview: { documentRevision: 1 } } },
    { ...record, id: 'mismatch', aggregate: { ...record.aggregate, notes: 'Unsaved work' } }]);
  assert.equal(matrix.columns.length, 3); assert.equal(matrix.rows.length, 2); assert.equal(matrix.rows[0].total, 2);
  assert.equal(matrix.rows[0].contributions['same-day'].quantity, 0); assert.equal(matrix.rows[0].contributions['unit-split'], undefined);
  assert.equal(matrix.excluded.length, 4);
});
