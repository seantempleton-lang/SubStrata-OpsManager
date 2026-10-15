import React, { useCallback, useEffect, useRef, useState } from 'react';
import { COLORS } from '../appData.js';
import DailyWorkSummary from '../components/DailyWorkSummary.jsx';
import WorkCorrectionEditor, { correctionDraft, correctionValues } from '../components/WorkCorrectionEditor.jsx';
import { applyWorkCorrections, correctionLabel } from '../domain/reviewWork.js';

async function request(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json();
  if (!response.ok) throw Object.assign(new Error(body.error || 'Daily log review failed.'), { status: response.status });
  return body;
}
const time = value => value ? new Date(value).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland', dateStyle: 'medium', timeStyle: 'short' }) : 'Not recorded';
const stateLabel = value => value?.replaceAll('_', ' ') || '';
const button = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.white, cursor: 'pointer', fontWeight: 600 };
const card = { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18 };
function RecordedDetails({ value }) {
  if (value == null) return <span>Not recorded</span>;
  if (Array.isArray(value)) return <ol>{value.map((entry, index) => <li key={index}><RecordedDetails value={entry} /></li>)}</ol>;
  if (typeof value === 'object') return <dl>{Object.entries(value).filter(([key]) => !['id', 'contractVersion'].includes(key)).map(([key, entry]) => <div key={key}><dt style={{ fontWeight: 600 }}>{key.replace(/([A-Z])/g, ' $1').replaceAll('_', ' ')}</dt><dd><RecordedDetails value={entry} /></dd></div>)}</dl>;
  return <span>{typeof value === 'boolean' ? value ? 'Yes' : 'No' : String(value)}</span>;
}

export default function DailyLogReviewsScreen({ regionFilter = 'all', divisionFilter = { Water: true, Geotech: true }, initialLogId = null, initialRevision = null, sourceOnly = false, onReviewPendingChange = null, onReviewSaved = null, onClose = null }) {
  const [list, setList] = useState({ logs: [], total: 0 });
  const [status, setStatus] = useState('pending'), [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null), [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false), [loading, setLoading] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [comment, setComment] = useState('');
  const [editWork, setEditWork] = useState(null);
  const actionRequest = useRef(null), actionLock = useRef(false), selectionVersion = useRef(0), inboxVersion = useRef(0);
  useEffect(() => { onReviewPendingChange?.(Boolean(editWork || comment.trim() || busy || actionRequest.current)); }, [editWork, comment, busy, loading, detail, onReviewPendingChange]);
  const divisions = Object.keys(divisionFilter).filter(d => divisionFilter[d]).join(',');
  const refresh = useCallback(async () => {
    const version = ++inboxVersion.current;
    setLoading(true);
    try { const result = await request(`/api/daily-log-reviews?status=${status}&page=${page}&region=${regionFilter}&divisions=${divisions}`); if (version === inboxVersion.current) { setList(result); setError(''); } }
    catch (failure) { if (version === inboxVersion.current) setError(failure.message); }
    finally { if (version === inboxVersion.current) setLoading(false); }
  }, [status, page, regionFilter, divisions]);
  useEffect(() => { setPage(1); }, [regionFilter, divisions]);
  useEffect(() => { if (!sourceOnly) refresh(); }, [refresh, sourceOnly]);
  async function open(id, revision = null, discard = false) {
    if (actionLock.current) return;
    if (selected && (comment.trim() || editWork || actionRequest.current) && !discard) { setError('Complete or close the current review before choosing another record or revision. Your comment and corrections are retained.'); return; }
    const version = ++selectionVersion.current;
    setSelected(id); setLoading(true);
    try {
      const data = await request(`/api/daily-log-reviews/${id}${revision ? `?revision=${revision}` : ''}`);
      if (version !== selectionVersion.current) return;
      setDetail(data); setComment(''); setEditWork(null); actionRequest.current = null; setError(''); setNotice('');
    } catch (failure) { if (version === selectionVersion.current) { setDetail(null); setError(failure.message); } }
    finally { if (version === selectionVersion.current) setLoading(false); }
  }
  useEffect(() => { if (initialLogId) open(initialLogId, initialRevision); }, [initialLogId, initialRevision]);
  async function act(action) {
    if (actionLock.current || !detail?.canReview) return;
    if (action === 'return' && !comment.trim()) { setError('Add a correction comment before returning this log.'); return; }
    const values = { action, baseRevision: detail.serverRevision, documentRevision: detail.currentDocumentRevision, comment: comment.trim() || null };
    if (action === 'correct_and_lock') {
      if (!comment.trim()) { setError('Enter a reason for the supervisor corrections.'); return; }
      try { values.corrections = correctionValues(detail.snapshot, editWork); applyWorkCorrections(detail.snapshot, values.corrections); }
      catch (failure) { setError(failure.message); return; }
    }
    const identity = JSON.stringify({ id: detail.id, ...values });
    // Reuse the exact request after a lost response. A changed action gets a new ID.
    if (!actionRequest.current || actionRequest.current.identity !== identity) actionRequest.current = { identity, requestId: crypto.randomUUID() };
    actionLock.current = true; setBusy(true); setError(''); setNotice('');
    let committed = false;
    try {
      await request(`/api/daily-log-reviews/${detail.id}/actions`, { method: 'POST', body: JSON.stringify({ ...values, requestId: actionRequest.current.requestId }) });
      committed = true; actionRequest.current = null; setComment(''); setEditWork(null); onReviewSaved?.();
      setDetail(await request(`/api/daily-log-reviews/${detail.id}`));
      setNotice(action === 'return' ? 'Returned to the driller with your correction comment.' : 'Reviewed work locked. Available for project invoice preparation.');
      if (!sourceOnly) await refresh();
    } catch (failure) {
      setError(committed ? `The review action was saved, but the detail could not refresh: ${failure.message}. Reload the saved state.` : `${failure.message} Your comment and corrections are retained. Retry the same action if its response was interrupted, or reload the latest state.`);
      if (committed) setDetail(current => ({ ...current, canReview: false }));
    } finally { setBusy(false); actionLock.current = false; }
  }
  const visible = list.logs.filter(l => (regionFilter === 'all' || l.region === regionFilter) && (!l.division || divisionFilter[l.division]));
  const log = detail?.snapshot;
  return <div className="daily-log-reviews" style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13, lineHeight: 1.5, color: COLORS.textPrimary }}>
    <style>{`.daily-log-reviews h2 {font-size:18px;line-height:1.3}.daily-log-reviews h3 {font-size:14px;margin:18px 0 6px}.daily-log-reviews p {margin:6px 0 10px}.daily-log-reviews td {border-top:1px solid ${COLORS.border};padding:10px 8px}.daily-log-reviews th {font-size:11px;color:${COLORS.textSecondary};text-transform:uppercase;letter-spacing:.03em}.daily-log-reviews a {color:${COLORS.blue};text-decoration:none}.daily-log-reviews button:disabled {cursor:default;opacity:.55}.daily-log-reviews dt {text-transform:capitalize}`}</style>
    {!sourceOnly && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
      <div><h1 style={{ margin: 0, fontSize: 24 }}>Daily Logs</h1><p style={{ color: COLORS.textSecondary }}>Review submitted work. Pending submissions remain visible until reviewed.</p></div>
      <div style={{ display: 'flex', gap: 8 }}><label>Status <select aria-label="Review status" value={status} disabled={busy} onChange={e => { setStatus(e.target.value); setPage(1); }} style={button}>{['pending', 'all', 'approved', 'returned', 'awaiting_driller_confirmation', 'reopened'].map(s => <option key={s} value={s}>{stateLabel(s)}</option>)}</select></label><button style={button} disabled={busy || loading} onClick={refresh}>Refresh inbox</button></div>
    </div>}
    {error && <div role="alert" style={{ ...card, color: COLORS.red }}>{error}</div>}
    {notice && <div role="status" style={{ ...card, color: COLORS.green }}>{notice}</div>}
    {!sourceOnly && <div style={{ ...card, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}><thead><tr>{['Job / rig', 'Driller', 'Shift (NZ)', 'Division', 'Revision', 'Status', ''].map(t => <th key={t} style={{ textAlign: 'left', padding: 8 }}>{t}</th>)}</tr></thead><tbody>
        {visible.map(l => <tr key={l.id}><td style={{ padding: 8 }}>{l.jobNumber || 'Ancillary'} · {l.rig || 'No rig'}<div style={{ color: COLORS.textMuted }}>{l.title}</div></td><td>{l.ownerName}</td><td>{time(l.startedAt)}</td><td>{l.division || 'Shared'} {l.region}</td><td>{l.documentRevision}</td><td>{stateLabel(l.status)}</td><td><button style={button} disabled={busy} onClick={() => open(l.id)}>Review log</button></td></tr>)}
      </tbody></table>
      {!visible.length && <p>{loading ? 'Loading daily logs…' : 'No logs match this status and the current filters.'}</p>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><button style={button} disabled={busy || page === 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page} · {list.total} records</span><button style={button} disabled={busy || page * 50 >= list.total} onClick={() => setPage(p => p + 1)}>Next</button></div>
    </div>}
    {log && <section style={card} aria-label="Submitted daily log detail">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><h2 style={{ marginTop: 0 }}>{log.officeCorrection?.documentRevision === detail.selectedDocumentRevision ? 'Supervisor-corrected' : 'Submitted'} revision {detail.selectedDocumentRevision} · {log.job?.jobNumber || 'Ancillary workday'}</h2><button style={button} disabled={busy} onClick={() => { selectionVersion.current++; setDetail(null); setSelected(null); setComment(''); setEditWork(null); actionRequest.current = null; setError(''); onClose?.(); }}>Close review (discard edits)</button></div>
      <p><strong>{stateLabel(detail.status)}</strong> · Owner: {log.owner?.displayName} · Server version {detail.serverRevision}</p>
      <label>Document revision <select aria-label="Document revision" value={detail.selectedDocumentRevision} disabled={busy} onChange={e => open(detail.id, Number(e.target.value))} style={button}>{detail.revisions.map(r => <option key={r.revision} value={r.revision}>{r.revision} · {time(r.created_at)}</option>)}</select></label>
      <p>Actual log: {log.division || 'Shared'} · {log.job?.title} · {log.equipment?.equipmentCode}<br />Shift: {time(log.shift?.startedAt)} → {time(log.shift?.endedAt)}</p>
      {detail.assignment && <p>Current plan: {detail.assignment.division}, {detail.assignment.region} · {detail.assignment.start_date} → {detail.assignment.end_date}. The submitted work below is its recorded revision.</p>}
      <DailyWorkSummary log={log} />
      {log.officeCorrection && <details open><summary>Supervisor corrections from revision {log.officeCorrection.sourceDocumentRevision}</summary><p>{log.officeCorrection.reviewerName} · {time(log.officeCorrection.correctedAt)} · {log.officeCorrection.reason}</p>{log.officeCorrection.changes.map((change, i) => <p key={i}>{correctionLabel(log, change.path)}: {String(change.before ?? 'Not recorded')} → {String(change.after ?? 'Not recorded')}</p>)}</details>}
      <h3>Actual attendance</h3>{(log.crew || []).map(p => <p key={p.id}>{p.displayNameSnapshot}: {time(p.attendedFrom)} → {time(p.attendedTo)}</p>)}
      <h3>Activities</h3>{(log.activities || []).map(a => <p key={a.id}>{time(a.startedAt)} → {time(a.endedAt)} · {a.activityLabelSnapshot}<br />{a.notes}{a.allocation && <small style={{ display: 'block' }}>Allocation: {a.allocation.type === 'job' ? a.allocation.jobNumber : a.allocation.ancillaryCode}</small>}</p>)}
      <h3>Points and quantities</h3>{(log.points || []).map(p => <div key={p.id}><p>{p.pointId}: {p.startDepthM ?? '—'} → {p.endDepthM ?? '—'} m · {p.endStatus}</p>{p.dailyDetails && <details><summary>Daily bore details</summary><RecordedDetails value={p.dailyDetails} /></details>}</div>)}
      {(log.items || []).map(i => <p key={i.id}>{i.itemLabelSnapshot}: {i.quantity} {i.unit} · {i.notes}</p>)}
      {log.setup && <details><summary>Bore/setup details</summary>{Object.entries(log.setup).map(([k, v]) => <p key={k}>{k}: {String(v ?? '')}</p>)}</details>}
      <h3>Comments</h3><p style={{ whiteSpace: 'pre-wrap' }}>{log.notes || 'No daily comments.'}</p>
      {log.logType === 'rig_shift' && <details><summary>Client acknowledgement and existing output</summary><p>{log.clientAcknowledgement?.status?.replaceAll('_', ' ')} · {log.clientAcknowledgement?.signerName || log.clientAcknowledgement?.reasonCode?.replaceAll('_', ' ') || 'No client signature'}</p><p>{detail.signatureCovered ? 'Signature covers this submitted revision.' : 'This revision has no covering client signature.'}</p>{detail.revisions.find(r => r.revision === detail.selectedDocumentRevision)?.pdf_state ? <><a style={{ ...button, display: 'inline-block' }} href={`/api/daily-log-reviews/${detail.id}/revisions/${detail.selectedDocumentRevision}/pdf`} target="_blank" rel="noreferrer">Preview submitted draft PDF</a><p style={{ color: COLORS.textMuted }}>Draft PDF status: {detail.revisions.find(r => r.revision === detail.selectedDocumentRevision)?.pdf_state}.</p></> : <p>No client PDF for this internal revision. Earlier submissions retain their existing output.</p>}</details>}
      {detail.canReview && <div style={{ paddingTop: 16 }}>
        {detail.selfReview && <p style={{ color: COLORS.amberDark }}>You are reviewing your own log. Self-review will be recorded in the audit history.</p>}
        {editWork ? <WorkCorrectionEditor log={log} value={editWork} onChange={setEditWork} disabled={busy} /> : <button style={button} disabled={busy || loading} onClick={() => setEditWork(correctionDraft(log))}>Correct recorded work</button>}
        <label style={{ display: 'block' }}>Review comment / correction reason (required for corrections or Return)<textarea aria-label="Review comment" value={comment} maxLength={4000} disabled={busy} onChange={e => setComment(e.target.value)} style={{ display: 'block', width: '100%', minHeight: 80, margin: '8px 0', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 8 }} /></label>
        <button style={{ ...button, background: COLORS.amber }} disabled={busy || loading} onClick={() => act(editWork ? 'correct_and_lock' : 'approve')}>{busy ? 'Saving review…' : editWork ? 'Correct and lock' : 'Lock reviewed revision'}</button>{' '}<button style={button} disabled={busy || loading || !!editWork} onClick={() => act('return')}>Return for correction / confirmation</button>
        {editWork && <button style={button} disabled={busy} onClick={() => setEditWork(null)}>Discard work corrections</button>}
      </div>}
      <button style={{ ...button, marginTop: 12 }} disabled={busy} onClick={() => open(detail.id, null, true)}>Reload latest state (discard comment and edits)</button>
      <h3>Review history</h3>{detail.actions.length ? detail.actions.map(a => <p key={a.request_id}><strong>{a.action === 'correct_and_lock' ? 'Corrected and locked' : a.action === 'approve' ? 'Locked' : 'Returned'} revision {a.document_revision}</strong> · {a.reviewer_name} · {time(a.created_at)}{a.self_review && ' · Self-review'}<br />{a.comment}</p>) : <p>No supervisor decisions yet.</p>}
    </section>}
  </div>;
}
