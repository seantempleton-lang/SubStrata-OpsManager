import React, { useState, useMemo } from "react";
import {
  COLORS,
  icons,
  calcSectionTotal,
  calcEstimateTotal,
  fmtRate,
  fmtCost,
  estimateStatusConfig,
  SECTION_TEMPLATES,
  DEFAULT_NOTES,
  UNIT_OPTIONS,
  makeItem,
  makeSection,
} from "../appData.js";
import { Icon, DivisionBadge } from "../components/ui.jsx";
const EstimatesScreen = ({ onNavigate, estimates = [] }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divFilter, setDivFilter] = useState("all");

  const filtered = estimates.filter(e => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (divFilter !== "all" && e.division !== divFilter) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
        !e.client.toLowerCase().includes(search.toLowerCase()) &&
        !e.id.toLowerCase().includes(search.toLowerCase()) &&
        !e.ref.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalValue = estimates.reduce((s, e) => s + calcEstimateTotal(e), 0);
  const approvedValue = estimates.filter(e => e.status === "approved").reduce((s, e) => s + calcEstimateTotal(e), 0);
  const pendingValue = estimates.filter(e => e.status === "sent").reduce((s, e) => s + calcEstimateTotal(e), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Estimates</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>{filtered.length} estimate{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => onNavigate("newestimate")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Icon d={icons.plus} size={14} color={COLORS.navy} /> New Estimate
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Estimates", value: estimates.length, color: COLORS.textPrimary },
          { label: "Pipeline Value", value: `$${(totalValue/1000).toFixed(1)}k`, color: COLORS.blue },
          { label: "Awaiting Decision", value: `$${(pendingValue/1000).toFixed(1)}k`, color: COLORS.amber },
          { label: "Approved", value: `$${(approvedValue/1000).toFixed(1)}k`, color: COLORS.green },
        ].map(k => (
          <div key={k.label} style={{ background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.color, marginTop: 6, letterSpacing: "-0.02em" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "0 0 260px" }}>
          <Icon d={icons.search} size={14} color={COLORS.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search estimates, clients, ref..." style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.white, color: COLORS.textPrimary, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
          {["all","draft","sent","approved","declined"].map(s => {
            const cfg = estimateStatusConfig[s];
            return (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: statusFilter === s ? COLORS.white : "transparent", color: statusFilter === s ? COLORS.textPrimary : COLORS.textMuted, boxShadow: statusFilter === s ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                {s === "all" ? "All" : cfg?.label || s}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
          {["all","Water","Geotech"].map(d => (
            <button key={d} onClick={() => setDivFilter(d)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: divFilter === d ? COLORS.white : "transparent", color: divFilter === d ? COLORS.textPrimary : COLORS.textMuted, boxShadow: divFilter === d ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{d}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: COLORS.bg }}>
              {["Estimate #","Ref","Client & Title","Division","Date","Total (excl GST)","Status",""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((est) => {
              const total = calcEstimateTotal(est);
              const cfg = estimateStatusConfig[est.status] || estimateStatusConfig.draft;
              return (
                <tr key={est.id} onClick={() => onNavigate("estimatedetail", est)}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLORS.navy }}>{est.id}</span>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.textMuted, background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "2px 7px", borderRadius: 4 }}>{est.ref}</span>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, maxWidth: 260 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{est.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{est.client} ? {est.siteAddress}</div>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}><DivisionBadge div={est.division} /></td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textSecondary, whiteSpace: "nowrap" }}>{est.date}</td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>${total.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: cfg.color, background: cfg.bg }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />{cfg.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                    <button onClick={e => { e.stopPropagation(); onNavigate("estimatedetail", est); }} style={{ fontSize: 11, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View ?</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// â”€â”€ Estimate Detail Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EstimateDetailScreen = ({ estimate, onBack, onNavigate }) => {
  const [activeSection, setActiveSection] = useState(null);
  const total = calcEstimateTotal(estimate);
  const gst = total * 0.15;
  const cfg = estimateStatusConfig[estimate.status] || estimateStatusConfig.draft;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>Estimates</button>
        <Icon d={icons.chevronRight} size={13} color={COLORS.textMuted} />
        <span style={{ fontSize: 13, color: COLORS.textSecondary, fontFamily: "monospace" }}>{estimate.id}</span>
      </div>

      {/* Header card */}
      <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: COLORS.navy, background: COLORS.bg, padding: "3px 10px", borderRadius: 6, border: `1px solid ${COLORS.border}` }}>{estimate.id}</span>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.textMuted, background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "3px 10px", borderRadius: 6 }}>Ref: {estimate.ref}</span>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.textMuted }}>Rev {estimate.revision}</span>
              <DivisionBadge div={estimate.division} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: cfg.color, background: cfg.bg }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />{cfg.label}
              </span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: "0 0 6px", letterSpacing: "-0.01em" }}>{estimate.title}</h1>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon d={icons.clients} size={13} color={COLORS.textMuted} />
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{estimate.client}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon d={icons.mapPin} size={13} color={COLORS.textMuted} />
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{estimate.siteAddress}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon d={icons.user} size={13} color={COLORS.textMuted} />
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{estimate.contact} ? {estimate.contactMobile}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon d={icons.calendar} size={13} color={COLORS.textMuted} />
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{estimate.date} ? Valid until {estimate.validUntil}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button style={{ padding: "8px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Edit</button>
            <button style={{ padding: "8px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon d={icons.externalLink} size={12} color={COLORS.textMuted} /> Export PDF
            </button>
            {estimate.status === "approved" && (
              <button style={{ padding: "8px 14px", background: COLORS.green, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.white, cursor: "pointer" }}>Convert to Job</button>
            )}
            {estimate.status === "draft" && (
              <button style={{ padding: "8px 14px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>Send to Client</button>
            )}
          </div>
        </div>

        {/* Scope */}
        <div style={{ background: COLORS.bg, borderRadius: 8, padding: "12px 16px", borderLeft: `3px solid ${estimate.division === "Geotech" ? COLORS.teal : COLORS.blue}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Scope of Works</div>
          {estimate.scope.split("\n").map((line, i) => (
            <p key={i} style={{ margin: "0 0 4px", fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6 }}>{line}</p>
          ))}
        </div>
      </div>

      {/* Line items */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {estimate.sections.map((section, si) => {
            const sectionTotal = calcSectionTotal(section);
            const isOpen = activeSection === si || activeSection === null;
            return (
              <div key={si} style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                {/* Section header */}
                <div onClick={() => setActiveSection(activeSection === si ? null : si)}
                  style={{ padding: "12px 16px", background: COLORS.navyLight, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.white, fontStyle: "italic" }}>{section.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.amber }}>${sectionTotal.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <Icon d={icons.chevronDown} size={14} color={COLORS.textMuted} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                  </div>
                </div>

                {/* Line items table */}
                {isOpen && (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: COLORS.bg }}>
                        <th style={{ padding: "8px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}`, width: "55%" }}>Description</th>
                        <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 10, fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}`, width: "8%" }}>Qty</th>
                        <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 10, fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}`, width: "12%" }}>Rate</th>
                        <th style={{ padding: "8px 12px", textAlign: "center", fontSize: 10, fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}`, width: "8%" }}>Unit</th>
                        <th style={{ padding: "8px 16px", textAlign: "right", fontSize: 10, fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}`, width: "12%" }}>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item, ii) => {
                        const cost = item.qty ? item.qty * item.rate : 0;
                        const isProvisional = !item.qty;
                        return (
                          <tr key={ii} style={{ background: isProvisional ? "#FAFBFC" : "transparent" }}
                            onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                            onMouseLeave={e => e.currentTarget.style.background = isProvisional ? "#FAFBFC" : "transparent"}>
                            <td style={{ padding: "9px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: isProvisional ? COLORS.textMuted : COLORS.textPrimary, fontStyle: isProvisional ? "italic" : "normal", lineHeight: 1.4 }}>{item.description}</td>
                            <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 12, color: isProvisional ? COLORS.textMuted : COLORS.textPrimary, fontFamily: "monospace" }}>
                              {item.qty != null ? item.qty : "—"}
                            </td>
                            <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 12, color: COLORS.textSecondary, fontFamily: "monospace" }}>{fmtRate(item.rate)}</td>
                            <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "center", fontSize: 11, color: COLORS.textMuted, fontWeight: 600 }}>{item.unit}</td>
                            <td style={{ padding: "9px 16px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 12, fontWeight: cost > 0 ? 700 : 400, color: cost > 0 ? COLORS.textPrimary : COLORS.textMuted, fontFamily: "monospace" }}>{fmtCost(cost)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: COLORS.bg }}>
                        <td colSpan={4} style={{ padding: "8px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", borderTop: `1px solid ${COLORS.border}` }}>Sub total</td>
                        <td style={{ padding: "8px 16px", textAlign: "right", fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, fontFamily: "monospace", borderTop: `1px solid ${COLORS.border}` }}>${sectionTotal.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column ? totals + notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 0 }}>
          {/* Totals */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "12px 16px", background: COLORS.navyLight }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.white }}>Summary</span>
            </div>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {estimate.sections.map((sec, si) => (
                <div key={si} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4, flex: 1 }}>{sec.title}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, fontFamily: "monospace", flexShrink: 0 }}>${calcSectionTotal(sec).toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div style={{ height: 1, background: COLORS.border, margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>Subtotal (excl GST)</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, fontFamily: "monospace" }}>${total.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>GST (15%)</span>
                <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace" }}>${gst.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: COLORS.navyLight, borderRadius: 8, marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.white }}>Total (incl GST)</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.amber, fontFamily: "monospace" }}>${(total + gst).toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Prepared by */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Prepared By</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.navyLight, border: `2px solid ${COLORS.amber}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: COLORS.amber }}>ST</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{estimate.preparedBy}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>Lead Geotech Manager</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Notes / Terms</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              {estimate.notes.map((note, i) => (
                <li key={i} style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.5 }}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// â”€â”€ Default section templates drawn from the 100 Park Tce estimate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const NewEstimateScreen = ({ clients = [], onBack, onSave }) => {
  const today = new Date().toISOString().slice(0, 10);
  const validUntil = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const [division, setDivision] = useState("Geotech");
  const [form, setForm] = useState({
    client: "", contact: "", contactMobile: "", region: "South",
    title: "", siteAddress: "", date: today, validUntil, scope: "",
  });
  const [sections, setSections] = useState(() =>
    SECTION_TEMPLATES["Geotech"].map(s => ({
      id: Math.random().toString(36).slice(2),
      title: s.title,
      items: s.items.map(it => ({ ...it, id: Math.random().toString(36).slice(2) })),
    }))
  );
  const [notes, setNotes] = useState(DEFAULT_NOTES.join("\n"));
  const [activeSection, setActiveSection] = useState(null); // null = all open

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Switch division ? reload template sections (with confirm if items have been edited)
  const handleDivisionChange = (div) => {
    setDivision(div);
    setSections(SECTION_TEMPLATES[div].map(s => ({
      id: Math.random().toString(36).slice(2),
      title: s.title,
      items: s.items.map(it => ({ ...it, id: Math.random().toString(36).slice(2) })),
    })));
  };

  // Section helpers
  const updateSectionTitle = (sid, val) =>
    setSections(ss => ss.map(s => s.id === sid ? { ...s, title: val } : s));
  const addSection = () =>
    setSections(ss => [...ss, makeSection()]);
  const removeSection = (sid) =>
    setSections(ss => ss.filter(s => s.id !== sid));
  const moveSection = (sid, dir) =>
    setSections(ss => {
      const i = ss.findIndex(s => s.id === sid);
      const next = [...ss];
      const swap = i + dir;
      if (swap < 0 || swap >= next.length) return ss;
      [next[i], next[swap]] = [next[swap], next[i]];
      return next;
    });

  // Item helpers
  const updateItem = (sid, iid, field, val) =>
    setSections(ss => ss.map(s => s.id === sid
      ? { ...s, items: s.items.map(it => it.id === iid ? { ...it, [field]: val } : it) }
      : s));
  const addItem = (sid) =>
    setSections(ss => ss.map(s => s.id === sid
      ? { ...s, items: [...s.items, makeItem()] }
      : s));
  const removeItem = (sid, iid) =>
    setSections(ss => ss.map(s => s.id === sid
      ? { ...s, items: s.items.filter(it => it.id !== iid) }
      : s));
  const moveItem = (sid, iid, dir) =>
    setSections(ss => ss.map(s => {
      if (s.id !== sid) return s;
      const items = [...s.items];
      const i = items.findIndex(it => it.id === iid);
      const swap = i + dir;
      if (swap < 0 || swap >= items.length) return s;
      [items[i], items[swap]] = [items[swap], items[i]];
      return { ...s, items };
    }));

  // Totals
  const calcSec = (sec) => sec.items.reduce((s, it) => {
    const q = parseFloat(it.qty);
    const r = parseFloat(it.rate);
    return s + (isNaN(q) || isNaN(r) ? 0 : q * r);
  }, 0);
  const total = sections.reduce((s, sec) => s + calcSec(sec), 0);
  const gst = total * 0.15;

  const fieldStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, color: COLORS.textPrimary, outline: "none", boxSizing: "border-box", background: COLORS.white };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5, display: "block" };
  const inputCell = { padding: "7px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 12, color: COLORS.textPrimary, outline: "none", background: COLORS.white, width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1200 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>Estimates</button>
        <Icon d={icons.chevronRight} size={13} color={COLORS.textMuted} />
        <span style={{ fontSize: 13, color: COLORS.textSecondary }}>New Estimate</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>New Estimate</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Auto-numbered on save ? Draft status</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ padding: "9px 16px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave && onSave({ ...form, division, sections, notes: notes.split("\n").filter(Boolean) })}
            style={{ padding: "9px 18px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: COLORS.navy, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={icons.plus} size={14} color={COLORS.navy} /> Save as Draft
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
        {/* â”€â”€ LEFT COLUMN â”€â”€ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header fields */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 16 }}>Estimate Details</div>

            {/* Division toggle */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Division</label>
              <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}`, width: "fit-content" }}>
                {["Geotech", "Water"].map(div => (
                  <button key={div} onClick={() => handleDivisionChange(div)}
                    style={{ padding: "7px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                      background: division === div ? (div === "Geotech" ? COLORS.teal : COLORS.blue) : "transparent",
                      color: division === div ? COLORS.white : COLORS.textMuted,
                      boxShadow: division === div ? "0 1px 3px rgba(0,0,0,0.15)" : "none" }}>
                    {div}
                  </button>
                ))}
              </div>
              {division === "Geotech"
                ? <p style={{ margin: "6px 0 0", fontSize: 11, color: COLORS.teal }}>Geotechnical template loaded ? CPT, boreholes, specialised testing</p>
                : <p style={{ margin: "6px 0 0", fontSize: 11, color: COLORS.blue }}>Water template loaded ? drilling, casing, installations</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Client Name</label>
                <input value={form.client} onChange={e => setF("client", e.target.value)} placeholder="e.g. Landform Projects" style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Estimate Title</label>
                <input value={form.title} onChange={e => setF("title", e.target.value)} placeholder="e.g. Deep Geotechnical Investigation" style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Contact Person</label>
                <input value={form.contact} onChange={e => setF("contact", e.target.value)} placeholder="e.g. Richard Wise" style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Contact Mobile</label>
                <input value={form.contactMobile} onChange={e => setF("contactMobile", e.target.value)} placeholder="e.g. 027 221 2987" style={fieldStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Site Address</label>
                <input value={form.siteAddress} onChange={e => setF("siteAddress", e.target.value)} placeholder="e.g. 100 Park Terrace, Christchurch" style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={form.date} onChange={e => setF("date", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Valid Until</label>
                <input type="date" value={form.validUntil} onChange={e => setF("validUntil", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Location (Base)</label>
                <select value={form.region} onChange={e => setF("region", e.target.value)} style={fieldStyle}>
                  <option>Christchurch</option>
                  <option>Southbridge</option>
                  <option>Auckland</option>
                </select>
              </div>
            </div>

            {/* Scope */}
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Scope of Works</label>
              <textarea value={form.scope} onChange={e => setF("scope", e.target.value)}
                placeholder={"Describe the scope ? each line will appear as a separate paragraph.\ne.g. 1 x Sonic Borehole to 30mbgl with full core recovery & SPTs at 1.5m crs...\n4x CPTu/DPSH soundings to refusal."}
                rows={5}
                style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }} />
            </div>
          </div>

          {/* â”€â”€ SECTIONS â”€â”€ */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>Line Items</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setActiveSection(null)}
                style={{ fontSize: 11, padding: "5px 12px", background: activeSection === null ? COLORS.navy : COLORS.bg, color: activeSection === null ? COLORS.white : COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                Expand All
              </button>
              <button onClick={addSection}
                style={{ fontSize: 11, padding: "5px 12px", background: COLORS.bg, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}`, borderRadius: 6, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon d={icons.plus} size={11} color={COLORS.textPrimary} /> Add Section
              </button>
            </div>
          </div>

          {sections.map((sec, si) => {
            const secTotal = calcSec(sec);
            const isOpen = activeSection === null || activeSection === sec.id;
            return (
              <div key={sec.id} style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                {/* Section header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: COLORS.navyLight, borderBottom: isOpen ? `1px solid ${COLORS.navyBorder}` : "none" }}>
                  <button onClick={() => setActiveSection(isOpen && activeSection === sec.id ? null : sec.id === activeSection ? null : sec.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
                    <Icon d={icons.chevronDown} size={14} color={COLORS.textMuted}
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                  </button>
                  {/* Editable title */}
                  <input value={sec.title} onChange={e => updateSectionTitle(sec.id, e.target.value)}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, fontWeight: 700, color: COLORS.white, fontStyle: "italic", cursor: "text" }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.amber, marginRight: 8, fontFamily: "monospace" }}>
                    {secTotal > 0 ? `$${secTotal.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "?"}
                  </span>
                  <button onClick={() => moveSection(sec.id, -1)} disabled={si === 0}
                    style={{ background: "none", border: "none", cursor: si === 0 ? "default" : "pointer", opacity: si === 0 ? 0.3 : 1, padding: "2px 4px", color: COLORS.textMuted }}>â–²</button>
                  <button onClick={() => moveSection(sec.id, 1)} disabled={si === sections.length - 1}
                    style={{ background: "none", border: "none", cursor: si === sections.length - 1 ? "default" : "pointer", opacity: si === sections.length - 1 ? 0.3 : 1, padding: "2px 4px", color: COLORS.textMuted }}>â–¼</button>
                  <button onClick={() => removeSection(sec.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", color: COLORS.red, fontSize: 16, lineHeight: 1 }}>Ã—</button>
                </div>

                {isOpen && (
                  <>
                    {/* Column headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px 64px 90px 56px", gap: 6, padding: "7px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
                      {["Description", "Qty", "Rate ($)", "Unit", "Cost", ""].map(h => (
                        <div key={h} style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "Cost" || h === "Rate ($)" || h === "Qty" ? "right" : "left" }}>{h}</div>
                      ))}
                    </div>

                    {/* Items */}
                    {sec.items.map((item, ii) => {
                      const qty = parseFloat(item.qty);
                      const rate = parseFloat(item.rate);
                      const cost = (!isNaN(qty) && !isNaN(rate)) ? qty * rate : null;
                      const isProvisional = item.qty === "" || item.qty === null;
                      return (
                        <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px 64px 90px 56px", gap: 6, padding: "6px 14px", borderBottom: `1px solid ${COLORS.border}`, background: isProvisional ? "#FAFBFC" : COLORS.white, alignItems: "center" }}>
                          {/* Description */}
                          <input value={item.description} onChange={e => updateItem(sec.id, item.id, "description", e.target.value)}
                            placeholder={isProvisional ? "Description (no qty = provisional)" : "Description"}
                            style={{ ...inputCell, fontStyle: isProvisional ? "italic" : "normal", color: isProvisional ? COLORS.textMuted : COLORS.textPrimary }} />
                          {/* Qty */}
                          <input value={item.qty} onChange={e => updateItem(sec.id, item.id, "qty", e.target.value)}
                            placeholder="?" type="text" inputMode="decimal"
                            style={{ ...inputCell, textAlign: "right" }} />
                          {/* Rate */}
                          <input value={item.rate} onChange={e => updateItem(sec.id, item.id, "rate", e.target.value)}
                            placeholder="0.00" type="text" inputMode="decimal"
                            style={{ ...inputCell, textAlign: "right" }} />
                          {/* Unit */}
                          <select value={item.unit} onChange={e => updateItem(sec.id, item.id, "unit", e.target.value)}
                            style={{ ...inputCell, padding: "7px 6px" }}>
                            {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                          </select>
                          {/* Cost (read-only) */}
                          <div style={{ textAlign: "right", fontSize: 12, fontWeight: cost ? 700 : 400, color: cost ? COLORS.textPrimary : COLORS.textMuted, fontFamily: "monospace" }}>
                            {cost != null ? `$${cost.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "?"}
                          </div>
                          {/* Actions */}
                          <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <button onClick={() => moveItem(sec.id, item.id, -1)} disabled={ii === 0}
                              style={{ background: "none", border: "none", cursor: ii === 0 ? "default" : "pointer", opacity: ii === 0 ? 0.25 : 0.6, fontSize: 11, padding: "2px 3px", color: COLORS.textMuted }}>â–²</button>
                            <button onClick={() => moveItem(sec.id, item.id, 1)} disabled={ii === sec.items.length - 1}
                              style={{ background: "none", border: "none", cursor: ii === sec.items.length - 1 ? "default" : "pointer", opacity: ii === sec.items.length - 1 ? 0.25 : 0.6, fontSize: 11, padding: "2px 3px", color: COLORS.textMuted }}>â–¼</button>
                            <button onClick={() => removeItem(sec.id, item.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.red, fontSize: 15, padding: "0 3px", lineHeight: 1 }}>Ã—</button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add item row */}
                    <div style={{ padding: "8px 14px", background: COLORS.bg }}>
                      <button onClick={() => addItem(sec.id)}
                        style={{ fontSize: 12, color: COLORS.blue, background: "none", border: `1px dashed ${COLORS.blue}`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon d={icons.plus} size={11} color={COLORS.blue} /> Add line item
                      </button>
                    </div>

                    {/* Section subtotal */}
                    <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 14px", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 16 }}>Section Subtotal</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, fontFamily: "monospace" }}>
                        {secTotal > 0 ? `$${secTotal.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "?"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Notes / T&Cs */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ ...labelStyle, margin: 0 }}>Notes / Terms &amp; Conditions</label>
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>One note per line</span>
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={8}
              style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.7, fontFamily: "inherit", fontSize: 12 }} />
          </div>
        </div>

        {/* â”€â”€ RIGHT COLUMN ? live totals â”€â”€ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 0 }}>
          {/* Totals card */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "12px 16px", background: COLORS.navyLight }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.white }}>Live Total</span>
            </div>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {sections.map(sec => {
                const st = calcSec(sec);
                return (
                  <div key={sec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4, flex: 1 }}>{sec.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: st > 0 ? COLORS.textPrimary : COLORS.textMuted, fontFamily: "monospace", flexShrink: 0 }}>
                      {st > 0 ? `$${st.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}` : "?"}
                    </span>
                  </div>
                );
              })}
              <div style={{ height: 1, background: COLORS.border, margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 600 }}>Subtotal (excl GST)</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, fontFamily: "monospace" }}>
                  {total > 0 ? `$${total.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}` : "?"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>GST (15%)</span>
                <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace" }}>
                  {gst > 0 ? `$${gst.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}` : "?"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: COLORS.navyLight, borderRadius: 8, marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.white }}>Total (incl GST)</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.amber, fontFamily: "monospace" }}>
                  {(total + gst) > 0 ? `$${(total + gst).toLocaleString("en-NZ", { minimumFractionDigits: 2 })}` : "?"}
                </span>
              </div>
            </div>
          </div>

          {/* Provisional items notice */}
          <div style={{ background: COLORS.amberLight, border: `1px solid #FDE68A`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", marginBottom: 4 }}>PROVISIONAL ITEMS</div>
            <p style={{ margin: 0, fontSize: 11, color: "#92400E", lineHeight: 1.6 }}>
              Line items with <strong>no quantity</strong> are shown in italic and calculated as <strong>$0</strong> ? they appear on the estimate as provisional/if-required items.
            </p>
          </div>

          {/* Tip card */}
          <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 6 }}>TIPS</div>
            <ul style={{ margin: 0, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                "Leave Qty blank ? provisional/if required line",
                "Click section title to rename it",
                "â–²â–¼ arrows reorder sections and items",
                "Switching division reloads the rate schedule",
              ].map((t, i) => <li key={i} style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>{t}</li>)}
            </ul>
          </div>

          {/* Save button (repeated for convenience) */}
          <button onClick={() => onSave && onSave({ ...form, division, sections, notes: notes.split("\n").filter(Boolean) })}
            style={{ padding: "12px 18px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
};
export {
  EstimatesScreen,
  EstimateDetailScreen,
  NewEstimateScreen,
};
