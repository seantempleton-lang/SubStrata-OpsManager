import React, { useState } from 'react';
import { COLORS } from '../appData.js';
import { nzToday, resolveCrew, plannerConflicts } from '../data/planner.js';

export function assignmentDraft(assignment, staff) {
  const resolved = resolveCrew(assignment.personnel, staff);
  return { id: assignment.id, version: assignment.version, equipmentId: assignment.equipmentId,
    jobId: assignment.jobDbId || '', assignmentType: assignment.assignmentType,
    title: assignment.title || assignment.label || '', start: assignment.start, end: assignment.end,
    color: assignment.color, crewUserIds: [...new Set(resolved.filter(r => r.person).map(r => r.person.dbId))],
    unresolved: resolved.filter(r => !r.person).map(r => r.label) };
}

export function newAssignment(rig) {
  return { id: null, equipmentId: rig?.dbId || '', jobId: '', assignmentType: 'job', title: '',
    start: nzToday(), end: nzToday(), crewUserIds: [], unresolved: [] };
}

export default function PlannerAssignmentForm({ draft, setDraft, jobs, equipment, staff, assignments, leave, canEdit, saving, status, onSave, onClose, onReload }) {
  const [showAll, setShowAll] = useState(false);
  const rig = equipment.find(e => e.dbId === draft.equipmentId);
  const job = jobs.find(j => j.dbId === draft.jobId);
  const division = job?.division || rig?.division;
  const region = job?.region || rig?.region;
  const crew = staff.filter(p => showAll || ((!division || p.division === division) && (!region || p.region === region)) || draft.crewUserIds.includes(p.dbId));
  const change = values => setDraft(current => ({ ...current, ...values }));
  const proposed = { id: draft.id || 'draft', rigId: rig?.id, jobId: job?.id, title: draft.title,
    label: draft.title, start: draft.start, end: draft.end, personnel: draft.crewUserIds.map(userId => ({ userId })) };
  const warnings = plannerConflicts([...assignments.filter(a => a.id !== draft.id), proposed], staff, leave, draft.start, draft.end).filter(w => w.ids.includes(proposed.id));
  const control = { padding: '7px 10px', border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 13, width: '100%' };
  const field = (label, element) => <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600 }}>{label}{element}</label>;
  return <form onSubmit={event => { event.preventDefault(); onSave(draft); }} style={{ background: COLORS.white, border: `2px solid ${COLORS.amber}`, borderRadius: 12, padding: 20 }}>
    <h2 style={{ fontSize: 17, margin: '0 0 14px' }}>{draft.id ? 'Edit assignment' : 'New assignment'}</h2>
    <fieldset disabled={!canEdit || saving} style={{ border: 0, padding: 0, margin: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {field('Rig', <select required aria-label="Rig" value={draft.equipmentId} onChange={e => change({ equipmentId: e.target.value })} style={control}><option value="">Select rig</option>{equipment.filter(e => e.type === 'rig').map(e => <option key={e.dbId} value={e.dbId}>{e.name} ({e.id})</option>)}</select>)}
        {field('Assignment type', <select aria-label="Assignment type" value={draft.assignmentType} onChange={e => change({ assignmentType: e.target.value, jobId: e.target.value === 'job' ? draft.jobId : '' })} style={control}>{['job', 'maintenance', 'downtime'].map(t => <option key={t} value={t}>{t}</option>)}</select>)}
        {draft.assignmentType === 'job' && field('Job', <select required aria-label="Job" value={draft.jobId} onChange={e => { const j = jobs.find(j => j.dbId === e.target.value); change({ jobId: e.target.value, title: j?.title || '' }); }} style={control}><option value="">Select job</option>{jobs.map(j => <option key={j.dbId} value={j.dbId}>{j.id} — {j.title}</option>)}</select>)}
        {field('Title', <input required maxLength={300} aria-label="Title" value={draft.title} onChange={e => change({ title: e.target.value })} style={control} />)}
        {field('Start', <input required type="date" aria-label="Start" value={draft.start} onChange={e => change({ start: e.target.value })} style={control} />)}
        {field('End', <input required type="date" aria-label="End" min={draft.start} value={draft.end} onChange={e => change({ end: e.target.value })} style={control} />)}
      </div>
      <div style={{ marginTop: 16, fontSize: 13 }}>
        <strong>Planned crew</strong> <span style={{ color: COLORS.textMuted }}>({division || 'All divisions'}, {region || 'All regions'})</span>
        <label style={{ display: 'block', margin: '8px 0' }}><input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} /> Show all users</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {crew.map(p => <label key={p.dbId}><input type="checkbox" checked={draft.crewUserIds.includes(p.dbId)} onChange={e => change({ crewUserIds: e.target.checked ? [...draft.crewUserIds, p.dbId] : draft.crewUserIds.filter(id => id !== p.dbId) })} /> {p.name} ({p.id})</label>)}
          {!crew.length && <span>No users in this division and region. Use Show all users.</span>}
        </div>
        {draft.unresolved.length > 0 && <div role="alert" style={{ marginTop: 12, color: COLORS.red }}>
          Unresolved legacy crew: {draft.unresolved.join(', ')}. Select the correct current users, then acknowledge removal of the old references.
          <button type="button" onClick={() => change({ unresolved: [] })} style={{ ...control, width: 'auto', marginLeft: 8 }}>Remove unresolved references</button>
        </div>}
      </div>
    </fieldset>
    {warnings.length > 0 && <div role="status" style={{ background: COLORS.amberLight, padding: 10, marginTop: 12, fontSize: 12 }}><strong>Planning warnings — saving retains these conflicts:</strong>{warnings.map((w, i) => <div key={i}>{w.message}</div>)}</div>}
    {status && <p role={status.error ? 'alert' : 'status'} style={{ color: status.error ? COLORS.red : COLORS.textSecondary, fontSize: 13 }}>{status.message}</p>}
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      {canEdit && <button type="submit" disabled={saving || draft.unresolved.length > 0} style={{ ...control, width: 'auto', background: COLORS.amber, fontWeight: 700 }}>{saving ? 'Saving…' : 'Save assignment'}</button>}
      <button type="button" disabled={saving} onClick={onClose} style={{ ...control, width: 'auto' }}>{canEdit ? 'Cancel / close' : 'Close'}</button>
      {status?.stale && <button type="button" disabled={saving} onClick={onReload} style={{ ...control, width: 'auto' }}>Reload saved assignment (discard edits)</button>}
    </div>
  </form>;
}
