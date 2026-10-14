import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReviewRequest, reviewContent } from '../server/dailyLogReviews.mjs';
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
