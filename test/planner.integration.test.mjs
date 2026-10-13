import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { once } from 'node:events';
import { useTestDatabase, createFixture } from './fixture.mjs';
import { nzToday, shiftDate } from '../src/data/planner.js';

useTestDatabase();
const { pool } = await import('../server/db.mjs');
const { savePlannerAssignment } = await import('../server/planner.mjs');
let api;
async function startApi() {
  api = spawn(process.execPath, ['server/index.mjs'], { env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const output = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('API startup timed out')), 10000);
    api.stdout.on('data', chunk => { const match = String(chunk).match(/port (\d+)/); if (match) { clearTimeout(timer); resolve(match[1]); } });
    api.once('error', reject);
    api.once('exit', code => { clearTimeout(timer); reject(new Error(`API exited ${code}`)); });
  });
  return `http://127.0.0.1:${output}`;
}
async function stopApi() { if (api && api.exitCode === null) { const exited = once(api, 'exit'); api.kill(); await exited; } }

test('persisted API assignments, permissions, atomic conflicts and Jobs compatibility', async t => {
  const f = await createFixture(pool);
  const planner = { dbId: f.users[0].id, appRole: 'Supervisor' };
  const input = { equipmentId: f.rig.id, jobId: f.job.id, assignmentType: 'job', title: 'Local persistence test', start: nzToday(), end: nzToday(), crewUserIds: [f.users[1].id] };
  let jobsPool;
  t.after(async () => { await stopApi(); await jobsPool?.end(); await f.cleanup(); await pool.end(); });
  let base = await startApi();
  const token = randomUUID();
  const account = (await pool.query(`insert into app_auth_accounts(user_id,login_email,password_hash) values ($1,$2,'test-only') returning id`, [planner.dbId, `${randomUUID()}@fixture.invalid`])).rows[0];
  await pool.query(`insert into app_sessions(account_id,session_token_hash,expires_at) values ($1,$2,now()+interval '1 hour')`, [account.id, createHash('sha256').update(token).digest('hex')]);
  const request = (route, method, body, authenticated = true) => fetch(`${base}${route}`, { method, headers: { 'Content-Type': 'application/json', ...(authenticated ? { Cookie: `substrata_session=${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let saved;
  await t.test('401 unauthenticated, 403 below Supervisor, invalid references and inactive crew', async () => {
    assert.equal((await request('/api/planner-assignments', 'POST', input, false)).status, 401);
    await pool.query("update app_users set app_role='FieldUser' where id=$1", [planner.dbId]);
    assert.equal((await request('/api/planner-assignments', 'POST', input)).status, 403);
    await pool.query("update app_users set app_role='Supervisor' where id=$1", [planner.dbId]);
    for (const body of [{ ...input, jobId: randomUUID() }, { ...input, equipmentId: randomUUID() }, { ...input, crewUserIds: [f.users[2].id] }, { ...input, start: '2026-02-30' }]) assert.equal((await request('/api/planner-assignments', 'POST', body)).status, 400);
  });
  await t.test('create survives API restart and bootstrap reload with UUID and one-day dates', async () => {
    const result = await request('/api/planner-assignments', 'POST', input);
    assert.equal(result.status, 201); saved = await result.json();
    assert.equal(saved.start, input.start); assert.equal(saved.end, input.start);
    assert.deepEqual(saved.personnel, [{ userId: f.users[1].id, employeeCode: f.users[1].employee_code, displayName: f.users[1].full_name }]);
    assert.equal(saved.client, 'Fixture Client'); assert.equal(saved.version, 1);
    await stopApi(); base = await startApi();
    const boot = await (await request('/api/bootstrap', 'GET')).json();
    assert.deepEqual(boot.plannerJobs.find(a => a.id === saved.id), saved);
    assert.equal((await request(`/api/planner-assignments/${randomUUID()}`, 'PATCH', { ...input, version: 1 })).status, 404);
  });
  await t.test('simultaneous edits: one wins, one gets 409; UUID and createdAt retained', async () => {
    const results = await Promise.all([request(`/api/planner-assignments/${saved.id}`, 'PATCH', { ...input, version: 1, end: shiftDate(input.end, 1) }), request(`/api/planner-assignments/${saved.id}`, 'PATCH', { ...input, version: 1, end: shiftDate(input.end, 2) })]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
    const next = await results.find(r => r.status === 200).json();
    assert.equal(next.id, saved.id); assert.equal(next.createdAt, saved.createdAt); assert.equal(next.version, 2); saved = next;
    assert.equal((await request(`/api/planner-assignments/${saved.id}`, 'PATCH', { ...input, version: 1 })).status, 409);
  });
  await t.test('maintenance and downtime can be single-day without job', async () => {
    for (const type of ['maintenance', 'downtime']) {
      const a = await savePlannerAssignment(null, { ...input, assignmentType: type, jobId: null, crewUserIds: [] }, planner);
      assert.equal(a.isDowntime, true); assert.equal(a.jobDbId, null);
    }
  });
  await t.test('legacy names preserved on read; version increments for external edits', async () => {
    await pool.query('update planner_assignments set personnel=$1::jsonb where id=$2', [JSON.stringify(['Historic Unresolved']), saved.id]);
    const boot = await (await request('/api/bootstrap', 'GET')).json();
    assert.deepEqual(boot.plannerJobs.find(a => a.id === saved.id).personnel, ['Historic Unresolved']);
    saved = await savePlannerAssignment(saved.id, { ...input, version: saved.version + 1 }, planner);
  });
  await t.test('selectable division/location persist independently; legacy defaults and omitted fields remain compatible', async () => {
    // A legacy plan with a rig in a different context must still default to its job.
    await pool.query("update equipment set division='Geotech', region='North' where id=$1", [f.rig.id]);
    await pool.query('update planner_assignments set division=null, region=null where id=$1', [saved.id]);
    let boot = await (await request('/api/bootstrap', 'GET')).json();
    saved = boot.plannerJobs.find(a => a.id === saved.id);
    assert.equal(saved.division, 'Water'); assert.equal(saved.region, 'South');
    for (const invalid of [{ division: 'Operations' }, { region: 'East' }]) {
      assert.equal((await request(`/api/planner-assignments/${saved.id}`, 'PATCH', { ...input, version: saved.version, ...invalid })).status, 400);
    }
    saved = await savePlannerAssignment(saved.id, { ...input, version: saved.version, division: 'Geotech', region: 'North' }, planner);
    await stopApi(); base = await startApi();
    boot = await (await request('/api/bootstrap', 'GET')).json();
    assert.equal(boot.plannerJobs.find(a => a.id === saved.id).division, 'Geotech');
    assert.equal(boot.plannerJobs.find(a => a.id === saved.id).region, 'North');
    saved = await savePlannerAssignment(saved.id, { ...input, version: saved.version }, planner);
    assert.equal(saved.division, 'Geotech'); assert.equal(saved.region, 'North');
    const row = (await pool.query('select division,region from jobs where id=$1', [f.job.id])).rows[0];
    assert.deepEqual(row, { division: 'Water', region: 'South' });
    const nonJob = await savePlannerAssignment(null, { ...input, assignmentType: 'maintenance', jobId: null, division: 'Water', region: 'South' }, planner);
    assert.equal(nonJob.division, 'Water'); assert.equal(nonJob.region, 'South');
  });
  await t.test('actual Jobs reader: window, My assignments, crew edits and attendance separation', { skip: !process.env.JOBS_REPO_PATH && 'Set JOBS_REPO_PATH to run the sibling Jobs reader.' }, async () => {
    const root = process.env.JOBS_REPO_PATH;
    const jobsDb = await import(pathToFileURL(path.join(root, 'server/db.mjs'))); jobsPool = jobsDb.pool;
    if (!(await pool.query("select to_regclass('jobs_app.daily_logs') as t")).rows[0].t) {
      for (const name of ['001_jobs_foundation.sql', '002_core_daily_logs.sql', '003_field_workflow.sql']) await pool.query(await readFile(path.join(root, 'db', name), 'utf8'));
    }
    const { getBootstrap } = await import(pathToFileURL(path.join(root, 'server/repository.mjs')));
    const reader = (userId, myAssignmentsOnly) => getBootstrap({ user: { userId, appRole: 'FieldUser' }, from: input.start, to: shiftDate(input.start, 13), myAssignmentsOnly });
    assert.ok((await reader(f.users[1].id, true)).assignments.some(a => a.assignmentId === saved.id));
    assert.ok(!(await reader(f.users[0].id, true)).assignments.some(a => a.assignmentId === saved.id));
    for (const u of f.users.slice(0, 2)) assert.ok((await reader(u.id, false)).assignments.some(a => a.assignmentId === saved.id));
    const future = await savePlannerAssignment(null, { ...input, start: shiftDate(input.start, 14), end: shiftDate(input.start, 14) }, planner);
    assert.ok(!(await reader(f.users[1].id, false)).assignments.some(a => a.assignmentId === future.id));
    const logId = randomUUID();
    await pool.query(`insert into jobs_app.daily_logs(id,log_type,division,assignment_id,job_id,equipment_id,owner_user_id,owner_snapshot,shift_label,shift_started_at,created_at,updated_at,notes)
      values ($1,'rig_shift','Water',$2,$3,$4,$5,'{}','day',now(),now(),now(),'Actual log content')`, [logId, saved.id, f.job.id, f.rig.id, f.users[1].id]);
    await pool.query(`insert into jobs_app.crew_attendance(id,daily_log_id,user_id,display_name_snapshot,attended_from) values ($1,$2,$3,'Actual attendance',now())`, [randomUUID(), logId, f.users[1].id]);
    const before = (await pool.query('select to_jsonb(l) as doc from jobs_app.daily_logs l where id=$1', [logId])).rows;
    const crewBefore = (await pool.query('select to_jsonb(c) as doc from jobs_app.crew_attendance c where daily_log_id=$1', [logId])).rows;
    saved = await savePlannerAssignment(saved.id, { ...input, version: saved.version, crewUserIds: [planner.dbId] }, planner);
    assert.ok(!(await reader(f.users[1].id, true)).assignments.some(a => a.assignmentId === saved.id));
    assert.ok((await reader(planner.dbId, true)).assignments.some(a => a.assignmentId === saved.id));
    assert.deepEqual((await pool.query('select to_jsonb(l) as doc from jobs_app.daily_logs l where id=$1', [logId])).rows, before);
    assert.deepEqual((await pool.query('select to_jsonb(c) as doc from jobs_app.crew_attendance c where daily_log_id=$1', [logId])).rows, crewBefore);
  });
});
