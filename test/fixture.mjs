import { randomUUID } from 'node:crypto';

export function useTestDatabase() {
  const value = process.env.TEST_DATABASE_URL;
  if (!value) throw new Error('Set TEST_DATABASE_URL to a migrated disposable local database whose name ends in _test.');
  const url = new URL(value);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !url.pathname.endsWith('_test')) throw new Error('Tests require a disposable local database ending in _test.');
  process.env.DATABASE_URL = value;
  delete process.env.PGSSLMODE;
}

export async function createFixture(pool) {
  const suffix = randomUUID().replaceAll('-', '').slice(0, 10);
  const users = [];
  for (const [name, role, active] of [['Planner Fixture', 'Supervisor', true], ['Crew Fixture', 'FieldUser', true], ['Inactive Fixture', 'FieldUser', false]]) {
    const result = await pool.query(`insert into public.app_users (employee_code,full_name,initials,role_title,division,region,app_role,is_active,login_username)
      values ($1,$2,'TF','Test fixture','Water','South',$3,$4,$5) returning id,employee_code,full_name`, [`TEST-${users.length}-${suffix}`, name, role, active, `test${users.length}${suffix}`]);
    users.push(result.rows[0]);
  }
  const client = (await pool.query("insert into public.clients(client_code,name) values ($1,'Fixture Client') returning id", [`TEST-${suffix}`])).rows[0];
  const job = (await pool.query(`insert into public.jobs(job_number,title,client_id,division,region,status,job_type,site_address)
    values ($1,'Fixture Job',$2,'Water','South','active','drilling','Fixture Site') returning id,job_number`, [`TEST-${suffix}`, client.id])).rows[0];
  const rig = (await pool.query(`insert into public.equipment(equipment_code,name,equipment_type,division,region,status)
    values ($1,'Fixture Rig','rig','Water','South','available') returning id,equipment_code`, [`TEST-${suffix}`])).rows[0];
  return { users, client, job, rig, async cleanup() {
    if ((await pool.query("select to_regclass('jobs_app.daily_logs') as table_name")).rows[0].table_name) await pool.query('delete from jobs_app.daily_logs where owner_user_id = any($1::uuid[])', [users.map(u => u.id)]);
    await pool.query('delete from public.planner_assignments where equipment_id=$1', [rig.id]);
    await pool.query('delete from public.equipment where id=$1', [rig.id]);
    await pool.query('delete from public.jobs where id=$1', [job.id]);
    await pool.query('delete from public.clients where id=$1', [client.id]);
    await pool.query('delete from public.app_users where id=any($1::uuid[])', [users.map(u => u.id)]);
  } };
}
