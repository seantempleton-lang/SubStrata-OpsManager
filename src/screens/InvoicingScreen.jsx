import React from "react";
import { COLORS, JOBS, INVOICES, icons, fmt } from "../appData.js";
import { Icon, DivisionBadge } from "../components/ui.jsx";
const InvoicingScreen = ({ regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Invoicing</h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Progress claims ? Field data linked ? Client portal</p>
      </div>
      <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
        <Icon d={icons.plus} size={14} color={COLORS.navy} /> New Invoice
      </button>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {[
        { label: "Total Invoiced", value: fmt(INVOICES.reduce((s,i)=>s+i.amount,0)), color: COLORS.teal },
        { label: "Collected", value: fmt(INVOICES.filter(i=>i.status==="paid").reduce((s,i)=>s+i.amount,0)), color: COLORS.green },
        { label: "Outstanding", value: fmt(INVOICES.filter(i=>i.status==="sent").reduce((s,i)=>s+i.amount,0)), color: COLORS.blue },
        { label: "Overdue", value: fmt(INVOICES.filter(i=>i.status==="overdue").reduce((s,i)=>s+i.amount,0)), color: COLORS.red },
      ].map(k => (
        <div key={k.label} style={{ background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "14px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k.label}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: k.color, marginTop: 6 }}>{k.value}</div>
        </div>
      ))}
    </div>
    <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, display: "flex", justifyContent: "space-between" }}>
        Recent Invoices
        <span style={{ fontSize: 12, color: COLORS.blue, fontWeight: 600, cursor: "pointer" }}>Client Portal ?</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: COLORS.bg }}>
            {["Invoice","Job","Client","Amount","Status","Due"].map(h => (
              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INVOICES.map(inv => (
            <tr key={inv.id} style={{ cursor: "pointer" }} onMouseEnter={e=>e.currentTarget.style.background=COLORS.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontFamily: "monospace", fontSize: 12, color: COLORS.textPrimary }}>{inv.id}</td>
              <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontFamily: "monospace", fontSize: 12, color: COLORS.textMuted }}>{inv.job}</td>
              <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.textPrimary }}>{inv.client}</td>
              <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 14, fontWeight: 800, color: COLORS.teal }}>{fmt(inv.amount)}</td>
              <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, color: inv.status==="paid" ? COLORS.green : inv.status==="overdue" ? COLORS.red : COLORS.blue, background: inv.status==="paid" ? COLORS.greenLight : inv.status==="overdue" ? COLORS.redLight : COLORS.blueLight, textTransform: "uppercase" }}>{inv.status}</span>
              </td>
              <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: inv.status==="overdue" ? COLORS.red : COLORS.textSecondary, fontWeight: inv.status==="overdue" ? 700 : 400 }}>{inv.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div style={{ background: COLORS.bg, borderRadius: 12, border: `2px dashed ${COLORS.border}`, padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>Progress claim builder (estimate line items Ã— field days), field reports link, and client portal coming next.</div>
    </div>
  </div>
);

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// APP ? Collapsible sidebar, North/South + Division filters, new hierarchy
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default InvoicingScreen;
