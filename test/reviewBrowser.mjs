// Optional disposable-database browser acceptance, invoked by reviews.integration.
import { randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';

export async function reviewBrowser({ root, pool, opsUrl, owner, supervisor, project, log }) {
  const { chromium, expect } = await import(pathToFileURL(path.join(root, 'node_modules/@playwright/test/index.mjs')));
  const tokens = {};
  for (const user of [owner, { userId: supervisor.dbId }]) {
    const account = (await pool.query(`insert into public.app_auth_accounts(user_id,login_email,password_hash)
      values($1,$2,'browser-test-only') on conflict(user_id) do update set is_active=true returning id`, [user.userId, `${randomUUID()}@test.invalid`])).rows[0];
    tokens[user.userId] = randomUUID();
    await pool.query("insert into public.app_sessions(account_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 hour')",
      [account.id, createHash('sha256').update(tokens[user.userId]).digest('hex')]);
  }
  const jobsUrl = 'http://127.0.0.1:38086';
  const jobs = spawn(process.execPath, ['server/index.mjs'], { cwd: root, env: { ...process.env, PORT: '38086', CORE_GS_SERVER: '', EMAIL_PROVIDER: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const browser = await chromium.launch({ headless: true });
  try {
    await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('Jobs browser API start timed out')), 10000); jobs.stdout.on('data', data => { if (String(data).includes('listening on port')) { clearTimeout(timer); resolve(); } }); jobs.on('error', reject); });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addCookies([{ name: 'substrata_session', value: tokens[supervisor.dbId], url: opsUrl }, { name: 'substrata_jobs_session', value: tokens[owner.userId], url: jobsUrl }]);
    const ops = await context.newPage(), field = await context.newPage();
    const errors = []; ops.on('pageerror', error => errors.push(error.message)); field.on('pageerror', error => errors.push(error.message));
    await field.goto(jobsUrl);
    await field.getByRole('button').filter({ hasText: `Job ${project.job_number} · ${log.equipment.equipmentCode}` }).filter({ hasText: '15 Oct' }).click();
    await expect(field.getByText('Submitted record · recorded work is immutable')).toBeVisible();
    await ops.goto(opsUrl);
    await ops.getByRole('button', { name: 'Daily Logs', exact: true }).click();
    await ops.getByRole('row').filter({ hasText: project.job_number }).getByRole('button', { name: 'Review log' }).click();
    await expect(ops.getByRole('region', { name: 'Work at a glance' })).toBeVisible();
    await ops.getByRole('button', { name: 'Correct recorded work', exact: true }).click();
    await ops.getByLabel(`Quantity ${log.items[0].id}`, { exact: true }).fill('7.1256');
    await ops.getByRole('button', { name: 'Correct and lock', exact: true }).click();
    await expect(ops.getByRole('alert')).toContainText('Enter a reason');
    await ops.getByLabel('Review comment', { exact: true }).fill('Browser acceptance: checked source quantities.');
    await ops.getByRole('button', { name: 'Correct and lock', exact: true }).click();
    await expect(ops.getByRole('status')).toContainText('Reviewed work locked');
    await expect(ops.getByText('Supervisor-corrected revision 2', { exact: false })).toBeVisible();
    await ops.getByLabel('Document revision', { exact: true }).selectOption('1');
    await expect(ops.getByRole('heading', { name: `Submitted revision 1 · ${project.job_number}` })).toBeVisible();
    await expect(ops.getByRole('button', { name: 'Correct recorded work', exact: true })).toHaveCount(0);
    await ops.getByRole('button', { name: 'Jobs', exact: true }).click();
    await ops.getByPlaceholder('Search jobs, clients...').fill(project.job_number);
    await ops.getByRole('row').filter({ hasText: project.job_number }).click();
    await ops.getByRole('button', { name: 'daily work', exact: true }).click();
    await expect(ops.getByRole('heading', { name: 'Reviewed daily work', exact: true })).toBeVisible();
    const cement = ops.getByRole('row').filter({ hasText: 'OTHER · Browser cement' });
    await expect(cement.getByRole('button', { name: '7.1256 bag', exact: true })).toBeVisible();
    await cement.getByRole('button', { name: '7.1256 bag', exact: true }).click();
    await expect(ops.getByRole('heading', { name: 'Contribution source · revision 2', exact: true })).toBeVisible();
    await expect(ops.getByText(`entry ${log.items[0].id}`, { exact: false })).toBeVisible();
    await ops.getByRole('button', { name: 'Close review (discard edits)', exact: true }).click();
    await expect(ops.getByRole('heading', { name: 'Contribution source · revision 2', exact: true })).toHaveCount(0);
    await cement.getByRole('button', { name: '7.1256 bag', exact: true }).click();
    await expect(ops.getByRole('heading', { name: `Supervisor-corrected revision 2 · ${project.job_number}`, exact: true })).toBeVisible();
    await field.reload();
    // The persisted editor may reopen directly after reload.
    if (await field.getByRole('button').filter({ hasText: `Job ${project.job_number} · ${log.equipment.equipmentCode}` }).count())
      await field.getByRole('button').filter({ hasText: `Job ${project.job_number} · ${log.equipment.equipmentCode}` }).filter({ hasText: '15 Oct' }).click();
    // Navigate to the review from the saved active record, then reconcile Jobs.
    await field.getByRole('button', { name: 'Review completed shift', exact: true }).click();
    await expect(field.getByText('Supervisor-corrected work · revision 2')).toBeVisible();
    await expect(field.getByText('Browser acceptance: checked source quantities.', { exact: false })).toBeVisible();
    await fs.mkdir('test-results/review-browser', { recursive: true });
    await ops.screenshot({ path: 'test-results/review-browser/project-source.png', fullPage: true });
    await field.screenshot({ path: 'test-results/review-browser/jobs-correction.png', fullPage: true });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
    if (jobs.exitCode === null) { const exited = once(jobs, 'exit'); jobs.kill(); await exited; }
  }
}
