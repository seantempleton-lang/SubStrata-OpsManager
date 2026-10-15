import { createHash } from 'node:crypto';
import { pool } from './db.mjs';
import { assertRoleAtLeast } from './authorization.mjs';
import { applyWorkCorrections } from '../src/domain/reviewWork.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REVIEW_STATES = ['submitted', 'under_review'];
const LIST_STATES = [...REVIEW_STATES, 'returned', 'awaiting_driller_confirmation', 'approved', 'reopened'];
function problem(message, statusCode = 400) { throw Object.assign(new Error(message), { statusCode }); }
function requireId(id) { if (typeof id !== 'string' || !UUID.test(id)) problem('Choose a valid daily log UUID.'); }
function authorize(user) { assertRoleAtLeast(user, 'Supervisor', 'Supervisor access is required to review daily logs.'); }
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).filter(k => value[k] !== undefined).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
// Match the Jobs submission projection, including any nested point/bore fields.
export function reviewContent(log) {
  const { id, logType, division, job, equipment, owner, shift, setup, crew, points, activities, items, notes, clientAcknowledgement } = log;
  return { id, logType, division, job, equipment, owner, shift, setup, crew, points, activities, items, notes, clientAcknowledgement };
}
export function validateReviewRequest(id, input) {
  requireId(id);
  if (!input || typeof input.requestId !== 'string' || !UUID.test(input.requestId)) problem('A review request UUID is required.');
  if (!['approve', 'return', 'correct_and_lock'].includes(input.action)) problem('Choose Lock, Correct and lock, or Return.');
  if (!Number.isSafeInteger(input.baseRevision) || input.baseRevision < 1 || !Number.isSafeInteger(input.documentRevision) || input.documentRevision < 1) problem('The server and document revisions being reviewed are required.');
  if (input.comment != null && (typeof input.comment !== 'string' || input.comment.length > 4000)) problem('Review comments must be text of at most 4000 characters.');
  if (input.action === 'return' && !input.comment?.trim()) problem('A correction comment is required when returning a log.');
  if (input.action === 'correct_and_lock' && !input.comment?.trim()) problem('A reason is required for supervisor work corrections.');
  if (input.action !== 'correct_and_lock' && input.corrections !== undefined) problem('Work corrections require Correct and lock.');
  if (input.action === 'correct_and_lock' && (!input.corrections || typeof input.corrections !== 'object' || Array.isArray(input.corrections))) problem('Work corrections are required.');
  return { requestId: input.requestId.toLowerCase(), action: input.action, baseRevision: input.baseRevision, documentRevision: input.documentRevision, comment: input.comment?.trim() || null,
    ...(input.action === 'correct_and_lock' ? { corrections: input.corrections } : {}) };
}
async function requireJobs(db = pool) {
  const result = await db.query(`select to_regclass('jobs_app.daily_logs') is not null
    and to_regclass('jobs_app.log_revisions') is not null
    and to_regclass('jobs_app.audit_events') is not null
    and to_regclass('jobs_app.document_artifacts') is not null
    and to_regclass('public.ops_daily_log_review_actions') is not null as ready`);
  if (!result.rows[0].ready) problem('Daily log review requires Ops migration 016 and the Jobs submission database migrations. Configure the shared database and try again.', 503);
}

export async function listDailyLogReviews(filters, user) {
  authorize(user); await requireJobs();
  const state = filters?.status || 'pending';
  if (!['all', 'pending', ...LIST_STATES].includes(state)) problem('Invalid review status filter.');
  const page = Number(filters?.page || 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) problem('Invalid review page.');
  const region = filters?.region || 'all';
  if (!['all', 'North', 'South'].includes(region)) problem('Invalid location filter.');
  const divisions = filters?.divisions === undefined ? ['Water', 'Geotech'] : String(filters.divisions).split(',').filter(Boolean);
  if (divisions.some(d => !['Water', 'Geotech'].includes(d))) problem('Invalid division filter.');
  const { rows } = await pool.query(`select l.id, l.status, l.division,
    coalesce(l.job_snapshot->>'region',j.region,l.owner_snapshot->>'region',u.region) as region,
    coalesce(l.job_number_snapshot,j.job_number) as job_number,
    coalesce(l.job_snapshot->>'title',j.title) as job_title,
    l.equipment_code_snapshot as rig, l.owner_snapshot->>'displayName' as owner_name,
    l.owner_user_id, l.shift_started_at, l.shift_ended_at,
    l.current_document_revision, l.server_revision, count(*) over() as total
    from jobs_app.daily_logs l left join public.jobs j on j.id=l.job_id
    left join public.app_users u on u.id=l.owner_user_id
    where l.current_document_revision > 0 and
      (($1='pending' and l.status=any($2::text[])) or ($1='all' and l.status=any($3::text[])) or l.status=$1)
      and ($5='all' or coalesce(l.job_snapshot->>'region',j.region,l.owner_snapshot->>'region',u.region)=$5)
      and (l.division is null or l.division=any($6::text[]))
    order by l.shift_started_at desc,l.id limit 50 offset $4`, [state, REVIEW_STATES, LIST_STATES, (page - 1) * 50, region, divisions]);
  return { logs: rows.map(r => ({ id: r.id, status: r.status, division: r.division, region: r.region,
    jobNumber: r.job_number, title: r.job_title || 'Ancillary workday', rig: r.rig, ownerName: r.owner_name,
    ownerId: r.owner_user_id, startedAt: r.shift_started_at, endedAt: r.shift_ended_at,
    documentRevision: r.current_document_revision, serverRevision: Number(r.server_revision) })),
    page, total: Number(rows[0]?.total || 0) };
}

export async function getDailyLogReview(id, user, revision = null) {
  authorize(user); requireId(id); await requireJobs();
  if (revision !== null && (!Number.isSafeInteger(revision) || revision < 1)) problem('Invalid document revision.');
  const { rows: [row] } = await pool.query('select * from jobs_app.daily_logs where id=$1', [id]);
  if (!row || !row.current_document_revision) problem('Submitted daily log was not found.', 404);
  const selected = revision || row.current_document_revision;
  const [record, versions, actions, assignment] = await Promise.all([
    pool.query('select snapshot,content_sha256,signature_asset_id,created_at from jobs_app.log_revisions where daily_log_id=$1 and revision=$2', [id, selected]),
    pool.query(`select r.revision,r.created_at,r.content_sha256,d.state as pdf_state,d.error_code as pdf_error
      from jobs_app.log_revisions r left join jobs_app.document_artifacts d on d.daily_log_id=r.daily_log_id and d.revision=r.revision
      where r.daily_log_id=$1 order by r.revision desc`, [id]),
    pool.query(`select a.request_id,a.action,a.comment,a.document_revision,a.self_review,a.created_at,u.full_name as reviewer_name
      from public.ops_daily_log_review_actions a join public.app_users u on u.id=a.actor_user_id
      where a.daily_log_id=$1 order by a.created_at desc`, [id]),
    row.assignment_id ? pool.query(`select pa.id,coalesce(pa.division,j.division,e.division) as division,
      coalesce(pa.region,j.region,e.region) as region,pa.start_date::text,pa.end_date::text
      from public.planner_assignments pa join public.equipment e on e.id=pa.equipment_id
      left join public.jobs j on j.id=pa.job_id where pa.id=$1`, [row.assignment_id]) : Promise.resolve({ rows: [] }),
  ]);
  if (!record.rowCount) problem('Submitted document revision was not found.', 404);
  return { id: row.id, status: row.status, serverRevision: Number(row.server_revision), currentDocumentRevision: row.current_document_revision,
    selectedDocumentRevision: selected, snapshot: record.rows[0].snapshot, contentHash: record.rows[0].content_sha256,
    signatureCovered: Boolean(record.rows[0].signature_asset_id), submittedAt: record.rows[0].created_at,
    revisions: versions.rows, actions: actions.rows, assignment: assignment.rows[0] || null,
    canReview: REVIEW_STATES.includes(row.status) && selected === row.current_document_revision,
    selfReview: row.owner_user_id === user.dbId };
}

export async function reviewDailyLog(id, rawInput, user) {
  authorize(user);
  const input = validateReviewRequest(id, rawInput);
  const requestHash = createHash('sha256').update(canonical({ id, ...input })).digest('hex');
  const db = await pool.connect();
  try {
    await db.query('begin'); await requireJobs(db);
    await db.query("select pg_advisory_xact_lock(hashtextextended($1,0))", [`ops-review:${input.requestId}`]);
    await db.query("select pg_advisory_xact_lock(hashtextextended($1,0))", [id]);
    const prior = await db.query('select * from public.ops_daily_log_review_actions where request_id=$1', [input.requestId]);
    if (prior.rowCount) {
      if (prior.rows[0].request_hash !== requestHash || prior.rows[0].actor_user_id !== user.dbId) problem('This review request ID was already used for a different action.', 409);
      await db.query('commit'); return { ...prior.rows[0].result, duplicate: true };
    }
    const { rows: [row] } = await db.query('select * from jobs_app.daily_logs where id=$1 for update', [id]);
    if (!row) problem('Daily log no longer exists.', 404);
    if (Number(row.server_revision) !== input.baseRevision || row.current_document_revision !== input.documentRevision) problem('This log changed after you opened it. Reload the latest revision before reviewing.', 409);
    if (!REVIEW_STATES.includes(row.status)) problem('Only a submitted log can be approved or returned. Reload its current state.', 409);
    const { rows: [record] } = await db.query('select snapshot,content_sha256 from jobs_app.log_revisions where daily_log_id=$1 and revision=$2', [id, input.documentRevision]);
    if (!record || !row.aggregate || canonical(reviewContent(record.snapshot)) !== canonical(reviewContent(row.aggregate))) problem('The working log no longer matches its submitted revision. Resolve the version conflict before reviewing.', 409);
    const now = new Date().toISOString(), status = input.action === 'return' ? 'returned' : 'approved';
    let work = row.aggregate, changes = [], documentRevision = input.documentRevision;
    if (input.action === 'correct_and_lock') {
      const readiness = await db.query(`select
        exists(select 1 from pg_constraint where conrelid='public.ops_daily_log_review_actions'::regclass
          and conname='ops_daily_log_review_actions_action_check' and pg_get_constraintdef(oid) like '%correct_and_lock%')
        and exists(select 1 from information_schema.columns where table_schema='jobs_app' and table_name='log_items'
          and column_name='quantity' and data_type='numeric' and numeric_scale is null) as ready`);
      if (!readiness.rows[0].ready) problem('Supervisor corrections require Ops migration 017 and Jobs migration 006 in the shared database.', 503);
      const corrected = applyWorkCorrections(work, input.corrections);
      work = corrected.log; changes = corrected.changes; documentRevision++;
      // Signatures remain attached to the acknowledged work, never corrected work.
      if (work.clientAcknowledgement?.status === 'signed_on_device') work.clientAcknowledgement = {
        status: 'not_signed', reasonCode: 'CONTENT_CHANGED', reasonNotes: 'The earlier signature is retained against the work originally acknowledged.',
        clientEmail: work.clientAcknowledgement.clientEmail || null, priorSignatureUploadId: work.clientAcknowledgement.signatureUploadId,
      };
      work.officeCorrection = { sourceDocumentRevision: input.documentRevision, documentRevision,
        reviewerId: user.dbId, reviewerName: user.name, correctedAt: now, reason: input.comment, changes };
    }
    const selfReview = row.owner_user_id === user.dbId;
    const officeReview = { action: input.action, comment: input.comment, reviewerId: user.dbId, reviewerName: user.name,
      reviewedAt: now, documentRevision, selfReview };
    const result = { id, status, serverRevision: Number(row.server_revision) + 1, documentRevision, officeReview };
    const aggregate = { ...work, status, currentDocumentRevision: documentRevision, serverRevision: result.serverRevision, updatedAt: now, officeReview,
      requiresDrillerAction: status === 'returned', ...(status === 'approved' ? { approvedAt: now } : {}) };
    if (input.action === 'correct_and_lock') {
      const contentHash = createHash('sha256').update(canonical(reviewContent(aggregate))).digest('hex');
      const saved = await db.query(`insert into jobs_app.log_revisions(daily_log_id,revision,request_id,request_hash,snapshot,content_sha256,created_by_user_id)
        values($1,$2,$3,$4,$5::jsonb,$6,$7) on conflict(request_id) do nothing returning revision`, [id, documentRevision, input.requestId, requestHash, JSON.stringify(aggregate), contentHash, user.dbId]);
      if (!saved.rowCount) problem('This request ID already identifies a different Jobs revision. Reload before reviewing.', 409);
      // Keep Jobs' normalized child records and aggregate in agreement.
      const children = await db.query('select id from jobs_app.log_items where daily_log_id=$1', [id]);
      if (children.rowCount !== aggregate.items.length || children.rows.some(child => !aggregate.items.some(item => item.id === child.id))) problem('The stored item records do not match this revision. Resolve the data conflict before locking.', 409);
      for (const item of aggregate.items) {
        const updated = await db.query(`update jobs_app.log_items set quantity=$3,unit=$4,item_label_snapshot=$5,notes=$6
          where daily_log_id=$1 and id=$2`, [id, item.id, item.quantity, item.unit, item.itemLabelSnapshot, item.notes]);
        if (updated.rowCount !== 1) problem('An item record changed during review. Reload before locking.', 409);
      }
    }
    if (input.action === 'correct_and_lock') await db.query(`update jobs_app.daily_logs set status=$2,server_revision=$3,aggregate=$4::jsonb,updated_at=$5,
        current_document_revision=$6,notes=$7,client_acknowledgement=$8::jsonb where id=$1`,
        [id, status, result.serverRevision, JSON.stringify(aggregate), now, documentRevision, aggregate.notes, JSON.stringify(aggregate.clientAcknowledgement)]);
    else await db.query('update jobs_app.daily_logs set status=$2,server_revision=$3,aggregate=$4::jsonb,updated_at=$5 where id=$1', [id, status, result.serverRevision, JSON.stringify(aggregate), now]);
    await db.query(`insert into public.ops_daily_log_review_actions(request_id,daily_log_id,actor_user_id,action,request_hash,
      document_revision,base_server_revision,comment,self_review,result)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)`, [input.requestId, id, user.dbId, input.action, requestHash, documentRevision, input.baseRevision, input.comment, selfReview, JSON.stringify(result)]);
    await db.query(`insert into jobs_app.audit_events(daily_log_id,actor_user_id,event_type,before_revision,after_revision,metadata)
      values($1,$2,$3,$4,$5,$6::jsonb)`, [id, user.dbId, input.action === 'correct_and_lock' ? 'supervisor_corrected_and_locked' : status === 'approved' ? 'supervisor_approved' : 'supervisor_returned', input.baseRevision, result.serverRevision,
      JSON.stringify({ requestId: input.requestId, sourceDocumentRevision: input.documentRevision, documentRevision, sourceContentHash: record.content_sha256, comment: input.comment, selfReview, changes })]);
    await db.query('commit'); return result;
  } catch (error) { await db.query('rollback'); throw error; } finally { db.release(); }
}

export async function getReviewPdf(id, revision, user) {
  authorize(user); requireId(id); await requireJobs();
  if (!Number.isSafeInteger(revision) || revision < 1) problem('Invalid document revision.');
  const { rows: [record] } = await pool.query('select content,sha256,state from jobs_app.document_artifacts where daily_log_id=$1 and revision=$2', [id, revision]);
  if (!record) problem('Submitted PDF was not found. Generate it in Jobs first.', 404);
  if (record.state !== 'ready') problem('The draft PDF is pending or failed. Retry generation in Jobs.', 409);
  return record;
}
