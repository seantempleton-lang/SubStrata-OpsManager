import React, { useState, useMemo, useEffect } from "react";
import {
  COLORS,
  JOBS,
  EQUIPMENT,
  eqStatusCfg,
  PLANNER_JOBS,
  RIGS,
  addDays,
  daysBetween,
  toDateStr,
  icons,
} from "../appData.js";
import { Icon } from "../components/ui.jsx";
const PlannerScreen = ({ regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  const today = new Date("2026-03-11");
  const [offsetWeeks, setOffsetWeeks] = useState(-2);
  const [viewMode, setViewMode] = useState("gantt"); // "gantt" | "month"
  const VISIBLE_WEEKS = 20;
  const DAY_WIDTH = 28;
  const ROW_HEIGHT = 72;
  const LABEL_WIDTH = 220;

  // Mutable job dates for interactive adjustment
  const [jobDates, setJobDates] = useState(() =>
    Object.fromEntries(PLANNER_JOBS.map((pj, i) => [i, { start: pj.start, end: pj.end }]))
  );
  const [dragging, setDragging] = useState(null); // { index, edge: "start"|"end"|"bar", startX, origStart, origEnd }
  const [tooltip, setTooltip] = useState(null);
  const [selectedBar, setSelectedBar] = useState(null);

  const viewStart = addDays(toDateStr(today), offsetWeeks * 7);
  const totalDays = VISIBLE_WEEKS * 7;

  const weeks = Array.from({ length: VISIBLE_WEEKS }, (_, i) => addDays(toDateStr(viewStart), i * 7));
  const dateToX = (dateStr) => Math.round((new Date(dateStr) - viewStart) / 86400000 * DAY_WIDTH);
  const todayX = dateToX(toDateStr(today));
  const gridWidth = totalDays * DAY_WIDTH;

  // Filter rigs by region + division
  const filteredRigs = RIGS.filter(rig => {
    if (regionFilter !== "all" && rig.region !== regionFilter) return false;
    if (rig.division && !divisionFilter[rig.division]) return false;
    return true;
  });

  // Conflict detection ? any rig with overlapping job bars
  const conflicts = [];
  filteredRigs.forEach(rig => {
    const rigBars = PLANNER_JOBS.map((pj, i) => ({ ...pj, ...jobDates[i], idx: i })).filter(pj => pj.rigId === rig.id && !pj.isDowntime);
    for (let a = 0; a < rigBars.length; a++) {
      for (let b = a + 1; b < rigBars.length; b++) {
        const aStart = new Date(rigBars[a].start), aEnd = new Date(rigBars[a].end);
        const bStart = new Date(rigBars[b].start), bEnd = new Date(rigBars[b].end);
        if (aStart < bEnd && aEnd > bStart) {
          conflicts.push({ rigId: rig.id, jobA: rigBars[a].jobId, jobB: rigBars[b].jobId });
        }
      }
    }
  });

  // Month view helpers
  const monthViewStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const monthViewEnd = new Date(today.getFullYear(), today.getMonth() + 3, 0);
  const months = [];
  for (let d = new Date(monthViewStart); d <= monthViewEnd; d.setMonth(d.getMonth() + 1)) {
    months.push(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Planner</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>
            Rig scheduling ? {filteredRigs.length} rig{filteredRigs.length !== 1 ? "s" : ""} shown
            {regionFilter !== "all" && <span style={{ color: COLORS.amber, fontWeight: 700 }}> ? {regionFilter}</span>}
            {conflicts.length > 0 && <span style={{ color: COLORS.red, fontWeight: 700 }}> ? {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} detected</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* View toggle */}
          <div style={{ display: "flex", gap: 2, background: COLORS.bg, padding: 3, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
            {[{ id: "gantt", label: "Gantt" }, { id: "month", label: "Month" }].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)}
                style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: viewMode === v.id ? COLORS.white : "transparent",
                  color: viewMode === v.id ? COLORS.textPrimary : COLORS.textMuted,
                  boxShadow: viewMode === v.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                {v.label}
              </button>
            ))}
          </div>
          {viewMode === "gantt" && <>
            <button onClick={() => setOffsetWeeks(o => o - 4)} style={{ padding: "7px 12px", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>â—€ Earlier</button>
            <button onClick={() => setOffsetWeeks(0)} style={{ padding: "7px 12px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>Today</button>
            <button onClick={() => setOffsetWeeks(o => o + 4)} style={{ padding: "7px 12px", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Later â–¶</button>
          </>}
        </div>
      </div>

      {/* Conflict alerts */}
      {conflicts.length > 0 && (
        <div style={{ background: COLORS.redLight, border: `1px solid ${COLORS.red}30`, borderRadius: 10, padding: "10px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.red, marginBottom: 2 }}>? Resource Conflicts Detected</div>
          {conflicts.map((c, i) => {
            const rig = RIGS.find(r => r.id === c.rigId);
            return (
              <div key={i} style={{ fontSize: 12, color: COLORS.red }}>
                {rig?.name.split(" ? ")[0]}: jobs <strong>{c.jobA}</strong> and <strong>{c.jobB}</strong> overlap ? adjust dates below
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        {[{ color: COLORS.blue, label: "Water" }, { color: COLORS.teal, label: "Geotech" }, { color: COLORS.orange, label: "Maintenance" }, { color: "#94A3B8", label: "Completed" }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
            <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{l.label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 2, height: 12, background: COLORS.red }} />
          <span style={{ fontSize: 12, color: COLORS.textSecondary }}>Today</span>
        </div>
        <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 8 }}>Drag bar edges to adjust dates</span>
      </div>

      {viewMode === "gantt" && (
        <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: LABEL_WIDTH + gridWidth + 20, userSelect: "none" }}>
              {/* Header */}
              <div style={{ display: "flex", borderBottom: `2px solid ${COLORS.border}`, position: "sticky", top: 0, background: COLORS.white, zIndex: 10 }}>
                <div style={{ width: LABEL_WIDTH, flexShrink: 0, padding: "10px 16px", fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", borderRight: `2px solid ${COLORS.border}`, background: COLORS.bg }}>Rig</div>
                <div style={{ position: "relative", width: gridWidth, flexShrink: 0 }}>
                  {weeks.map((wDate, i) => {
                    const isCurrentWeek = wDate <= today && addDays(toDateStr(wDate), 7) > today;
                    const mon = wDate.getDay();
                    return (
                      <div key={i} style={{ position: "absolute", left: i * 7 * DAY_WIDTH, width: 7 * DAY_WIDTH, top: 0, bottom: 0, borderRight: `1px solid ${COLORS.border}`, padding: "8px 6px", background: isCurrentWeek ? COLORS.amberLight : "transparent" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: isCurrentWeek ? COLORS.amberDark : COLORS.textMuted, whiteSpace: "nowrap" }}>
                          {wDate.toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    );
                  })}
                  {/* Day lines ? weekend shading */}
                  {Array.from({ length: totalDays }, (_, di) => {
                    const d = addDays(toDateStr(viewStart), di);
                    const dow = d.getDay();
                    const isWeekend = dow === 0 || dow === 6;
                    return isWeekend ? (
                      <div key={`dl${di}`} style={{ position: "absolute", left: di * DAY_WIDTH, top: 0, bottom: 0, width: DAY_WIDTH, background: "rgba(0,0,0,0.025)", pointerEvents: "none" }} />
                    ) : null;
                  })}
                </div>
              </div>

              {/* Rig rows */}
              {filteredRigs.map((rig) => {
                const rigBars = PLANNER_JOBS.map((pj, i) => ({ ...pj, ...jobDates[i], origIdx: i })).filter(pj => pj.rigId === rig.id);
                const hasConflict = conflicts.some(c => c.rigId === rig.id);
                const st = eqStatusCfg[rig.status];
                return (
                  <div key={rig.id} style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, minHeight: ROW_HEIGHT + 32, background: hasConflict ? "#FFF8F8" : COLORS.white }}>
                    <div style={{ width: LABEL_WIDTH, flexShrink: 0, padding: "10px 16px", borderRight: `2px solid ${hasConflict ? COLORS.red + "40" : COLORS.border}`, background: hasConflict ? "#FFF5F5" : COLORS.bg, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: COLORS.navyLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon d="M12 2L8 6H4v4l-2 2v8h20v-8l-2-2V6h-4L12 2z M8 14h8 M12 6v8" size={14} color={COLORS.amber} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary }}>{rig.name.split(" ? ")[0]}</div>
                          <div style={{ fontSize: 10, color: COLORS.textMuted }}>{rig.name.split(" ? ")[1]}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 700, color: st.color, background: st.bg }}>{st.label}</span>
                        <span style={{ fontSize: 10, color: COLORS.textMuted }}>{rig.region}</span>
                        {hasConflict && <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.red, background: COLORS.redLight, padding: "1px 6px", borderRadius: 6 }}>CONFLICT</span>}
                      </div>
                    </div>

                    <div style={{ position: "relative", flex: 1, minHeight: ROW_HEIGHT + 32 }}>
                      {/* Weekend shading */}
                      {Array.from({ length: totalDays }, (_, di) => {
                        const d = addDays(toDateStr(viewStart), di);
                        const dow = d.getDay();
                        return (dow === 0 || dow === 6) ? <div key={di} style={{ position: "absolute", left: di * DAY_WIDTH, top: 0, bottom: 0, width: DAY_WIDTH, background: "rgba(0,0,0,0.025)", pointerEvents: "none" }} /> : null;
                      })}
                      {weeks.map((_, i) => <div key={i} style={{ position: "absolute", left: i * 7 * DAY_WIDTH, top: 0, bottom: 0, width: 1, background: COLORS.border }} />)}
                      {todayX >= 0 && todayX <= gridWidth && <div style={{ position: "absolute", left: todayX, top: 0, bottom: 0, width: 2, background: COLORS.red, opacity: 0.7, zIndex: 5 }} />}

                      {/* Job bars */}
                      {rigBars.map((pj) => {
                        const barStart = Math.max(0, dateToX(pj.start));
                        const barEnd   = Math.min(gridWidth, dateToX(pj.end));
                        const barW     = barEnd - barStart;
                        if (barW <= 0) return null;
                        const isSelected = selectedBar === pj.origIdx;
                        const isConflicted = !pj.isDowntime && conflicts.some(c => c.rigId === rig.id && (c.jobA === pj.jobId || c.jobB === pj.jobId));
                        return (
                          <div key={pj.origIdx}
                            onMouseEnter={e => setTooltip({ job: pj, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() => setSelectedBar(isSelected ? null : pj.origIdx)}
                            style={{ position: "absolute", left: barStart, top: 10, height: ROW_HEIGHT - 20, width: barW - 2, borderRadius: 6,
                              background: pj.color, cursor: "pointer", overflow: "visible",
                              boxShadow: isSelected ? `0 0 0 3px ${COLORS.amber}, 0 4px 12px rgba(0,0,0,0.2)` : isConflicted ? `0 0 0 2px ${COLORS.red}` : "0 2px 4px rgba(0,0,0,0.15)",
                              zIndex: isSelected ? 10 : 3, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 8px" }}>
                            {/* Drag handles */}
                            {isSelected && (
                              <>
                                <div
                                  onMouseDown={e => { e.stopPropagation(); setDragging({ index: pj.origIdx, edge: "start", startX: e.clientX, origStart: pj.start, origEnd: pj.end }); }}
                                  style={{ position: "absolute", left: -4, top: "20%", height: "60%", width: 8, background: COLORS.white, borderRadius: 3, cursor: "ew-resize", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", zIndex: 20 }} />
                                <div
                                  onMouseDown={e => { e.stopPropagation(); setDragging({ index: pj.origIdx, edge: "end", startX: e.clientX, origStart: pj.start, origEnd: pj.end }); }}
                                  style={{ position: "absolute", right: -4, top: "20%", height: "60%", width: 8, background: COLORS.white, borderRadius: 3, cursor: "ew-resize", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", zIndex: 20 }} />
                              </>
                            )}
                            {barW > 80 && (
                              <>
                                <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {pj.isDowntime ? pj.label : pj.jobId}
                                </div>
                                {!pj.isDowntime && barW > 130 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pj.client}</div>}
                              </>
                            )}
                          </div>
                        );
                      })}

                      {/* Personnel chips */}
                      {rigBars.filter(pj => !pj.isDowntime).map(pj => {
                        const barStart = Math.max(0, dateToX(pj.start));
                        const barW = Math.min(gridWidth, dateToX(pj.end)) - barStart;
                        if (barW <= 0 || !pj.personnel?.length) return null;
                        return (
                          <div key={`p${pj.origIdx}`} style={{ position: "absolute", left: barStart + 4, top: ROW_HEIGHT - 4, display: "flex", gap: 4, zIndex: 4 }}>
                            {pj.personnel.map(name => (
                              <span key={name} style={{ fontSize: 9, fontWeight: 700, color: COLORS.textSecondary, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "1px 6px", whiteSpace: "nowrap", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
                                {name.split(" ")[0]} {name.split(" ")[1]?.[0]}.
                              </span>
                            ))}
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
        <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {months.map(monthStart => {
            const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
            const daysInMonth = monthEnd.getDate();
            const firstDow = (monthStart.getDay() + 6) % 7; // Mon=0
            const cells = Array.from({ length: Math.ceil((firstDow + daysInMonth) / 7) * 7 }, (_, i) => {
              const dayNum = i - firstDow + 1;
              if (dayNum < 1 || dayNum > daysInMonth) return null;
              return new Date(monthStart.getFullYear(), monthStart.getMonth(), dayNum);
            });
            const monthBars = filteredRigs.flatMap(rig =>
              PLANNER_JOBS.map((pj, i) => ({ ...pj, ...jobDates[i], rigName: rig.name.split(" ? ")[0] }))
                .filter(pj => pj.rigId === rig.id && new Date(pj.start) <= monthEnd && new Date(pj.end) >= monthStart)
            );

            return (
              <div key={monthStart.toISOString()} style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                <div style={{ padding: "10px 16px", background: COLORS.bg, fontWeight: 800, fontSize: 14, color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.border}` }}>
                  {monthStart.toLocaleDateString("en-NZ", { month: "long", year: "numeric" })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${COLORS.border}` }}>
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                    <div key={d} style={{ padding: "6px 4px", textAlign: "center", fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", background: COLORS.bg, borderRight: `1px solid ${COLORS.border}` }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {cells.map((date, ci) => {
                    const isToday = date && toDateStr(date) === toDateStr(today);
                    const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6);
                    const dayBars = date ? monthBars.filter(pj => new Date(pj.start) <= date && new Date(pj.end) >= date) : [];
                    return (
                      <div key={ci} style={{ minHeight: 80, padding: "4px", borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, background: !date ? COLORS.bg : isWeekend ? "#FAFBFC" : COLORS.white, position: "relative" }}>
                        {date && (
                          <>
                            <div style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: isToday ? COLORS.white : isWeekend ? COLORS.textMuted : COLORS.textPrimary, width: 20, height: 20, borderRadius: "50%", background: isToday ? COLORS.amber : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>
                              {date.getDate()}
                            </div>
                            {dayBars.slice(0, 3).map((bar, bi) => (
                              <div key={bi} style={{ fontSize: 9, fontWeight: 700, color: COLORS.white, background: bar.color, borderRadius: 3, padding: "1px 4px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {bar.isDowntime ? "Maint." : bar.jobId}
                              </div>
                            ))}
                            {dayBars.length > 3 && <div style={{ fontSize: 9, color: COLORS.textMuted }}>+{dayBars.length - 3}</div>}
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

      {/* Tooltip */}
      {tooltip && !tooltip.job.isDowntime && (
        <div style={{ position: "fixed", left: tooltip.x + 12, top: tooltip.y - 10, background: COLORS.navy, color: COLORS.white, padding: "10px 14px", borderRadius: 10, fontSize: 12, zIndex: 1000, pointerEvents: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", maxWidth: 260, border: `1px solid ${COLORS.navyBorder}` }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: COLORS.amber, marginBottom: 4 }}>{tooltip.job.jobId}</div>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.job.client}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>{tooltip.job.site}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{tooltip.job.start} ? {tooltip.job.end}</div>
          {tooltip.job.personnel?.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 6, marginTop: 6 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 3, textTransform: "uppercase" }}>Personnel</div>
              {tooltip.job.personnel.map(p => <div key={p} style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{p}</div>)}
            </div>
          )}
        </div>
      )}

      {/* Global mouse handlers for drag */}
      {dragging && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 999, cursor: "ew-resize" }}
          onMouseMove={e => {
            const dx = e.clientX - dragging.startX;
            const daysDelta = Math.round(dx / DAY_WIDTH);
            setJobDates(prev => {
              const curr = { ...prev[dragging.index] };
              if (dragging.edge === "start") {
                const newStart = new Date(dragging.origStart);
                newStart.setDate(newStart.getDate() + daysDelta);
                if (new Date(toDateStr(newStart)) < new Date(curr.end)) curr.start = toDateStr(newStart);
              } else {
                const newEnd = new Date(dragging.origEnd);
                newEnd.setDate(newEnd.getDate() + daysDelta);
                if (new Date(toDateStr(newEnd)) > new Date(curr.start)) curr.end = toDateStr(newEnd);
              }
              return { ...prev, [dragging.index]: curr };
            });
          }}
          onMouseUp={() => setDragging(null)}
        />
      )}

      {/* Selected bar date editor */}
      {selectedBar !== null && (() => {
        const pj = { ...PLANNER_JOBS[selectedBar], ...jobDates[selectedBar] };
        return (
          <div style={{ background: COLORS.white, borderRadius: 12, border: `2px solid ${COLORS.amber}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: 13 }}>
              {pj.isDowntime ? pj.label : `${pj.jobId} ? ${pj.client}`}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Start</label>
                <input type="date" value={jobDates[selectedBar].start}
                  onChange={e => setJobDates(prev => ({ ...prev, [selectedBar]: { ...prev[selectedBar], start: e.target.value } }))}
                  style={{ padding: "6px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 13, fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>End</label>
                <input type="date" value={jobDates[selectedBar].end}
                  onChange={e => setJobDates(prev => ({ ...prev, [selectedBar]: { ...prev[selectedBar], end: e.target.value } }))}
                  style={{ padding: "6px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 13, fontWeight: 600 }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>
              Duration: {daysBetween(jobDates[selectedBar].start, jobDates[selectedBar].end)} days
            </div>
            <button onClick={() => setSelectedBar(null)} style={{ marginLeft: "auto", padding: "6px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Done</button>
          </div>
        );
      })()}
    </div>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// REPORTS MODULE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ Shared chart primitives â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default PlannerScreen;
