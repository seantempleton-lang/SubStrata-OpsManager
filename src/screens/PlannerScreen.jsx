import React, { useMemo, useRef, useState } from "react";
import {
  COLORS,
  eqStatusCfg,
} from "../appData.js";
import { Icon } from "../components/ui.jsx";
import { nzToday, calendarDate, localDateString as toDateStr, shiftDate, dateNumber, resolveCrew, plannerConflicts } from '../data/planner.js';
import PlannerAssignmentForm, { assignmentDraft, newAssignment } from './PlannerAssignmentForm.jsx';
const addDays = (value, days) => calendarDate(shiftDate(value, days));

function getRigBars(plannerJobs, jobDates, rigId, includeDowntime = true) {
  return plannerJobs
    .map((plannerJob) => ({
      ...plannerJob,
      ...jobDates[plannerJob.id],
    }))
    .filter((plannerJob) => plannerJob.rigId === rigId && (includeDowntime || !plannerJob.isDowntime));
}

export default function PlannerScreen({
  jobs = [],
  equipment = [],
  plannerJobs = [],
  staff = [],
  leaveApplications = [],
  currentUser,
  onSaveAssignment,
  regionFilter = "all",
  divisionFilter = { Water: true, Geotech: true },
}) {
  const today = useMemo(() => calendarDate(nzToday()), []);
  const [offsetWeeks, setOffsetWeeks] = useState(-2);
  const [viewMode, setViewMode] = useState("gantt");
  const [jobDates, setJobDates] = useState({});
  const [dragging, setDragging] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [selectedBar, setSelectedBar] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const canEdit = ['Supervisor', 'Administrator', 'SuperUser'].includes(currentUser?.appRole);
  const savedSelection = plannerJobs.find(a => a.id === selectedBar);
  const canResize = canEdit && !saving && draft && !draft.unresolved.length && savedSelection &&
    JSON.stringify(draft) === JSON.stringify(assignmentDraft(savedSelection, staff));

  function selectAssignment(id) {
    if (savingRef.current) return;
    if (draft && draft.id !== id) {
      setStatus({ message: 'Save or close the open editor before selecting another assignment.' });
      return;
    }
    const assignment = plannerJobs.find(a => a.id === id);
    setSelectedBar(id);
    setDraft(current => current || assignmentDraft(assignment, staff));
    setTooltip(null);
  }

  async function saveAssignment(input) {
    if (!canEdit || savingRef.current) return;
    if (input.unresolved.length) { setStatus({ error: true, message: 'Resolve legacy crew in the assignment editor before saving.' }); return; }
    savingRef.current = true;
    setSaving(true);
    setStatus({ message: 'Saving assignment…' });
    try {
      const { saved, refreshWarning } = await onSaveAssignment(input.id, { ...input, jobId: input.jobId || null });
      setDraft(assignmentDraft(saved, staff));
      setSelectedBar(saved.id);
      setStatus({ message: refreshWarning || 'Assignment saved.' });
    } catch (error) {
      setDraft(input);
      setStatus({ error: true, stale: error.status === 409, message: `${error.message} Your edits are retained in the editor.` });
    } finally {
      setJobDates({});
      setSaving(false);
      savingRef.current = false;
    }
  }

  async function reloadAssignment() {
    try {
      const response = await fetch('/api/bootstrap', { credentials: 'same-origin' });
      if (!response.ok) throw new Error('Unable to reload saved assignment. Try again.');
      const latest = await response.json();
      const saved = latest.plannerJobs.find(a => a.id === draft.id);
      if (!saved) throw new Error('Assignment no longer exists. Close the editor to continue.');
      setDraft(assignmentDraft(saved, latest.staff));
      setStatus({ message: 'Latest saved assignment loaded.' });
    } catch (error) { setStatus({ error: true, stale: true, message: error.message }); }
  }

  const visibleWeeks = 20;
  const dayWidth = 28;
  const rowHeight = 72;
  const labelWidth = 220;

  const viewStart = addDays(toDateStr(today), offsetWeeks * 7);
  const totalDays = visibleWeeks * 7;
  const weeks = Array.from({ length: visibleWeeks }, (_, index) =>
    addDays(toDateStr(viewStart), index * 7),
  );
  const gridWidth = totalDays * dayWidth;
  const todayX = (dateNumber(toDateStr(today)) - dateNumber(toDateStr(viewStart))) * dayWidth;

  const filteredRigs = equipment
    .filter((rig) => rig.type === "rig")
    .filter((rig) => {
      if (regionFilter !== "all" && rig.region !== regionFilter) return false;
      if (rig.division && !divisionFilter[rig.division]) return false;
      return true;
    });

  const monthViewStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const monthViewEnd = new Date(today.getFullYear(), today.getMonth() + 3, 0);
  const months = [];
  for (let month = new Date(monthViewStart); month <= monthViewEnd; month.setMonth(month.getMonth() + 1)) {
    months.push(new Date(month.getFullYear(), month.getMonth(), 1));
  }

  const dateToX = dateStr => (dateNumber(dateStr) - dateNumber(toDateStr(viewStart))) * dayWidth;
  const assignments = plannerJobs.map(a => ({ ...a, ...jobDates[a.id] }));
  const conflicts = plannerConflicts(assignments, staff, leaveApplications,
    viewMode === 'gantt' ? toDateStr(viewStart) : toDateStr(monthViewStart),
    viewMode === 'gantt' ? shiftDate(toDateStr(viewStart), totalDays - 1) : toDateStr(monthViewEnd))
    .filter(w => w.ids.some(id => assignments.some(a => a.id === id && filteredRigs.some(r => r.id === a.rigId))));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: COLORS.textPrimary,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Planner
          </h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>
            Rig scheduling - {filteredRigs.length} rig{filteredRigs.length !== 1 ? "s" : ""} shown
            {regionFilter !== "all" && (
              <span style={{ color: COLORS.amber, fontWeight: 700 }}> - {regionFilter}</span>
            )}

            {conflicts.length > 0 && (
              <span style={{ color: COLORS.red, fontWeight: 700 }}>
                {" "}
                - {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} detected
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {canEdit && <button disabled={saving || Boolean(draft)} onClick={() => { setDraft(newAssignment(filteredRigs[0])); setStatus(null); }} style={{ padding: '7px 12px', background: COLORS.amber, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>New assignment</button>}
          <div
            style={{
              display: "flex",
              gap: 2,
              background: COLORS.bg,
              padding: 3,
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {[
              { id: "gantt", label: "Gantt" },
              { id: "month", label: "Month" },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setViewMode(view.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: viewMode === view.id ? COLORS.white : "transparent",
                  color: viewMode === view.id ? COLORS.textPrimary : COLORS.textMuted,
                  boxShadow:
                    viewMode === view.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {view.label}
              </button>
            ))}
          </div>

          {viewMode === "gantt" && (
            <>
              <button
                onClick={() => setOffsetWeeks((current) => current - 4)}
                style={{
                  padding: "7px 12px",
                  background: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.textPrimary,
                  cursor: "pointer",
                }}
              >
                Earlier
              </button>
              <button
                onClick={() => setOffsetWeeks(0)}
                style={{
                  padding: "7px 12px",
                  background: COLORS.amber,
                  border: "none",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.navy,
                  cursor: "pointer",
                }}
              >
                Today
              </button>
              <button
                onClick={() => setOffsetWeeks((current) => current + 4)}
                style={{
                  padding: "7px 12px",
                  background: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.textPrimary,
                  cursor: "pointer",
                }}
              >
                Later
              </button>
            </>
          )}
        </div>
      </div>

      {draft && <PlannerAssignmentForm key={draft.id || 'new'} draft={draft} setDraft={value => { setDraft(value); setStatus(current => current?.error ? current : { message: 'Unsaved changes.' }); }} jobs={jobs} equipment={equipment} staff={staff} assignments={plannerJobs} leave={leaveApplications} canEdit={canEdit} saving={saving} status={status} onSave={saveAssignment}
        onClose={() => { setDraft(null); setSelectedBar(null); setStatus(null); }}
        onReload={reloadAssignment} />}

      {conflicts.length > 0 && (
        <div
          style={{
            background: COLORS.redLight,
            border: `1px solid ${COLORS.red}30`,
            borderRadius: 10,
            padding: "10px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.red, marginBottom: 2 }}>
            Resource Conflicts Detected
          </div>
          {conflicts.map((conflict, index) => <div key={index} style={{ fontSize: 12, color: COLORS.red }}>{conflict.message}</div>)}
          <div style={{ fontSize: 11 }}>Warnings cover the displayed dates. Saving is allowed with conflicts.</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        {[
          { color: COLORS.blue, label: "Water" },
          { color: COLORS.teal, label: "Geotech" },
          { color: COLORS.orange, label: "Maintenance" },
          { color: "#94A3B8", label: "Completed" },
        ].map((legendItem) => (
          <div
            key={legendItem.label}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: legendItem.color,
              }}
            />
            <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
              {legendItem.label}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 2, height: 12, background: COLORS.red }} />
          <span style={{ fontSize: 12, color: COLORS.textSecondary }}>Today</span>
        </div>
        <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 8 }}>
          {canEdit ? 'Select a bar to edit; save form edits before dragging edges' : 'Select a bar to view assignment details'}
        </span>
      </div>

      {viewMode === "gantt" && (
        <div
          style={{
            background: COLORS.white,
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: labelWidth + gridWidth + 20, userSelect: "none" }}>
              <div
                style={{
                  display: "flex",
                  borderBottom: `2px solid ${COLORS.border}`,
                  position: "sticky",
                  top: 0,
                  background: COLORS.white,
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: labelWidth,
                    flexShrink: 0,
                    padding: "10px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: COLORS.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderRight: `2px solid ${COLORS.border}`,
                    background: COLORS.bg,
                  }}
                >
                  Rig
                </div>

                <div style={{ position: "relative", width: gridWidth, flexShrink: 0 }}>
                  {weeks.map((weekDate, index) => {
                    const isCurrentWeek =
                      weekDate <= today && addDays(toDateStr(weekDate), 7) > today;

                    return (
                      <div
                        key={index}
                        style={{
                          position: "absolute",
                          left: index * 7 * dayWidth,
                          width: 7 * dayWidth,
                          top: 0,
                          bottom: 0,
                          borderRight: `1px solid ${COLORS.border}`,
                          padding: "8px 6px",
                          background: isCurrentWeek ? COLORS.amberLight : "transparent",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: isCurrentWeek ? COLORS.amberDark : COLORS.textMuted,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {weekDate.toLocaleDateString("en-NZ", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {Array.from({ length: totalDays }, (_, dayIndex) => {
                    const date = addDays(toDateStr(viewStart), dayIndex);
                    const dayOfWeek = date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    return isWeekend ? (
                      <div
                        key={`header-weekend-${dayIndex}`}
                        style={{
                          position: "absolute",
                          left: dayIndex * dayWidth,
                          top: 0,
                          bottom: 0,
                          width: dayWidth,
                          background: "rgba(0,0,0,0.025)",
                          pointerEvents: "none",
                        }}
                      />
                    ) : null;
                  })}
                </div>
              </div>

              {filteredRigs.map((rig) => {
                const rigBars = getRigBars(plannerJobs, jobDates, rig.id);
                const hasConflict = conflicts.some((conflict) => conflict.rigId === rig.id);
                const status =
                  eqStatusCfg[rig.status] ??
                  {
                    label: rig.status || "Unknown",
                    color: COLORS.textMuted,
                    bg: COLORS.bg,
                  };

                return (
                  <div
                    key={rig.id}
                    style={{
                      display: "flex",
                      borderBottom: `1px solid ${COLORS.border}`,
                      minHeight: rowHeight + 32,
                      background: hasConflict ? "#FFF8F8" : COLORS.white,
                    }}
                  >
                    <div
                      style={{
                        width: labelWidth,
                        flexShrink: 0,
                        padding: "10px 16px",
                        borderRight: `2px solid ${hasConflict ? `${COLORS.red}40` : COLORS.border}`,
                        background: hasConflict ? "#FFF5F5" : COLORS.bg,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: COLORS.navyLight,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon
                            d="M12 2L8 6H4v4l-2 2v8h20v-8l-2-2V6h-4L12 2z M8 14h8 M12 6v8"
                            size={14}
                            color={COLORS.amber}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary }}>
                            {rig.name}
                          </div>
                          <div style={{ fontSize: 10, color: COLORS.textMuted }}>
                            {rig.category || rig.division}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            padding: "1px 6px",
                            borderRadius: 8,
                            fontSize: 9,
                            fontWeight: 700,
                            color: status.color,
                            background: status.bg,
                          }}
                        >
                          {status.label}
                        </span>
                        <span style={{ fontSize: 10, color: COLORS.textMuted }}>{rig.region}</span>
                        {hasConflict && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: COLORS.red,
                              background: COLORS.redLight,
                              padding: "1px 6px",
                              borderRadius: 6,
                            }}
                          >
                            CONFLICT
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ position: "relative", flex: 1, minHeight: rowHeight + 32 }}>
                      {Array.from({ length: totalDays }, (_, dayIndex) => {
                        const date = addDays(toDateStr(viewStart), dayIndex);
                        const dayOfWeek = date.getDay();
                        return dayOfWeek === 0 || dayOfWeek === 6 ? (
                          <div
                            key={`body-weekend-${rig.id}-${dayIndex}`}
                            style={{
                              position: "absolute",
                              left: dayIndex * dayWidth,
                              top: 0,
                              bottom: 0,
                              width: dayWidth,
                              background: "rgba(0,0,0,0.025)",
                              pointerEvents: "none",
                            }}
                          />
                        ) : null;
                      })}

                      {weeks.map((_, index) => (
                        <div
                          key={`week-line-${rig.id}-${index}`}
                          style={{
                            position: "absolute",
                            left: index * 7 * dayWidth,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            background: COLORS.border,
                          }}
                        />
                      ))}

                      {todayX >= 0 && todayX <= gridWidth && (
                        <div
                          style={{
                            position: "absolute",
                            left: todayX,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            background: COLORS.red,
                            opacity: 0.7,
                            zIndex: 5,
                          }}
                        />
                      )}

                      {rigBars.map((plannerJob) => {
                        const barStart = Math.max(0, dateToX(plannerJob.start));
                        const barEnd = Math.min(gridWidth, (dateToX(plannerJob.end) + dayWidth));
                        const barWidth = barEnd - barStart;

                        if (barWidth <= 0) return null;

                        const isSelected = selectedBar === plannerJob.id;
                        const isConflicted = conflicts.some(c => c.ids.includes(plannerJob.id));
                        const barLabel =
                          plannerJob.isDowntime
                            ? plannerJob.label || "Maintenance"
                            : plannerJob.jobId || plannerJob.label || plannerJob.client;

                        return (
                          <div
                            key={plannerJob.id}
                            data-assignment-id={plannerJob.id}
                            aria-label={`Assignment ${plannerJob.jobId || plannerJob.title}`}
                            onMouseEnter={(event) =>
                              setTooltip({
                                job: plannerJob,
                                x: event.clientX,
                                y: event.clientY,
                              })
                            }
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() =>
                              selectAssignment(plannerJob.id)
                            }
                            style={{
                              position: "absolute",
                              left: barStart,
                              top: 10,
                              height: rowHeight - 20,
                              width: barWidth - 2,
                              borderRadius: 6,
                              background: plannerJob.color,
                              cursor: "pointer",
                              overflow: "visible",
                              boxShadow: isSelected
                                ? `0 0 0 3px ${COLORS.amber}, 0 4px 12px rgba(0,0,0,0.2)`
                                : isConflicted
                                  ? `0 0 0 2px ${COLORS.red}`
                                  : "0 2px 4px rgba(0,0,0,0.15)",
                              zIndex: isSelected ? 10 : 3,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              padding: "0 8px",
                            }}
                          >
                            {isSelected && canResize && (
                              <>
                                <div
                                  role="button" aria-label="Resize start"
                                  onMouseDown={(event) => {
                                    event.stopPropagation();
                                    setDragging({
                                      index: plannerJob.id,
                                      source: plannerJob,
                                      edge: "start",
                                      startX: event.clientX,
                                      origStart: plannerJob.start,
                                      origEnd: plannerJob.end,
                                    });
                                  }}
                                  style={{
                                    position: "absolute",
                                    left: -4,
                                    top: "20%",
                                    height: "60%",
                                    width: 8,
                                    background: COLORS.white,
                                    borderRadius: 3,
                                    cursor: "ew-resize",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                                    zIndex: 20,
                                  }}
                                />
                                <div
                                  role="button" aria-label="Resize end"
                                  onMouseDown={(event) => {
                                    event.stopPropagation();
                                    setDragging({
                                      index: plannerJob.id,
                                      source: plannerJob,
                                      edge: "end",
                                      startX: event.clientX,
                                      origStart: plannerJob.start,
                                      origEnd: plannerJob.end,
                                    });
                                  }}
                                  style={{
                                    position: "absolute",
                                    right: -4,
                                    top: "20%",
                                    height: "60%",
                                    width: 8,
                                    background: COLORS.white,
                                    borderRadius: 3,
                                    cursor: "ew-resize",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                                    zIndex: 20,
                                  }}
                                />
                              </>
                            )}

                            {barWidth > 80 && (
                              <>
                                <div
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: COLORS.white,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {barLabel}
                                </div>
                                {!plannerJob.isDowntime && barWidth > 130 && (
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "rgba(255,255,255,0.85)",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {plannerJob.client}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}

                      {rigBars
                        .filter((plannerJob) => !plannerJob.isDowntime)
                        .map((plannerJob) => {
                          const barStart = Math.max(0, dateToX(plannerJob.start));
                          const barWidth =
                            Math.min(gridWidth, (dateToX(plannerJob.end) + dayWidth)) - barStart;

                          if (barWidth <= 0 || !plannerJob.personnel?.length) return null;

                          return (
                            <div
                              key={`personnel-${plannerJob.id}`}
                              style={{
                                position: "absolute",
                                left: barStart + 4,
                                top: rowHeight - 4,
                                display: "flex",
                                gap: 4,
                                zIndex: 4,
                              }}
                            >
                              {resolveCrew(plannerJob.personnel, staff).map((ref, crewIndex) => {
                                const name = ref.label + (ref.person ? '' : ' (unresolved)');
                                const [firstName, lastName] = name.split(' ');
                                return (
                                  <span
                                    key={crewIndex} title={name}
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      color: COLORS.textSecondary,
                                      background: COLORS.white,
                                      border: `1px solid ${COLORS.border}`,
                                      borderRadius: 8,
                                      padding: "1px 6px",
                                      whiteSpace: "nowrap",
                                      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                                    }}
                                  >
                                    {ref.person ? `${firstName} ${lastName?.[0] || ''}` : name}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {viewMode === "month" && (
        <div
          style={{
            background: COLORS.white,
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {months.map((monthStart) => {
            const monthEnd = new Date(
              monthStart.getFullYear(),
              monthStart.getMonth() + 1,
              0,
            );
            const daysInMonth = monthEnd.getDate();
            const firstDayOfWeek = (monthStart.getDay() + 6) % 7;
            const cells = Array.from(
              {
                length: Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7,
              },
              (_, index) => {
                const dayNumber = index - firstDayOfWeek + 1;
                if (dayNumber < 1 || dayNumber > daysInMonth) return null;
                return new Date(monthStart.getFullYear(), monthStart.getMonth(), dayNumber);
              },
            );

            const monthBars = filteredRigs.flatMap((rig) =>
              getRigBars(plannerJobs, jobDates, rig.id).filter(
                (plannerJob) =>
                  plannerJob.start <= toDateStr(monthEnd) &&
                  plannerJob.end >= toDateStr(monthStart),
              ),
            );

            return (
              <div key={monthStart.toISOString()} style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                <div
                  style={{
                    padding: "10px 16px",
                    background: COLORS.bg,
                    fontWeight: 800,
                    fontSize: 14,
                    color: COLORS.textPrimary,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {monthStart.toLocaleDateString("en-NZ", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayLabel) => (
                    <div
                      key={dayLabel}
                      style={{
                        padding: "6px 4px",
                        textAlign: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: COLORS.textMuted,
                        textTransform: "uppercase",
                        background: COLORS.bg,
                        borderRight: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {dayLabel}
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {cells.map((date, index) => {
                    const isToday = date && toDateStr(date) === toDateStr(today);
                    const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6);
                    const dayBars = date
                      ? monthBars.filter(
                          (plannerJob) =>
                            plannerJob.start <= toDateStr(date) &&
                            plannerJob.end >= toDateStr(date),
                        )
                      : [];

                    return (
                      <div
                        key={index}
                        style={{
                          minHeight: 80,
                          padding: "4px",
                          borderRight: `1px solid ${COLORS.border}`,
                          borderBottom: `1px solid ${COLORS.border}`,
                          background: !date
                            ? COLORS.bg
                            : isWeekend
                              ? "#FAFBFC"
                              : COLORS.white,
                          position: "relative",
                        }}
                      >
                        {date && (
                          <>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: isToday ? 800 : 500,
                                color: isToday ? COLORS.white : isWeekend ? COLORS.textMuted : COLORS.textPrimary,
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: isToday ? COLORS.amber : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 3,
                              }}
                            >
                              {date.getDate()}
                            </div>

                            {dayBars.slice(0, 3).map((bar, barIndex) => (
                              <div
                                key={bar.id}
                                onClick={() => selectAssignment(bar.id)}
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: COLORS.white,
                                  background: bar.color,
                                  borderRadius: 3,
                                  padding: "1px 4px",
                                  marginBottom: 2,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {bar.isDowntime
                                  ? bar.label || "Maint."
                                  : bar.jobId || bar.client || bar.label}
                              </div>
                            ))}

                            {dayBars.length > 3 && (
                              <div style={{ fontSize: 9, color: COLORS.textMuted }}>
                                +{dayBars.length - 3}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            background: COLORS.navy,
            color: COLORS.white,
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 12,
            zIndex: 1000,
            pointerEvents: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            maxWidth: 260,
            border: `1px solid ${COLORS.navyBorder}`,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 13,
              color: COLORS.amber,
              marginBottom: 4,
            }}
          >
            {tooltip.job.isDowntime
              ? tooltip.job.label || "Maintenance"
              : tooltip.job.jobId || tooltip.job.client}
          </div>
          {tooltip.job.client && (
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.job.client}</div>
          )}
          {tooltip.job.site && (
            <div style={{ color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
              {tooltip.job.site}
            </div>
          )}
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            {tooltip.job.start} - {tooltip.job.end}
          </div>
          {tooltip.job.personnel?.length > 0 && (
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: 6,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 3,
                  textTransform: "uppercase",
                }}
              >
                Personnel
              </div>
              {resolveCrew(tooltip.job.personnel, staff).map((ref, index) => (
                <div
                  key={index}
                  style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}
                >
                  {ref.label}{!ref.person && ' (unresolved)'}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {dragging && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 999, cursor: "ew-resize" }}
          onMouseMove={(event) => {
            const deltaX = event.clientX - dragging.startX;
            const daysDelta = Math.round(deltaX / dayWidth);

            const current = jobDates[dragging.index] || { start: dragging.origStart, end: dragging.origEnd };
            const next = shiftDate(dragging.edge === 'start' ? dragging.origStart : dragging.origEnd, daysDelta);
            const updated = { ...current, [dragging.edge]: next };
            if (updated.start <= updated.end) setJobDates({ [dragging.index]: updated });
          }}
          onMouseUp={() => {
            const dates = jobDates[dragging.index];
            const source = dragging.source;
            setDragging(null);
            setJobDates({});
            if (!dates || (dates.start === source.start && dates.end === source.end)) return;
            const input = { ...(draft || assignmentDraft(source, staff)), ...dates };
            setDraft(input);
            saveAssignment(input);
          }}
        />
      )}

    </div>
  );
}
