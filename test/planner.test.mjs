import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePlannerInput } from '../server/planner.mjs';
import { nzToday, shiftDate, dateNumber, resolveCrew, hasCrewMember, plannerConflicts, matchesPlannerFilters } from '../src/data/planner.js';

const id = '00000000-0000-4000-8000-000000000001';
const valid = { equipmentId: id, jobId: id, assignmentType: 'job', title: 'Test', start: '2026-09-27', end: '2026-09-27', crewUserIds: [id] };
test('valid one-day assignment, maintenance and downtime; strict validation', () => {
  assert.equal(validatePlannerInput(valid).end, valid.start);
  for (const type of ['maintenance', 'downtime']) assert.equal(validatePlannerInput({ ...valid, assignmentType: type }).jobId, null);
  for (const input of [null, [], { ...valid, equipmentId: 'RIG-01' }, { ...valid, assignmentType: 'leave' },
    { ...valid, jobId: null }, { ...valid, title: ' ' }, { ...valid, start: '2026-02-30' },
    { ...valid, end: '2026-09-26' }, { ...valid, start: '2026-9-27' }, { ...valid, crewUserIds: [id, id] },
    { ...valid, crewUserIds: ['EMP-001'] }, { ...valid, color: 'red' },
    { ...valid, division: 'Operations' }, { ...valid, division: null }, { ...valid, region: 'East' }, { ...valid, region: '' }]) {
    assert.throws(() => validatePlannerInput(input), { statusCode: 400 });
  }
  for (const version of [undefined, '1', 0, 1.5]) assert.throws(() => validatePlannerInput({ ...valid, version }, true), { statusCode: 400 });
  assert.equal(validatePlannerInput({ ...valid, version: 1 }, true).version, 1);
  assert.equal(validatePlannerInput({ ...valid, division: 'Geotech', region: 'South' }).division, 'Geotech');
});
test('assignment filters use the saved division/location context', () => {
  const context = { division: 'Geotech', region: 'South' };
  assert.equal(matchesPlannerFilters(context, 'South', { Geotech: true, Water: false }), true);
  assert.equal(matchesPlannerFilters(context, 'North', { Geotech: true, Water: true }), false);
  assert.equal(matchesPlannerFilters(context, 'all', { Geotech: false, Water: true }), false);
});
test('New Zealand calendar days across midnight and DST', () => {
  assert.equal(nzToday(new Date('2026-09-26T13:00:00Z')), '2026-09-27');
  assert.equal(shiftDate('2026-09-27', 1), '2026-09-28');
  assert.equal(shiftDate('2026-04-05', -1), '2026-04-04');
  assert.equal(dateNumber('2026-09-28') - dateNumber('2026-09-27'), 1);
});
const staff = [{ dbId: id, id: 'EMP-1', name: 'Current Name' }, { dbId: 'two', id: 'EMP-2', name: 'Duplicate' }, { dbId: 'three', id: 'EMP-3', name: 'Duplicate' }];
test('crew identity survives rename; only unambiguous legacy names resolve', () => {
  const refs = resolveCrew([{ userId: id, displayName: 'Old Name' }, ' current name ', 'Duplicate', 'Historic Name', { userId: 'deleted', displayName: 'Current Name' }, { employee_code: 'emp-1', name: 'Old Name' }], staff);
  assert.deepEqual(refs.map(r => r.person?.dbId || null), [id, id, null, null, null, id]);
  assert.equal(hasCrewMember({ personnel: [{ userId: id }] }, staff[0], staff), true);
  assert.equal(refs[3].label, 'Historic Name');
});
test('inclusive equipment, crew and approved-leave warnings scoped to displayed dates', () => {
  const a = { id: 'a', rigId: 'R1', jobId: 'J1', start: '2026-09-27', end: '2026-09-27', personnel: [{ userId: id }] };
  const b = { ...a, id: 'b', jobId: 'J2', end: '2026-09-28', personnel: ['Current Name'] };
  const leave = [{ userId: 'EMP-1', status: 'approved', start: a.start, end: a.end }, { userId: 'EMP-1', status: 'pending', start: a.start, end: a.end }];
  assert.equal(plannerConflicts([a, b], staff, leave, a.start, b.end).length, 4);
  assert.equal(plannerConflicts([a, b], staff, leave, '2026-10-01', '2026-10-31').length, 0);
  assert.equal(plannerConflicts([a, { ...b, rigId: 'R2' }], staff, [], a.start, b.end).length, 1);
});
