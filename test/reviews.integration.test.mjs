import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { useTestDatabase, createFixture } from './fixture.mjs';
useTestDatabase();
const { pool } = await import('../server/db.mjs');
const { listDailyLogReviews, getDailyLogReview, reviewDailyLog } = await import('../server/dailyLogReviews.mjs');
const { getProjectDailyWork } = await import('../server/projectDailyWork.mjs');
const root = process.env.JOBS_REPO_PATH;
if (!root) throw new Error('JOBS_REPO_PATH is required to verify the actual Jobs submission/review lifecycle.');

test('Ops review and actual Jobs return/resubmit/approve lifecycle', async t => {
  const f = await createFixture(pool);
  const owner = { userId: f.users[1].id, displayName: f.users[1].full_name, employeeCode: f.users[1].employee_code, appRole: 'FieldUser' };
  const supervisor = { dbId: f.users[0].id, name: f.users[0].full_name, appRole: 'Supervisor' };
  let server, apiPort;
  const jobsDb = await import(pathToFileURL(path.join(root, 'server/db.mjs')));
  t.after(async () => {
    try {
      if (server && server.exitCode === null) { const exited = once(server, 'exit'); server.kill(); await exited; }
      // Jobs prohibits deletion of submitted revisions. Keep these fixtures in
      // the guarded disposable database until its container/database is removed.
    } finally { await jobsDb.closePool(); await pool.end(); }
  });
  const objects = (await pool.query("select to_regclass('jobs_app.daily_logs') as logs,to_regclass('jobs_app.log_revisions') as revisions")).rows[0];
  if (!objects.logs) for (const name of ['001_jobs_foundation.sql', '002_core_daily_logs.sql', '003_field_workflow.sql']) await pool.query(await fs.readFile(path.join(root, 'db', name), 'utf8'));
  if (!objects.revisions) await pool.query(await fs.readFile(path.join(root, 'db/004_submission_output.sql'), 'utf8'));
  if (!(await pool.query("select 1 from information_schema.columns where table_schema='jobs_app' and table_name='log_points' and column_name='daily_details'")).rowCount) {
    await pool.query(await fs.readFile(path.join(root, 'db/005_daily_bore_details.sql'), 'utf8'));
  }
  await pool.query(await fs.readFile(path.join(root, 'db/006_log_item_quantity_precision.sql'), 'utf8'));
  const { createDailyLog, endShift } = await import(pathToFileURL(path.join(root, 'src/domain/dailyLog.js')));
  assert.equal((await fs.readFile(path.join(root, 'src/domain/reviewWork.js'), 'utf8')).replaceAll('\r\n', '\n'),
    (await fs.readFile(new URL('../src/domain/reviewWork.js', import.meta.url), 'utf8')).replaceAll('\r\n', '\n'), 'Both applications must ship the same correction/item validation contract.');
  const { submissionContent, workContent, contentHash } = await import(pathToFileURL(path.join(root, 'src/domain/submission.js')));
  const { applySyncBatch, readDailyLog, listDailyLogs } = await import(pathToFileURL(path.join(root, 'server/dailyLogs.mjs')));
  const { submitLog, uploadSignature, downloadDocument, readSignature } = await import(pathToFileURL(path.join(root, 'server/submissions.mjs')));
  async function sync(log, baseRevision = 0) {
    return (await applySyncBatch({ body: { contractVersion: '1.0', batchId: randomUUID(), deviceId: randomUUID(), mutations: [
      { mutationId: randomUUID(), entityType: 'daily_log', entityId: log.id, operation: 'upsert', baseRevision, occurredAt: new Date().toISOString(), payload: log },
    ] }, user: { ...owner, userId: log.owner.userId } })).acknowledgements[0];
  }
  let log = endShift(createDailyLog({ owner, ancillary: true, startedAt: '2026-08-01T20:00:00Z', initialActivity: { code: 'ANC_WORKSHOP', label: 'Workshop' } }), {}, '2026-08-02T03:00:00Z');
  assert.equal((await sync(log)).status, 'applied');
  log = (await submitLog(log.id, { requestId: randomUUID(), baseRevision: 1, contentHash: await contentHash(submissionContent(log)) }, owner)).log;
  const snapshot1 = (await pool.query('select snapshot from jobs_app.log_revisions where daily_log_id=$1 and revision=1', [log.id])).rows[0].snapshot;

  await t.test('old submitted records remain in both inboxes; field users cannot review', async () => {
    assert.ok((await listDailyLogReviews({}, supervisor)).logs.some(r => r.id === log.id));
    assert.ok((await listDailyLogs(owner)).some(r => r.id === log.id));
    await assert.rejects(() => listDailyLogReviews({}, { appRole: 'FieldUser' }), { statusCode: 403 });
    await assert.rejects(() => reviewDailyLog(log.id, {}, { appRole: 'Maintenance' }), { statusCode: 403 });
  });
  await t.test('API authentication, required comments and revision validation', async () => {
    server = spawn(process.execPath, ['server/index.mjs'], { env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
    const port = await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('API start timed out')), 10000); server.stdout.on('data', data => { const match = String(data).match(/port (\d+)/); if (match) { clearTimeout(timer); resolve(match[1]); } }); server.on('error', reject); });
    apiPort = port;
    const url = `http://127.0.0.1:${port}/api/daily-log-reviews`;
    assert.equal((await fetch(url)).status, 401);
    const token = randomUUID();
    const account = (await pool.query("insert into app_auth_accounts(user_id,login_email,password_hash) values($1,$2,'test-only') returning id", [supervisor.dbId, `${randomUUID()}@test.invalid`])).rows[0];
    await pool.query("insert into app_sessions(account_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 hour')", [account.id, createHash('sha256').update(token).digest('hex')]);
    const headers = { Cookie: `substrata_session=${token}`, 'Content-Type': 'application/json' };
    assert.equal((await fetch(url, { headers })).status, 200);
    assert.equal((await fetch(`${url}/${log.id}/actions`, { method: 'POST', headers, body: JSON.stringify({ requestId: randomUUID(), action: 'return', baseRevision: log.serverRevision, documentRevision: 1 }) })).status, 400);
    assert.equal((await fetch(`${url}/${randomUUID()}`, { headers })).status, 404);
    await pool.query("update app_users set app_role='FieldUser' where id=$1", [supervisor.dbId]);
    assert.equal((await fetch(url, { headers })).status, 403);
    await pool.query("update app_users set app_role='Supervisor' where id=$1", [supervisor.dbId]);
  });
  await t.test('return is atomic/idempotent and preserves the exact submitted snapshot', async () => {
    const command = { requestId: randomUUID(), action: 'return', baseRevision: log.serverRevision, documentRevision: 1, comment: 'Correct the workshop description.' };
    const result = await Promise.all([reviewDailyLog(log.id, command, supervisor), reviewDailyLog(log.id, command, supervisor)]);
    assert.ok(result.some(r => r.duplicate));
    log = await readDailyLog(log.id, owner); assert.equal(log.status, 'returned'); assert.equal(log.officeReview.comment, command.comment);
    assert.equal((await pool.query("select count(*) as n from jobs_app.audit_events where daily_log_id=$1 and event_type='supervisor_returned'", [log.id])).rows[0].n, '1');
    assert.deepEqual((await pool.query('select snapshot from jobs_app.log_revisions where daily_log_id=$1 and revision=1', [log.id])).rows[0].snapshot, snapshot1);
    await assert.rejects(() => pool.query('delete from jobs_app.log_revisions where daily_log_id=$1 and revision=1', [log.id]), /Immutable submitted content/);
    await assert.rejects(() => reviewDailyLog(log.id, { ...command, comment: 'Different' }, supervisor), { statusCode: 409 });
    const stale = await sync({ ...snapshot1, status: 'draft', notes: 'Offline change' }, snapshot1.serverRevision);
    assert.equal(stale.status, 'conflict');
  });
  await t.test('owner corrects/resubmits; server-owned decision metadata cannot be forged', async () => {
    const realReview = structuredClone(log.officeReview);
    const ack = await sync({ ...log, notes: 'Corrected workshop description.', officeReview: { comment: 'Forged decision' }, officeCorrection: { reason: 'Forged correction' }, approvedAt: '2000-01-01T00:00:00Z' }, log.serverRevision);
    assert.equal(ack.status, 'applied');
    log = await readDailyLog(log.id, owner); assert.deepEqual(log.officeReview, realReview); assert.equal(log.approvedAt, undefined); assert.equal(log.officeCorrection, undefined);
    log = (await submitLog(log.id, { requestId: randomUUID(), baseRevision: log.serverRevision, contentHash: await contentHash(submissionContent(log)) }, owner)).log;
    assert.equal(log.currentDocumentRevision, 2); assert.equal(log.status, 'submitted');
    assert.equal((await getDailyLogReview(log.id, supervisor, 1)).canReview, false);
    assert.deepEqual((await pool.query('select snapshot from jobs_app.log_revisions where daily_log_id=$1 and revision=1', [log.id])).rows[0].snapshot, snapshot1);
  });
  await t.test('concurrent approve/return: one succeeds, one conflicts; approved work stays locked', async () => {
    const body = { baseRevision: log.serverRevision, documentRevision: 2 };
    const results = await Promise.allSettled([reviewDailyLog(log.id, { ...body, requestId: randomUUID(), action: 'approve' }, supervisor), reviewDailyLog(log.id, { ...body, requestId: randomUUID(), action: 'return', comment: 'Another review' }, supervisor)]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    assert.equal(results.find(r => r.status === 'rejected').reason.statusCode, 409);
    log = await readDailyLog(log.id, owner);
    if (log.status === 'returned') {
      log = (await submitLog(log.id, { requestId: randomUUID(), baseRevision: log.serverRevision, contentHash: await contentHash(submissionContent(log)) }, owner)).log;
      await reviewDailyLog(log.id, { requestId: randomUUID(), action: 'approve', baseRevision: log.serverRevision, documentRevision: log.currentDocumentRevision }, supervisor);
      log = await readDailyLog(log.id, owner);
    }
    assert.equal(log.status, 'approved'); assert.ok(log.approvedAt); assert.equal(log.requiresDrillerAction, false);
    assert.ok((await listDailyLogs(owner)).some(l => l.id === log.id), 'An old shift recently approved must reach the owner during sync.');
    assert.equal((await sync({ ...log, status: 'draft', notes: 'Attempt to rewrite approved work' }, log.serverRevision)).status, 'rejected');
    assert.equal((await readDailyLog(log.id, owner)).notes, 'Corrected workshop description.');
  });
  await t.test('self-approval explicitly records owner/reviewer identity and sends no email', async () => {
    const selfOwner = { ...owner, userId: supervisor.dbId, displayName: supervisor.name };
    let self = endShift(createDailyLog({ owner: selfOwner, ancillary: true, startedAt: '2026-10-13T20:00:00Z', initialActivity: { code: 'ANC_WORKSHOP', label: 'Workshop' } }), {}, '2026-10-14T03:00:00Z');
    await sync(self);
    self = (await submitLog(self.id, { requestId: randomUUID(), baseRevision: 1, contentHash: await contentHash(submissionContent(self)) }, selfOwner)).log;
    const result = await reviewDailyLog(self.id, { requestId: randomUUID(), action: 'approve', baseRevision: self.serverRevision, documentRevision: 1 }, supervisor);
    assert.equal(result.officeReview.selfReview, true);
    assert.equal((await getDailyLogReview(self.id, supervisor)).actions[0].self_review, true);
    assert.equal((await pool.query('select count(*) as n from jobs_app.email_deliveries where daily_log_id=any($1::uuid[])', [[log.id, self.id]])).rows[0].n, '0');
  });
  await t.test('signed rig revision, actual attendance and draft PDF stay unchanged after approval', async () => {
    process.env.SIGNATURE_ENCRYPTION_KEY = randomBytes(32).toString('base64');
    const { savePlannerAssignment } = await import('../server/planner.mjs');
    const a = await savePlannerAssignment(null, { equipmentId: f.rig.id, jobId: f.job.id, assignmentType: 'job', title: 'Review fixture plan', start: '2026-10-14', end: '2026-10-14', crewUserIds: [owner.userId] }, supervisor);
    const assignment = { assignmentId: a.id, job: { jobId: f.job.id, jobNumber: f.job.job_number, title: 'Review fixture job', division: 'Water', region: 'South', clientName: 'Fixture Client' },
      equipment: { equipmentId: f.rig.id, equipmentCode: f.rig.equipment_code, name: 'Fixture rig', division: 'Water' }, personnel: [owner], points: [{ pointId: 'BH-REVIEW', jobNumber: f.job.job_number }] };
    let rig = endShift(createDailyLog({ assignment, owner, startedAt: '2026-10-13T20:00:00Z', initialActivity: { code: 'PRESTART', label: 'Site setup' } }), { endDepthM: 5, endStatus: 'Completed' }, '2026-10-14T03:00:00Z');
    rig.points[0].dailyDetails = { currentDepthM: 5, permitNumber: 'REVIEW-FIXTURE' };
    const signatureId = randomUUID(), drawing = { strokes: [[[0.1, 0.2], [0.8, 0.6]]] };
    rig.clientAcknowledgement = { status: 'signed_on_device', signerName: 'Fixture Client', companyRole: 'Site representative', clientEmail: null, signedAt: '2026-10-14T03:00:00Z', signatureUploadId: signatureId, contentHash: await contentHash(workContent(rig)) };
    assert.equal((await sync(rig)).status, 'applied');
    await uploadSignature(rig.id, { id: signatureId, snapshot: rig, drawing }, owner);
    rig = (await submitLog(rig.id, { requestId: randomUUID(), baseRevision: 1, contentHash: await contentHash(submissionContent(rig)) }, owner)).log;
    const pdf = await downloadDocument(rig.id, 1, owner);
    const attendance = (await pool.query('select to_jsonb(c) as value from jobs_app.crew_attendance c where daily_log_id=$1', [rig.id])).rows;
    await reviewDailyLog(rig.id, { requestId: randomUUID(), action: 'approve', baseRevision: rig.serverRevision, documentRevision: 1, comment: 'Internal supervisor note' }, supervisor);
    const reviewed = await getDailyLogReview(rig.id, supervisor);
    assert.equal(reviewed.signatureCovered, true);
    assert.equal(reviewed.snapshot.points[0].dailyDetails.permitNumber, 'REVIEW-FIXTURE');
    assert.deepEqual((await downloadDocument(rig.id, 1, owner)).content, pdf.content);
    assert.deepEqual((await readSignature(signatureId, owner)).drawing, drawing);
    assert.deepEqual((await pool.query('select to_jsonb(c) as value from jobs_app.crew_attendance c where daily_log_id=$1', [rig.id])).rows, attendance);
    assert.ok(!JSON.stringify(reviewed.snapshot).includes('Internal supervisor note'));
  });
  await t.test('supervisor corrects and locks a two-bore signed log; Jobs and project use only its effective revision', async () => {
    const { changePoint } = await import(pathToFileURL(path.join(root, 'src/domain/dailyLog.js')));
    const assignment = { assignmentId: null, job: { jobId: f.job.id, jobNumber: f.job.job_number, title: 'Correction fixture', division: 'Water', region: 'South' },
      equipment: { equipmentId: f.rig.id, equipmentCode: f.rig.equipment_code, name: 'Fixture rig', division: 'Water' }, personnel: [owner], points: [{ pointId: 'BH-A', jobNumber: f.job.job_number }] };
    let rig = createDailyLog({ assignment, owner, startedAt: '2026-10-13T20:00:00Z', startDepthM: 0, initialActivity: { code: 'DRILL', label: 'Drilling' } });
    rig = changePoint(rig, { nextPoint: { pointId: 'BH-B', jobNumber: f.job.job_number }, endDepthM: 5, endStatus: 'Completed', nextStartDepthM: 0 }, '2026-10-13T23:00:00Z');
    rig = endShift(rig, { endDepthM: 7, endStatus: 'Completed' }, '2026-10-14T03:00:00Z');
    rig.items = [
      { id: randomUUID(), itemType: 'material', itemCode: 'OTHER', itemLabelSnapshot: 'Cement', quantity: 2, unit: 'bag', notes: null, pointSegmentId: rig.points[0].id },
      { id: randomUUID(), itemType: 'material', itemCode: 'OTHER', itemLabelSnapshot: 'Cement', quantity: 3, unit: 'bag', notes: null, pointSegmentId: rig.points[1].id },
      { id: randomUUID(), itemType: 'subcontractor', itemCode: 'OTHER', itemLabelSnapshot: 'Service locate', quantity: 0, unit: 'visit', notes: 'Not used', pointSegmentId: null },
      { id: randomUUID(), itemType: 'measurement', itemCode: 'OTHER', itemLabelSnapshot: 'Water level', quantity: 1.123456, unit: 'm', notes: null, pointSegmentId: rig.points[0].id },
    ];
    const signatureId = randomUUID();
    rig.clientAcknowledgement = { status: 'signed_on_device', signerName: 'Fixture Client', companyRole: null, clientEmail: null, signedAt: rig.shift.endedAt, signatureUploadId: signatureId, contentHash: await contentHash(workContent(rig)) };
    await sync(rig);
    assert.equal(Number((await pool.query('select quantity from jobs_app.log_items where id=$1', [rig.items[3].id])).rows[0].quantity), 1.123456, 'Jobs capture must preserve accepted precision before office correction.');
    await uploadSignature(rig.id, { id: signatureId, snapshot: rig, drawing: { strokes: [[[0.1, 0.2], [0.8, 0.6]]] } }, owner);
    rig = (await submitLog(rig.id, { requestId: randomUUID(), baseRevision: 1, contentHash: await contentHash(submissionContent(rig)) }, owner)).log;
    const original = structuredClone(rig), originalPdf = await downloadDocument(rig.id, 1, owner);
    const command = { requestId: randomUUID(), action: 'correct_and_lock', baseRevision: rig.serverRevision, documentRevision: 1,
      comment: 'Second bore quantity checked against delivery docket.', corrections: { notes: 'Reviewed work', items: [{ id: rig.items[1].id, quantity: 4.123456 }] } };
    await assert.rejects(() => reviewDailyLog(rig.id, command, { ...supervisor, appRole: 'FieldUser' }), { statusCode: 403 });
    for (const corrections of [{ items: [{ id: rig.items[1].id, quantity: -1 }] }, { job: { jobId: randomUUID() } }, { items: [{ id: randomUUID(), quantity: 4 }] }]) {
      await assert.rejects(() => reviewDailyLog(rig.id, { ...command, requestId: randomUUID(), corrections }, supervisor), { statusCode: 400 });
    }
    assert.equal((await readDailyLog(rig.id, owner)).serverRevision, command.baseRevision);
    const priorRequest = (await pool.query('select request_id from jobs_app.log_revisions where daily_log_id=$1 and revision=1', [rig.id])).rows[0].request_id;
    await assert.rejects(() => reviewDailyLog(rig.id, { ...command, requestId: priorRequest }, supervisor), { statusCode: 409 });
    const displacedItem = randomUUID();
    await pool.query('update jobs_app.log_items set id=$2 where id=$1', [rig.items[0].id, displacedItem]);
    await assert.rejects(() => reviewDailyLog(rig.id, { ...command, requestId: randomUUID() }, supervisor), { statusCode: 409 });
    await pool.query('update jobs_app.log_items set id=$2 where id=$1', [displacedItem, rig.items[0].id]);
    assert.equal((await pool.query('select count(*) as n from jobs_app.log_revisions where daily_log_id=$1', [rig.id])).rows[0].n, '1', 'Failed corrections must roll back their new immutable revision.');
    const results = await Promise.all([reviewDailyLog(rig.id, command, supervisor), reviewDailyLog(rig.id, command, supervisor)]);
    assert.equal(results.filter(result => result.duplicate).length, 1);
    rig = await readDailyLog(rig.id, owner);
    assert.equal(rig.status, 'approved'); assert.equal(rig.currentDocumentRevision, 2); assert.equal(rig.requiresDrillerAction, false);
    assert.deepEqual(rig.officeCorrection.changes.map(change => change.before), [null, 3]);
    assert.equal(rig.clientAcknowledgement.status, 'not_signed'); assert.equal(rig.clientAcknowledgement.priorSignatureUploadId, signatureId);
    assert.deepEqual(rig.crew, original.crew); assert.deepEqual(rig.points, original.points); assert.deepEqual(rig.activities, original.activities);
    assert.deepEqual((await getDailyLogReview(rig.id, supervisor, 1)).snapshot, original);
    assert.equal((await getDailyLogReview(rig.id, supervisor, 2)).signatureCovered, false);
    assert.deepEqual((await downloadDocument(rig.id, 1, owner)).content, originalPdf.content);
    assert.ok((await readSignature(signatureId, owner)).drawing.strokes.length);
    assert.equal(Number((await pool.query('select quantity from jobs_app.log_items where id=$1', [rig.items[1].id])).rows[0].quantity), 4.123456);
    assert.equal((await pool.query('select count(*) as n from jobs_app.log_revisions where daily_log_id=$1', [rig.id])).rows[0].n, '2');
    assert.equal((await pool.query("select count(*) as n from jobs_app.audit_events where daily_log_id=$1 and event_type='supervisor_corrected_and_locked'", [rig.id])).rows[0].n, '1');
    await assert.rejects(() => reviewDailyLog(rig.id, { ...command, corrections: { notes: 'Different' } }, supervisor), { statusCode: 409 });
    await assert.rejects(() => reviewDailyLog(rig.id, { ...command, requestId: randomUUID() }, supervisor), { statusCode: 409 });
    assert.equal((await sync({ ...original, notes: 'Offline unsynced work' }, original.serverRevision)).status, 'rejected');
    assert.equal((await sync({ ...original, status: 'returned', notes: 'Offline unsynced work' }, original.serverRevision)).status, 'conflict');
    await assert.rejects(() => getProjectDailyWork(f.job.id, {}, owner), { statusCode: 403 });
    const matrix = await getProjectDailyWork(f.job.id, { from: '2026-10-14', to: '2026-10-14' }, supervisor);
    assert.equal(matrix.columns.filter(column => column.id === rig.id).length, 1);
    assert.equal(matrix.columns.find(column => column.id === rig.id).revision, 2);
    assert.equal(matrix.rows.find(row => row.description === 'Cement').total, 6.123456);
    assert.equal(matrix.rows.find(row => row.description === 'Service locate').total, 0);
    assert.equal(matrix.rows.find(row => row.description === 'Cement').contributions[rig.id].entries[1].point, 'BH-B');
    assert.ok(matrix.exceptions.some(entry => entry.id === rig.id && entry.message.includes('Water level')));
    assert.equal((await getProjectDailyWork(f.job.id, { from: '2026-10-15' }, supervisor)).columns.length, 0);
    assert.equal((await pool.query('select count(*) as n from jobs_app.email_deliveries where daily_log_id=$1', [rig.id])).rows[0].n, '0');
  });
  if (process.env.REVIEW_BROWSER_TEST === '1') await t.test('browser: correct/lock, source revision, project contribution and Jobs reconciliation', async () => {
    let rig = endShift(createDailyLog({ assignment: { job: { jobId: f.job.id, jobNumber: f.job.job_number, title: 'Browser fixture', division: 'Water', region: 'South' },
      equipment: { equipmentId: f.rig.id, equipmentCode: f.rig.equipment_code, name: 'Browser fixture rig', division: 'Water' }, personnel: [owner] }, startingPoint: null,
      owner, startedAt: '2026-10-14T19:00:00Z', initialActivity: { code: 'PRESTART', label: 'Site setup' } }), {}, '2026-10-15T03:00:00Z');
    rig.items.push({ id: randomUUID(), itemType: 'material', itemCode: 'OTHER', itemLabelSnapshot: 'Browser cement', quantity: 5, unit: 'bag', notes: null, pointSegmentId: null });
    await sync(rig);
    rig = (await submitLog(rig.id, { requestId: randomUUID(), baseRevision: 1, contentHash: await contentHash(submissionContent(rig)) }, owner)).log;
    const { reviewBrowser } = await import('./reviewBrowser.mjs');
    await reviewBrowser({ root, pool, opsUrl: `http://127.0.0.1:${apiPort}`, owner, supervisor, project: f.job, log: rig });
  });
});
