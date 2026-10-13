import { pool } from './db.mjs';
import { assertRoleAtLeast } from './authorization.mjs';

function fail(message, statusCode = 400) { throw Object.assign(new Error(message), { statusCode }); }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= '0001-01-01' && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
export function validatePlannerInput(input, updating = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Assignment details are required.');
  if (typeof input.equipmentId !== 'string' || !uuid.test(input.equipmentId)) fail('Select a valid rig.');
  if (!['job', 'maintenance', 'downtime'].includes(input.assignmentType)) fail('Select a valid assignment type.');
  if (input.assignmentType === 'job' && (typeof input.jobId !== 'string' || !uuid.test(input.jobId))) fail('A job assignment requires a real job.');
  if (input.jobId != null && (typeof input.jobId !== 'string' || !uuid.test(input.jobId))) fail('Select a valid job.');
  if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 300) fail('A title of 1 to 300 characters is required.');
  if (!validDate(input.start) || !validDate(input.end)) fail('Dates must be valid YYYY-MM-DD calendar dates.');
  if (input.end < input.start) fail('End date must be on or after start date.');
  if (!Array.isArray(input.crewUserIds) || input.crewUserIds.some(id => typeof id !== 'string' || !uuid.test(id))) fail('Crew must contain current user UUIDs.');
  if (new Set(input.crewUserIds.map(id => id.toLowerCase())).size !== input.crewUserIds.length) fail('Select each crew member only once.');
  if (input.color != null && !/^#[0-9a-f]{6}$/i.test(input.color)) fail('Colour must be a six-digit hex colour.');
  if (updating && (!Number.isSafeInteger(input.version) || input.version < 1)) fail('The assignment version is required. Refresh and try again.');
  return { ...input, title: input.title.trim(), jobId: input.assignmentType === 'job' ? input.jobId : null };
}

export const plannerSelect = `select pa.*, pa.start_date::text as start_day, pa.end_date::text as end_day,
  e.equipment_code, e.division, e.region, j.job_number
  from public.planner_assignments pa join public.equipment e on e.id = pa.equipment_id
  left join public.jobs j on j.id = pa.job_id`;

export function mapPlannerAssignment(a) {
  return { id: a.id, equipmentId: a.equipment_id, rigId: a.equipment_code,
    jobDbId: a.job_id, jobId: a.job_number, assignmentType: a.assignment_type, title: a.title,
    client: a.client_name, site: a.site_address, start: a.start_day, end: a.end_day,
    color: a.color_hex || (a.assignment_type === 'job' ? (a.division === 'Water' ? '#3B82F6' : '#14B8A6') : '#F97316'),
    personnel: a.personnel, isDowntime: a.is_downtime, label: a.assignment_type === 'job' ? null : a.title,
    division: a.division, region: a.region, version: a.version, createdAt: a.created_at, updatedAt: a.updated_at };
}

export async function savePlannerAssignment(id, rawInput, currentUser) {
  assertRoleAtLeast(currentUser, 'Supervisor', 'Supervisor access is required to plan assignments.');
  if (id && !uuid.test(id)) fail('Invalid assignment ID.');
  const input = validatePlannerInput(rawInput, Boolean(id));
  const db = await pool.connect();
  try {
    await db.query('begin');
    if (id) {
      const current = await db.query('select version from public.planner_assignments where id = $1 for update', [id]);
      if (!current.rowCount) fail('Assignment no longer exists.', 404);
      if (current.rows[0].version !== input.version) fail('This assignment was changed by another planner. Reload the saved assignment, then reapply your changes.', 409);
    }
    const rig = await db.query("select id from public.equipment where id = $1 and equipment_type = 'rig' for share", [input.equipmentId]);
    if (!rig.rowCount) fail('The selected rig does not exist.');
    let job = null;
    if (input.jobId) {
      const result = await db.query(`select j.title, j.site_address, c.name as client_name
        from public.jobs j join public.clients c on c.id = j.client_id where j.id = $1 for share of j, c`, [input.jobId]);
      if (!result.rowCount) fail('The selected job does not exist.');
      job = result.rows[0];
    }
    const users = await db.query('select id, employee_code, full_name from public.app_users where id = any($1::uuid[]) and is_active = true for share', [input.crewUserIds]);
    if (users.rowCount !== input.crewUserIds.length) fail('Crew must be distinct active current users. Reload the crew list.');
    const personnel = input.crewUserIds.map(id => {
      const user = users.rows.find(u => u.id === id.toLowerCase());
      return { userId: user.id, employeeCode: user.employee_code, displayName: user.full_name };
    });
    const params = [input.equipmentId, input.jobId, input.assignmentType, input.title, job?.client_name || null,
      job?.site_address || null, input.start, input.end, input.color || null, JSON.stringify(personnel), input.assignmentType !== 'job'];
    let savedId = id;
    if (id) {
      await db.query(`update public.planner_assignments set equipment_id=$1, job_id=$2, assignment_type=$3,
        title=$4, client_name=$5, site_address=$6, start_date=$7, end_date=$8, color_hex=$9,
        personnel=$10::jsonb, is_downtime=$11 where id=$12`, [...params, id]);
    } else {
      const result = await db.query(`insert into public.planner_assignments
        (equipment_id, job_id, assignment_type, title, client_name, site_address, start_date, end_date, color_hex, personnel, is_downtime)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11) returning id`, params);
      savedId = result.rows[0].id;
    }
    const saved = await db.query(`${plannerSelect} where pa.id = $1`, [savedId]);
    await db.query('commit');
    return mapPlannerAssignment(saved.rows[0]);
  } catch (error) {
    await db.query('rollback');
    throw error;
  } finally { db.release(); }
}
