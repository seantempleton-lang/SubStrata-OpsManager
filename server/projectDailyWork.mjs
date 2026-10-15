import { pool } from './db.mjs';
import { assertRoleAtLeast } from './authorization.mjs';
import { summarizeWork, addQuantity } from '../src/domain/dailyWork.js';
import { reviewContent } from './dailyLogReviews.mjs';

const fail = (message, statusCode = 400) => { throw Object.assign(new Error(message), { statusCode }); };
const canonical = value => JSON.stringify(value, (key, entry) => entry && typeof entry === 'object' && !Array.isArray(entry)
  ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b))) : entry);
export function collateProjectWork(records) {
  const columns = [], rows = new Map(), excluded = [], exceptions = [];
  for (const record of records) {
    const log = record.snapshot;
    const eligible = record.status === 'approved' && !record.aggregate?.requiresDrillerAction && log &&
      record.aggregate?.officeReview?.documentRevision === record.revision &&
      canonical(reviewContent(log)) === canonical(reviewContent(record.aggregate));
    if (!eligible) { excluded.push({ id: record.id, status: record.status, revision: record.revision }); continue; }
    const summary = summarizeWork(log);
    columns.push({ id: record.id, revision: record.revision, startedAt: log.shift.startedAt, shift: log.shift.label,
      rig: log.equipment?.equipmentCode, owner: log.owner.displayName, crew: log.crew.map(person => person.displayNameSnapshot),
      origin: log.officeCorrection?.documentRevision === record.revision ? 'supervisor correction' : 'recorded actuals' });
    for (const text of summary.exceptions) exceptions.push({ id: record.id, revision: record.revision, message: text });
    for (const item of summary.items) {
      const row = rows.get(item.key) || { key: item.key, code: item.code, description: item.description, type: item.type, unit: item.unit, total: 0, contributions: {} };
      row.total = addQuantity(row.total, item.quantity);
      row.contributions[record.id] = { quantity: item.quantity, revision: record.revision, entries: item.entries.map(entry => ({ ...entry,
        point: log.points.find(point => point.id === entry.pointSegmentId)?.pointId || null })) };
      rows.set(item.key, row);
    }
  }
  return { columns, rows: [...rows.values()], excluded, exceptions };
}

export async function getProjectDailyWork(id, filters, user) {
  assertRoleAtLeast(user, 'Supervisor', 'Supervisor access is required to view reviewed project work.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) fail('Choose a project UUID.');
  const dates = ['from', 'to'].map(key => {
    const value = filters?.[key];
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) fail('Use valid calendar dates for the project period.');
    return value || null;
  });
  if (dates[0] && dates[1] && dates[0] > dates[1]) fail('Period finish must follow its start.');
  if (!(await pool.query('select id from public.jobs where id=$1', [id])).rowCount) fail('Project was not found.', 404);
  if (!(await pool.query("select to_regclass('jobs_app.log_revisions') as ready")).rows[0].ready) fail('Project daily work requires the shared Jobs submission migrations.', 503);
  const { rows } = await pool.query(`select l.id,l.status,l.current_document_revision as revision,l.aggregate,r.snapshot
    from jobs_app.daily_logs l left join jobs_app.log_revisions r on r.daily_log_id=l.id and r.revision=l.current_document_revision
    where l.job_id=$1 and l.current_document_revision>0
      and ($2::date is null or (l.shift_started_at at time zone 'Pacific/Auckland')::date >= $2::date)
      and ($3::date is null or (l.shift_started_at at time zone 'Pacific/Auckland')::date <= $3::date)
    order by l.shift_started_at,l.id limit 251`, [id, ...dates]);
  if (rows.length > 250) fail('More than 250 daily logs match. Choose a smaller period to reconcile the complete matrix.');
  return { projectId: id, ...collateProjectWork(rows) };
}
