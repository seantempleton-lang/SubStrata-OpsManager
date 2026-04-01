import React from "react";
import { COLORS, icons } from "../appData.js";
import { Icon } from "../components/ui.jsx";
const HSEScreen = ({ regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Health, Safety & Environment</h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>HSWA 2015 compliance Â· Site-specific documentation</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: COLORS.red, color: COLORS.white, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Icon d={icons.alert} size={14} color={COLORS.white} /> Incident Report
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Icon d={icons.plus} size={14} color={COLORS.navy} /> New SSSP
        </button>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {[
        { label: "Active SSSPs", value: 3, color: COLORS.teal, sub: "Linked to active jobs" },
        { label: "Pending Review", value: 1, color: COLORS.amber, sub: "Drafts awaiting sign-off" },
        { label: "Open Actions", value: 2, color: COLORS.red, sub: "From inspections" },
        { label: "Incidents (YTD)", value: 0, color: COLORS.green, sub: "Zero harm target" },
      ].map(k => (
        <div key={k.label} style={{ background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k.label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: k.color, marginTop: 6, letterSpacing: "-0.02em" }}>{k.value}</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{k.sub}</div>
        </div>
      ))}
    </div>
    {[
      { job: "200042", client: "Tonkin + Taylor", title: "Ground Investigation â€” Prestons Road", sssp: "SSSP-2026-003", status: "active", nextReview: "2026-04-01", hazards: ["Ground collapse", "Traffic management", "SPT rebound"], actions: [] },
      { job: "100018", client: "Irrigation NZ Ltd", title: "Bore Installation â€” Station Road Farm", sssp: "SSSP-2026-002", status: "active", nextReview: "2026-03-20", hazards: ["Rotary drilling", "High pressure air", "Remote location"], actions: ["Update emergency contacts"] },
      { job: "200029", client: "NZTA", title: "Slope Stability â€” SH73", sssp: "SSSP-2026-001", status: "active", nextReview: "2026-03-25", hazards: ["Traffic â€” live highway", "Slope instability", "Working at height"], actions: ["Traffic management plan due"] },
    ].map(item => (
      <div key={item.job} style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: COLORS.amber, background: COLORS.amberLight, padding: "2px 8px", borderRadius: 4 }}>{item.sssp}</span>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.textMuted, background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "2px 6px", borderRadius: 4 }}>Job {item.job}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{item.title}</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{item.client}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "6px 12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>View SSSP</button>
            <button style={{ padding: "6px 12px", background: COLORS.navyLight, border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, color: COLORS.white, cursor: "pointer" }}>Field Form â†—</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: item.actions.length ? 10 : 0 }}>
          {item.hazards.map(h => (
            <span key={h} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 12, background: "#FEF3C7", color: "#92400E", fontWeight: 600 }}>âš  {h}</span>
          ))}
          <span style={{ fontSize: 11, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
            <Icon d={icons.calendar} size={11} color={COLORS.textMuted} /> Review due {item.nextReview}
          </span>
        </div>
        {item.actions.length > 0 && (
          <div style={{ padding: "8px 12px", background: COLORS.redLight, borderRadius: 8, border: `1px solid ${COLORS.red}20` }}>
            {item.actions.map(a => <div key={a} style={{ fontSize: 12, color: COLORS.red, fontWeight: 600 }}>â†’ {a}</div>)}
          </div>
        )}
      </div>
    ))}
    <div style={{ background: COLORS.bg, borderRadius: 12, border: `2px dashed ${COLORS.border}`, padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>Quipcheck form integration coming â€” accident/incident reports, pre-start checklists, and JSAs will pull live from your Quipcheck account.</div>
    </div>
  </div>
);
export default HSEScreen;
