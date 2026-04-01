import React, { useState } from "react";
import {
  COLORS,
  EQUIPMENT,
  eqStatusCfg,
  INSPECTIONS_DATA,
  JOBS,
  STAFF,
  LEAVE_TYPES,
  PLANNER_JOBS,
  LEAVE_APPS,
  icons,
} from "../appData.js";
import { Icon, DivisionBadge, StatusBadge } from "../components/ui.jsx";
const ResourcesScreen = ({ subTab = "plant", setSubTab = () => {}, regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  if (subTab === "personnel") return <PersonnelScreen />;

  const [plantTab, setPlantTab] = useState("register"); // "register" | "inspections"
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [inspections, setInspections] = useState(INSPECTIONS_DATA);
  const [drilldownEq, setDrilldownEq] = useState(null); // equipment id for inspection history panel

  const filtered = EQUIPMENT.filter(e => {
    if (regionFilter !== "all" && e.region !== regionFilter) return false;
    if (e.division && !divisionFilter[e.division]) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  });

  const typeIcons = { rig: "M12 2L8 6H4v4l-2 2v8h20v-8l-2-2V6h-4L12 2z M8 14h8 M12 6v8", vehicle: "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v7a2 2 0 0 1-2 2h-2 M14 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0", ancillary: icons.settings };

  const openFaults = inspections.filter(i => i.status === "open").length;

  const filteredEq = EQUIPMENT.filter(e =>
    (regionFilter === "all" || e.region === regionFilter) && (!e.division || divisionFilter[e.division])
  );
  const stats = [
    { label: "Total Fleet",    value: filteredEq.length, color: COLORS.textPrimary },
    { label: "Deployed",       value: filteredEq.filter(e => e.status === "deployed").length, color: COLORS.blue },
    { label: "Available",      value: filteredEq.filter(e => e.status === "available").length, color: COLORS.green },
    { label: "Open Faults",    value: openFaults, color: openFaults > 0 ? COLORS.red : COLORS.green },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Plant</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Fleet register, inspections & maintenance</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {plantTab === "inspections" && (
            <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              <Icon d={icons.plus} size={14} color={COLORS.navy} /> New Inspection
            </button>
          )}
          {plantTab === "register" && (
            <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              <Icon d={icons.plus} size={14} color={COLORS.navy} /> Add Equipment
            </button>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 6, letterSpacing: "-0.02em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Plant sub-tabs: Register | Inspections */}
      <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}`, alignSelf: "flex-start" }}>
        <button onClick={() => setPlantTab("register")}
          style={{ padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: plantTab === "register" ? COLORS.white : "transparent", color: plantTab === "register" ? COLORS.textPrimary : COLORS.textMuted, boxShadow: plantTab === "register" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
          Plant Register
        </button>
        <button onClick={() => setPlantTab("inspections")}
          style={{ padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: plantTab === "inspections" ? COLORS.white : "transparent", color: plantTab === "inspections" ? COLORS.textPrimary : COLORS.textMuted, boxShadow: plantTab === "inspections" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", display: "flex", alignItems: "center", gap: 6 }}>
          Inspections
          {openFaults > 0 && <span style={{ fontSize: 10, fontWeight: 800, background: COLORS.red, color: COLORS.white, borderRadius: 10, padding: "1px 6px" }}>{openFaults}</span>}
        </button>
      </div>

      {/* â”€â”€ INSPECTIONS TAB â”€â”€ */}
      {plantTab === "inspections" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {inspections.map(ins => {
            const eq = EQUIPMENT.find(e => e.id === ins.eqId);
            const hasFaults = ins.faults.length > 0;
            const priColors = { high: COLORS.red, medium: COLORS.orange, low: COLORS.amber };
            return (
              <div key={ins.id} style={{ background: COLORS.white, borderRadius: 12, border: `2px solid ${hasFaults ? (priColors[ins.priority] || COLORS.border) : COLORS.green}`, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{eq?.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>Inspected {ins.date} by {ins.tech}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {hasFaults && ins.priority && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, color: priColors[ins.priority], background: priColors[ins.priority] + "20", textTransform: "uppercase" }}>{ins.priority}</span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, color: hasFaults ? COLORS.red : COLORS.green, background: hasFaults ? COLORS.redLight : COLORS.greenLight }}>
                      {hasFaults ? `${ins.faults.length} fault${ins.faults.length > 1 ? "s" : ""}` : "âœ“ Pass"}
                    </span>
                  </div>
                </div>
                {hasFaults && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                    {ins.faults.map((f, fi) => (
                      <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: COLORS.redLight, borderRadius: 7, fontSize: 12, color: "#7F1D1D" }}>âš  {f}</div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button style={{ padding: "6px 14px", background: COLORS.navyLight, border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, color: COLORS.white, cursor: "pointer" }}>Assign to Workshop</button>
                      <button onClick={() => setInspections(prev => prev.map(i => i.id === ins.id ? { ...i, status: "pass", faults: [] } : i))}
                        style={{ padding: "6px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Mark Resolved</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* â”€â”€ PLANT REGISTER TAB â”€â”€ */}
      {plantTab === "register" && (<>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
          {["all","rig","vehicle","ancillary"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: typeFilter === t ? COLORS.white : "transparent", color: typeFilter === t ? COLORS.textPrimary : COLORS.textMuted, boxShadow: typeFilter === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none", textTransform: "capitalize" }}>{t === "all" ? "All Types" : t === "rig" ? "Rigs" : t === "vehicle" ? "Vehicles" : "Ancillary"}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
          {["all","available","deployed","maintenance"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: statusFilter === s ? COLORS.white : "transparent", color: statusFilter === s ? COLORS.textPrimary : COLORS.textMuted, boxShadow: statusFilter === s ? "0 1px 3px rgba(0,0,0,0.1)" : "none", textTransform: "capitalize" }}>{s === "all" ? "All Status" : eqStatusCfg[s]?.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
        {filtered.map(eq => {
          const st = eqStatusCfg[eq.status];
          const linkedJob = eq.jobId ? JOBS.find(j => j.id === eq.jobId) : null;
          const divColor = eq.division === "Water" ? COLORS.blue : eq.division === "Geotech" ? COLORS.teal : COLORS.textMuted;
          const divBg = eq.division === "Water" ? COLORS.blueLight : eq.division === "Geotech" ? COLORS.tealLight : COLORS.bg;
          // Find latest inspection for this item
          const eqInspections = inspections.filter(i => i.eqId === eq.id).sort((a,b) => b.date.localeCompare(a.date));
          const latestIns = eqInspections[0];
          const isDrilldown = drilldownEq === eq.id;
          return (
            <div key={eq.id}
              onClick={() => { setDrilldownEq(isDrilldown ? null : eq.id); setSelected(eq.id); }}
              style={{ background: COLORS.white, borderRadius: 12, border: `2px solid ${isDrilldown ? COLORS.amber : COLORS.border}`, padding: "16px 18px", cursor: "pointer", transition: "all 0.15s", boxShadow: isDrilldown ? "0 4px 16px rgba(245,158,11,0.15)" : "0 1px 4px rgba(0,0,0,0.06)" }}
              onMouseEnter={e => { if (!isDrilldown) e.currentTarget.style.borderColor = COLORS.textMuted; }}
              onMouseLeave={e => { if (!isDrilldown) e.currentTarget.style.borderColor = COLORS.border; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: eq.status === "maintenance" ? COLORS.orangeLight : eq.type === "rig" ? COLORS.navyLight : COLORS.bg, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={typeIcons[eq.type] || icons.settings} size={16} color={eq.status === "maintenance" ? COLORS.orange : eq.type === "rig" ? COLORS.amber : COLORS.textMuted} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>{eq.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{eq.category} Â· {eq.year}</div>
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: st.color, background: st.bg, whiteSpace: "nowrap" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.color }} />{st.label}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon d={icons.mapPin} size={12} color={COLORS.textMuted} />
                  <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{eq.region}</span>
                </div>
                {eq.rego && <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>{eq.rego}</span>}
                {eq.division && <span style={{ fontSize: 10, fontWeight: 700, color: divColor, background: divBg, padding: "1px 7px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{eq.division}</span>}
              </div>
              {linkedJob && (
                <div style={{ padding: "8px 10px", background: COLORS.bg, borderRadius: 7, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Assigned to</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, marginTop: 1 }}>{linkedJob.id} â€” {linkedJob.client}</div>
                  </div>
                  <StatusBadge status={linkedJob.status} />
                </div>
              )}
              {/* Latest inspection summary */}
              {latestIns && (
                <div onClick={e => { e.stopPropagation(); setDrilldownEq(eq.id); }}
                  style={{ padding: "6px 10px", background: latestIns.faults.length > 0 ? COLORS.redLight : COLORS.greenLight, borderRadius: 6, fontSize: 11, display: "flex", justifyContent: "space-between", cursor: "pointer", marginBottom: eq.notes ? 6 : 0 }}>
                  <span style={{ color: latestIns.faults.length > 0 ? "#7F1D1D" : "#065F46", fontWeight: 600 }}>
                    {latestIns.faults.length > 0 ? `âš  ${latestIns.faults.length} fault${latestIns.faults.length > 1 ? "s" : ""} â€” tap for history` : "âœ“ Last inspection passed â€” tap for history"}
                  </span>
                  <span style={{ color: COLORS.textMuted }}>{latestIns.date}</span>
                </div>
              )}
              {eq.notes && (
                <div style={{ marginTop: 0, padding: "6px 10px", background: COLORS.orangeLight, borderRadius: 6, fontSize: 11, color: "#92400E" }}>âš  {eq.notes}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* â”€â”€ Per-equipment inspection history drill-down â”€â”€ */}
      {drilldownEq && (() => {
        const eq = EQUIPMENT.find(e => e.id === drilldownEq);
        const eqInspections = inspections.filter(i => i.eqId === drilldownEq).sort((a,b) => b.date.localeCompare(a.date));
        const openCount = eqInspections.filter(i => i.status === "open").length;
        const passRate = eqInspections.length > 0
          ? Math.round(eqInspections.filter(i => i.status === "pass").length / eqInspections.length * 100) : 0;
        const priColors = { high: COLORS.red, medium: COLORS.orange, low: COLORS.amber };
        const statusCfg = {
          open:     { label: "Open",     color: COLORS.red,   bg: COLORS.redLight },
          pass:     { label: "Pass",     color: COLORS.green, bg: COLORS.greenLight },
          resolved: { label: "Resolved", color: COLORS.teal,  bg: COLORS.tealLight },
        };
        return (
          <div style={{ background: COLORS.white, borderRadius: 14, border: `2px solid ${COLORS.amber}`, overflow: "hidden", boxShadow: "0 4px 24px rgba(245,158,11,0.12)" }}>

            {/* Panel header */}
            <div style={{ background: COLORS.navy, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: COLORS.navyLight, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d="M12 2L8 6H4v4l-2 2v8h20v-8l-2-2V6h-4L12 2z M8 14h8 M12 6v8" size={18} color={COLORS.amber} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.white }}>{eq?.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{eq?.category} Â· {eq?.year} Â· {eq?.region}</div>
                </div>
              </div>
              <button onClick={() => setDrilldownEq(null)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, cursor: "pointer", padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                âœ• Close
              </button>
            </div>

            {/* Stats strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: `1px solid ${COLORS.border}` }}>
              {[
                { label: "Total Inspections", value: eqInspections.length,      color: COLORS.textPrimary },
                { label: "Open Faults",        value: openCount,                 color: openCount > 0 ? COLORS.red : COLORS.green },
                { label: "Pass Rate",          value: passRate + "%",            color: passRate === 100 ? COLORS.green : passRate >= 75 ? COLORS.teal : COLORS.orange },
                { label: "Last Inspected",     value: eqInspections[0]?.date || "â€”", color: COLORS.textSecondary },
              ].map((s, si) => (
                <div key={s.label} style={{ padding: "14px 20px", borderRight: si < 3 ? `1px solid ${COLORS.border}` : "none", background: COLORS.bg }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4, letterSpacing: "-0.02em" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div style={{ padding: "20px 20px 8px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Inspection History</div>

              {eqInspections.length === 0 && (
                <div style={{ padding: "32px", textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>No inspections recorded for this item yet.</div>
              )}

              {eqInspections.map((ins, idx) => {
                const sc = statusCfg[ins.status] || statusCfg.pass;
                const isLast = idx === eqInspections.length - 1;
                const hasFaults = ins.faults.length > 0;
                return (
                  <div key={ins.id} style={{ display: "flex", gap: 0 }}>
                    {/* Spine */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: sc.color, border: `3px solid ${COLORS.white}`, boxShadow: `0 0 0 2px ${sc.color}`, zIndex: 2, marginTop: 14, flexShrink: 0 }} />
                      {!isLast && <div style={{ width: 2, flex: 1, minHeight: 20, background: COLORS.border, marginTop: 2 }} />}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, paddingLeft: 14, paddingBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{ins.date}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 9px", borderRadius: 10, color: sc.color, background: sc.bg }}>{sc.label}</span>
                            {hasFaults && ins.priority && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 10, color: priColors[ins.priority], background: priColors[ins.priority] + "20", textTransform: "uppercase" }}>{ins.priority}</span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: COLORS.textMuted }}>Inspected by {ins.tech}</div>
                        </div>
                        {ins.status === "open" && (
                          <button onClick={() => setInspections(prev => prev.map(i => i.id === ins.id ? { ...i, status: "resolved" } : i))}
                            style={{ padding: "5px 12px", background: COLORS.tealLight, border: `1px solid ${COLORS.teal}40`, borderRadius: 7, fontSize: 11, fontWeight: 700, color: COLORS.teal, cursor: "pointer" }}>
                            Mark Resolved
                          </button>
                        )}
                      </div>

                      {/* Faults */}
                      {hasFaults && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: ins.notes ? 6 : 0 }}>
                          {ins.faults.map((f, fi) => (
                            <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: ins.status === "resolved" ? COLORS.bg : COLORS.redLight, borderRadius: 6, fontSize: 12,
                              color: ins.status === "resolved" ? COLORS.textMuted : "#7F1D1D",
                              textDecoration: ins.status === "resolved" ? "line-through" : "none" }}>
                              {ins.status === "resolved" ? "âœ“" : "âš "} {f}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {ins.notes && (
                        <div style={{ fontSize: 12, color: COLORS.textSecondary, fontStyle: "italic", marginTop: hasFaults ? 4 : 0 }}>{ins.notes}</div>
                      )}

                      {/* Clean pass */}
                      {!hasFaults && (
                        <div style={{ fontSize: 12, color: COLORS.green, display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                          No faults â€” all clear
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: COLORS.textMuted }}>{eqInspections.length} inspection{eqInspections.length !== 1 ? "s" : ""} on record</span>
              <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>
                <Icon d={icons.plus} size={13} color={COLORS.navy} /> Log New Inspection
              </button>
            </div>
          </div>
        );
      })()}

      </>)}
    </div>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PLANNER MODULE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•


const PersonnelScreen = () => {
  const TODAY = "2026-03-11";
  const [tab, setTab] = useState("staff");           // "staff" | "leave"
  const [calMonth, setCalMonth] = useState(new Date("2026-04-01"));
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [leaveApps, setLeaveApps] = useState(LEAVE_APPS);
  const [conflictModal, setConflictModal] = useState(null); // { app, conflicts }

  // Check if a leave application conflicts with planner assignments
  const checkPlannerConflicts = (app) => {
    const leaveStart = new Date(app.start);
    const leaveEnd = new Date(app.end);
    const staff = STAFF.find(s => s.id === app.userId);
    if (!staff) return [];
    return PLANNER_JOBS.filter(pj => {
      if (!pj.personnel?.includes(staff.name)) return false;
      if (pj.isDowntime) return false;
      const jobStart = new Date(pj.start);
      const jobEnd = new Date(pj.end);
      return leaveStart <= jobEnd && leaveEnd >= jobStart;
    }).map(pj => {
      const job = JOBS.find(j => j.id === pj.jobId);
      return { jobId: pj.jobId, client: pj.client, site: pj.site, start: pj.start, end: pj.end, rigId: pj.rigId };
    });
  };

  const handleApprove = (app) => {
    const conflicts = checkPlannerConflicts(app);
    if (conflicts.length > 0) {
      setConflictModal({ app, conflicts });
    } else {
      approveLeave(app.id);
    }
  };

  const approveLeave = (id) => {
    setLeaveApps(prev => prev.map(a => a.id === id
      ? { ...a, status: "approved", approvedBy: "Sean Templeton", approvedAt: TODAY }
      : a));
    setConflictModal(null);
  };

  const declineLeave = (id) => {
    setLeaveApps(prev => prev.map(a => a.id === id ? { ...a, status: "declined" } : a));
    setConflictModal(null);
  };

  // Calendar helpers
  const calYear  = calMonth.getFullYear();
  const calMon   = calMonth.getMonth();
  const firstDay = new Date(calYear, calMon, 1);
  const lastDay  = new Date(calYear, calMon + 1, 0);
  const firstDow = (firstDay.getDay() + 6) % 7; // Mon=0
  const totalCells = Math.ceil((firstDow + lastDay.getDate()) / 7) * 7;

  const leaveOnDay = (dateStr) =>
    leaveApps.filter(a => a.status !== "declined" && a.start <= dateStr && a.end >= dateStr);

  // Staff filter for calendar
  const calStaff = selectedStaff ? leaveApps.filter(a => a.userId === selectedStaff) : leaveApps;
  const pendingCount = leaveApps.filter(a => a.status === "pending").length;

  const ltColor = (type) => (LEAVE_TYPES.find(l => l.id === type) || {}).color || COLORS.textMuted;
  const ltLabel = (type) => (LEAVE_TYPES.find(l => l.id === type) || {}).label || type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Personnel</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>HR records, leave management & timesheet overview</p>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Staff",    value: STAFF.length,    color: COLORS.teal },
          { label: "Certs Expiring", value: 2,               color: COLORS.amber },
          { label: "Leave Pending",  value: pendingCount,    color: pendingCount > 0 ? COLORS.blue : COLORS.green },
          { label: "Timesheets Due", value: TIMESHEETS.filter(t => t.status === "draft").length, color: COLORS.orange },
        ].map(k => (
          <div key={k.label} style={{ background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "14px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, marginTop: 6 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}`, alignSelf: "flex-start" }}>
        {[{ id: "staff", label: "Staff Register" }, { id: "leave", label: `Leave Calendar${pendingCount > 0 ? ` (${pendingCount})` : ""}` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: tab === t.id ? COLORS.white : "transparent",
              color: tab === t.id ? COLORS.textPrimary : COLORS.textMuted,
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* â”€â”€ STAFF TAB â”€â”€ */}
      {tab === "staff" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {STAFF.map(s => {
            const ts = TIMESHEETS.find(t => t.userId === s.id);
            const pendingLeave = leaveApps.filter(a => a.userId === s.id && a.status === "pending");
            const approvedLeave = leaveApps.filter(a => a.userId === s.id && a.status === "approved" && a.end >= TODAY);
            return (
              <div key={s.id} style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: COLORS.navyLight, border: `2px solid ${COLORS.amber}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.amber }}>{s.initials}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.role}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, color: s.division === "Water" ? COLORS.blue : COLORS.teal, background: s.division === "Water" ? COLORS.blueLight : COLORS.tealLight, flexShrink: 0 }}>{s.division}</span>
                </div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 }}>Region: {s.region} Â· Reports to: {s.supervisor?.split(" ")[0]}</div>
                {ts && (
                  <div style={{ padding: "7px 10px", background: COLORS.bg, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>This week: <strong style={{ color: COLORS.textPrimary }}>{calcTsHours(ts)}h</strong></span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, color: (TS_STATUS_CFG[ts.status]||{}).color, background: (TS_STATUS_CFG[ts.status]||{}).bg }}>{(TS_STATUS_CFG[ts.status]||{}).label}</span>
                  </div>
                )}
                {(pendingLeave.length > 0 || approvedLeave.length > 0) && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {pendingLeave.map(a => (
                      <span key={a.id} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, color: COLORS.blue, background: COLORS.blueLight }}>
                        â³ {ltLabel(a.type)} pending
                      </span>
                    ))}
                    {approvedLeave.map(a => (
                      <span key={a.id} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, color: ltColor(a.type), background: ltColor(a.type) + "20" }}>
                        âœ“ {ltLabel(a.type)} {a.start}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* â”€â”€ LEAVE CALENDAR TAB â”€â”€ */}
      {tab === "leave" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Pending approvals */}
          {leaveApps.filter(a => a.status === "pending").length > 0 && (
            <div style={{ background: COLORS.white, borderRadius: 12, border: `2px solid ${COLORS.blue}30`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "12px 18px", background: "#F0F6FF", borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700, fontSize: 13, color: COLORS.blue }}>
                Pending Leave Requests â€” Awaiting Approval
              </div>
              {leaveApps.filter(a => a.status === "pending").map(app => {
                const conflicts = checkPlannerConflicts(app);
                const lt = LEAVE_TYPES.find(l => l.id === app.type);
                const staff = STAFF.find(s => s.id === app.userId);
                return (
                  <div key={app.id} style={{ padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    {/* Avatar */}
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.navyLight, border: `2px solid ${COLORS.amber}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.amber }}>{staff?.initials}</span>
                    </div>
                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{app.staffName}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 8, color: lt?.color, background: lt?.color + "20" }}>{lt?.label}</span>
                        <span style={{ fontSize: 11, color: COLORS.textMuted }}>{app.days} day{app.days !== 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                        {app.start === app.end ? app.start : `${app.start} â€“ ${app.end}`}
                        {app.notes && <span style={{ color: COLORS.textMuted }}> Â· {app.notes}</span>}
                      </div>
                      {/* Conflict warning */}
                      {conflicts.length > 0 && (
                        <div style={{ marginTop: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {conflicts.map((c, ci) => (
                            <span key={ci} style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 8, color: COLORS.red, background: COLORS.redLight, display: "flex", alignItems: "center", gap: 4 }}>
                              âš  Assigned to {c.jobId} ({c.start}â€“{c.end})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleApprove(app)}
                        style={{ padding: "7px 16px", background: conflicts.length > 0 ? COLORS.orange : COLORS.greenLight, border: `1px solid ${conflicts.length > 0 ? COLORS.orange : COLORS.green}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: conflicts.length > 0 ? COLORS.white : COLORS.green, cursor: "pointer" }}>
                        {conflicts.length > 0 ? "âš  Approve Anyway" : "âœ“ Approve"}
                      </button>
                      <button onClick={() => declineLeave(app.id)}
                        style={{ padding: "7px 12px", background: COLORS.redLight, border: `1px solid ${COLORS.red}30`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.red, cursor: "pointer" }}>
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Calendar controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setCalMonth(new Date(calYear, calMon - 1, 1))}
                style={{ width: 32, height: 32, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 7, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>â€¹</button>
              <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, minWidth: 160, textAlign: "center" }}>
                {calMonth.toLocaleDateString("en-NZ", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => setCalMonth(new Date(calYear, calMon + 1, 1))}
                style={{ width: 32, height: 32, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 7, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>â€º</button>
            </div>
            {/* Staff filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => setSelectedStaff(null)}
                style={{ padding: "5px 12px", borderRadius: 20, border: `2px solid ${!selectedStaff ? COLORS.navy : COLORS.border}`, background: !selectedStaff ? COLORS.navy : COLORS.white, cursor: "pointer", fontSize: 12, fontWeight: 700, color: !selectedStaff ? COLORS.white : COLORS.textMuted }}>
                All Staff
              </button>
              {STAFF.map(s => (
                <button key={s.id} onClick={() => setSelectedStaff(selectedStaff === s.id ? null : s.id)}
                  style={{ padding: "5px 12px", borderRadius: 20, border: `2px solid ${selectedStaff === s.id ? COLORS.amber : COLORS.border}`, background: selectedStaff === s.id ? COLORS.amberLight : COLORS.white, cursor: "pointer", fontSize: 12, fontWeight: 700, color: selectedStaff === s.id ? COLORS.navy : COLORS.textMuted }}>
                  {s.initials}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar grid */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            {/* Day-of-week headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `2px solid ${COLORS.border}` }}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} style={{ padding: "8px 6px", textAlign: "center", fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", background: COLORS.bg, borderRight: `1px solid ${COLORS.border}` }}>{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {Array.from({ length: totalCells }, (_, ci) => {
                const dayNum = ci - firstDow + 1;
                const inMonth = dayNum >= 1 && dayNum <= lastDay.getDate();
                if (!inMonth) return (
                  <div key={ci} style={{ minHeight: 90, background: "#F9FAFB", borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }} />
                );
                const date = new Date(calYear, calMon, dayNum);
                const dateStr = date.toISOString().slice(0, 10);
                const isToday = dateStr === TODAY;
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const dayLeave = leaveApps.filter(a =>
                  a.status !== "declined" &&
                  a.start <= dateStr && a.end >= dateStr &&
                  (!selectedStaff || a.userId === selectedStaff)
                );
                return (
                  <div key={ci} style={{ minHeight: 90, padding: "4px 5px", borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, background: isWeekend ? "#FAFBFC" : COLORS.white, position: "relative" }}>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: isToday ? COLORS.white : isWeekend ? COLORS.textMuted : COLORS.textPrimary, width: 22, height: 22, borderRadius: "50%", background: isToday ? COLORS.amber : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>
                      {dayNum}
                    </div>
                    {dayLeave.map((a, ai) => {
                      const lt = LEAVE_TYPES.find(l => l.id === a.type);
                      const staff = STAFF.find(s => s.id === a.userId);
                      const isPending = a.status === "pending";
                      return (
                        <div key={a.id} title={`${a.staffName} â€” ${lt?.label}`}
                          style={{ fontSize: 10, fontWeight: 700, color: COLORS.white, background: lt?.color || COLORS.textMuted, opacity: isPending ? 0.6 : 1, borderRadius: 4, padding: "2px 5px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "default",
                            border: isPending ? `1px dashed ${COLORS.white}` : "none" }}>
                          {staff?.initials} {isPending ? "â³" : ""}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            {LEAVE_TYPES.map(lt => (
              <div key={lt.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: lt.color }} />
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{lt.label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS.textMuted, border: "1px dashed white", outline: `1px solid ${COLORS.textMuted}` }} />
              <span style={{ fontSize: 12, color: COLORS.textSecondary }}>Pending approval</span>
            </div>
          </div>

          {/* Approved leave list */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700, fontSize: 13, color: COLORS.textPrimary, background: COLORS.bg }}>
              All Leave â€” {calMonth.toLocaleDateString("en-NZ", { month: "long", year: "numeric" })}
            </div>
            {leaveApps.filter(a => {
              const monthStr = `${calYear}-${String(calMon + 1).padStart(2,"0")}`;
              return a.start.startsWith(monthStr) || a.end.startsWith(monthStr);
            }).length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>No leave recorded this month</div>
            )}
            {leaveApps.filter(a => {
              const monthStr = `${calYear}-${String(calMon + 1).padStart(2,"0")}`;
              return a.start.startsWith(monthStr) || a.end.startsWith(monthStr);
            }).map(a => {
              const lt = LEAVE_TYPES.find(l => l.id === a.type);
              const statusCfg = a.status === "approved" ? { color: COLORS.green, bg: COLORS.greenLight, label: "Approved" }
                : a.status === "pending" ? { color: COLORS.blue, bg: COLORS.blueLight, label: "Pending" }
                : { color: COLORS.red, bg: COLORS.redLight, label: "Declined" };
              return (
                <div key={a.id} style={{ padding: "12px 18px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, minWidth: 100 }}>{a.staffName}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, color: lt?.color, background: lt?.color + "20" }}>{lt?.label}</span>
                  <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{a.start === a.end ? a.start : `${a.start} â€“ ${a.end}`} Â· {a.days}d</span>
                  {a.notes && <span style={{ fontSize: 11, color: COLORS.textMuted, flex: 1 }}>{a.notes}</span>}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 8, color: statusCfg.color, background: statusCfg.bg }}>{statusCfg.label}</span>
                  {a.status === "approved" && a.approvedBy && (
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>by {a.approvedBy}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conflict modal */}
      {conflictModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: COLORS.white, borderRadius: 16, padding: "28px 28px 24px", maxWidth: 500, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.redLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d={icons.alert} size={22} color={COLORS.red} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>Planner Conflict Detected</div>
                <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
                  <strong>{conflictModal.app.staffName}</strong> is already assigned to active jobs during this leave period.
                </div>
              </div>
            </div>

            {/* Conflict detail */}
            <div style={{ background: COLORS.redLight, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.red, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Conflicting assignments</div>
              {conflictModal.conflicts.map((c, i) => {
                const rig = EQUIPMENT.find(e => e.id === c.rigId);
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLORS.red }}>{c.jobId}</span>
                      <span style={{ fontSize: 12, color: "#7F1D1D", marginLeft: 8 }}>{c.client}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#7F1D1D" }}>{c.start} â€“ {c.end}</div>
                  </div>
                );
              })}
              <div style={{ fontSize: 11, color: "#7F1D1D", marginTop: 4, paddingTop: 8, borderTop: "1px solid rgba(239,68,68,0.2)" }}>
                âš  Approving this leave without reassigning personnel may leave these jobs understaffed. Consider updating the Planner.
              </div>
            </div>

            {/* Leave summary */}
            <div style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: COLORS.textSecondary }}>
              Leave: <strong style={{ color: COLORS.textPrimary }}>{conflictModal.app.staffName}</strong> Â· {ltLabel(conflictModal.app.type)} Â· {conflictModal.app.start} â€“ {conflictModal.app.end}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConflictModal(null)}
                style={{ flex: 1, padding: "12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>
                Cancel â€” Revisit Later
              </button>
              <button onClick={() => declineLeave(conflictModal.app.id)}
                style={{ flex: 1, padding: "12px", background: COLORS.redLight, border: `1px solid ${COLORS.red}30`, borderRadius: 10, fontSize: 14, fontWeight: 700, color: COLORS.red, cursor: "pointer" }}>
                Decline Leave
              </button>
              <button onClick={() => approveLeave(conflictModal.app.id)}
                style={{ flex: 1, padding: "12px", background: COLORS.orange, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, color: COLORS.white, cursor: "pointer" }}>
                Approve Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ResourcesScreen;
