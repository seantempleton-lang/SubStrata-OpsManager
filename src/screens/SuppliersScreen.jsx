import React, { useState } from "react";
import {
  COLORS,
  poStatusCfg,
  catColors,
  sinvStatusCfg,
  icons,
} from "../appData.js";
import { Icon, DivisionBadge } from "../components/ui.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
const APReconciliationTab = ({ invoices = [], suppliers = [], currentUserName = "Sean Templeton" }) => {
  const { updateSupplierInvoiceStatus } = useAppData();
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmAction, setConfirmAction] = useState(null); // { id, action }

  const filtered = invoices.filter(i => statusFilter === "all" || i.status === statusFilter);
  const selectedInv = selected ? invoices.find(i => i.id === selected) : null;

  const pendingCount   = invoices.filter(i => i.status === "pending_review").length;
  const pendingValue   = invoices.filter(i => i.status === "pending_review").reduce((s,i) => s + i.invoiceAmount, 0);
  const approvedValue  = invoices.filter(i => i.status === "approved").reduce((s,i) => s + i.invoiceAmount, 0);
  const disputedCount  = invoices.filter(i => i.status === "disputed").length;
  const paidValue      = invoices.filter(i => i.status === "paid").reduce((s,i) => s + i.invoiceAmount, 0);

  const handleApprove = async (id) => {
    await updateSupplierInvoiceStatus(id, "approved", currentUserName);
    setConfirmAction(null);
  };

  const handleDispute = async (id) => {
    await updateSupplierInvoiceStatus(id, "disputed", currentUserName);
    setConfirmAction(null);
  };

  const handleMarkPaid = async (id) => {
    await updateSupplierInvoiceStatus(id, "paid", currentUserName);
    setConfirmAction(null);
  };

  const variance = (inv) => inv.invoiceAmount - inv.poAmount;
  const variancePct = (inv) => inv.poAmount > 0 ? ((variance(inv) / inv.poAmount) * 100).toFixed(1) : 0;
  const hasVariance = (inv) => Math.abs(variance(inv)) > 0.005;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Pending Review",  value: `${pendingCount} invoice${pendingCount !== 1 ? "s" : ""}`, sub: `$${pendingValue.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}`, color: COLORS.amber, accent: COLORS.amber },
          { label: "Approved",        value: `$${(approvedValue/1000).toFixed(1)}k`,  sub: "Awaiting payment", color: COLORS.blue,  accent: COLORS.blue  },
          { label: "Disputed",        value: `${disputedCount} invoice${disputedCount !== 1 ? "s" : ""}`, sub: "Requires resolution", color: disputedCount > 0 ? COLORS.red : COLORS.textMuted, accent: COLORS.red },
          { label: "Paid (YTD)",      value: `$${(paidValue/1000).toFixed(1)}k`,      sub: "Cleared",          color: COLORS.green, accent: COLORS.green },
        ].map(k => (
          <div key={k.label} style={{ background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${k.accent}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color, letterSpacing: "-0.02em" }}>{k.value}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {/* Invoice list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}`, width: "fit-content" }}>
            {["all", "pending_review", "approved", "disputed", "paid"].map(s => {
              const cfg = sinvStatusCfg[s];
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: statusFilter === s ? COLORS.white : "transparent", color: statusFilter === s ? COLORS.textPrimary : COLORS.textMuted, boxShadow: statusFilter === s ? "0 1px 3px rgba(0,0,0,0.1)" : "none", whiteSpace: "nowrap" }}>
                  {s === "all" ? "All" : cfg?.label}
                </button>
              );
            })}
          </div>

          {/* Invoice cards */}
          {filtered.map(inv => {
            const cfg = sinvStatusCfg[inv.status];
            const vari = variance(inv);
            const isSelected = selected === inv.id;
                const po = suppliers.flatMap(s => s.pos).find(p => p.id === inv.poId);
            const today = new Date("2026-03-11");
            const due = new Date(inv.dueDate);
            const daysUntilDue = Math.round((due - today) / 86400000);
            const isOverdue = daysUntilDue < 0 && inv.status !== "paid";

            return (
              <div key={inv.id}
                onClick={() => setSelected(isSelected ? null : inv.id)}
                style={{ background: COLORS.white, borderRadius: 12, border: `2px solid ${isSelected ? COLORS.amber : hasVariance(inv) && inv.status === "pending_review" ? COLORS.orange + "60" : COLORS.border}`, padding: "16px 20px", cursor: "pointer", transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = COLORS.textMuted; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = hasVariance(inv) && inv.status === "pending_review" ? COLORS.orange + "60" : COLORS.border; }}>

                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLORS.navy }}>{inv.id}</span>
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>?</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary }}>{inv.supplierName}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.textMuted, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "1px 5px" }}>{inv.supplierRef}</span>
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 500 }}>{inv.description}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, background: COLORS.navyLight, color: COLORS.amber, borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>{inv.job}</span>
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>{inv.jobTitle}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0, marginLeft: 16 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: cfg?.color, background: cfg?.bg }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg?.color }} />{cfg?.label}
                    </span>
                    {isOverdue && <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.red, background: COLORS.redLight, padding: "2px 7px", borderRadius: 8 }}>OVERDUE {Math.abs(daysUntilDue)}d</span>}
                  </div>
                </div>

                {/* Amount comparison row */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "10px 12px", background: COLORS.bg, borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>PO Amount</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.textSecondary, fontFamily: "monospace" }}>${inv.poAmount.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1 }}>PO: {inv.poId}</div>
                  </div>
                  <div style={{ fontSize: 18, color: hasVariance(inv) ? COLORS.orange : COLORS.green, fontWeight: 800 }}>
                    {hasVariance(inv) ? "?" : "="}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Invoice Amount</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: hasVariance(inv) ? (vari > 0 ? COLORS.red : COLORS.orange) : COLORS.textPrimary, fontFamily: "monospace" }}>${inv.invoiceAmount.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1 }}>Inv date: {inv.invoiceDate}</div>
                  </div>
                  {hasVariance(inv) && (
                    <div style={{ padding: "6px 12px", background: vari > 0 ? COLORS.redLight : COLORS.amberLight, borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: vari > 0 ? COLORS.red : COLORS.amberDark, textTransform: "uppercase", letterSpacing: "0.04em" }}>Variance</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: vari > 0 ? COLORS.red : COLORS.amberDark, fontFamily: "monospace" }}>
                        {vari > 0 ? "+" : ""}${Math.abs(vari).toFixed(2)}
                      </div>
                      <div style={{ fontSize: 10, color: vari > 0 ? COLORS.red : COLORS.amberDark }}>
                        {vari > 0 ? "+" : ""}{variancePct(inv)}%
                      </div>
                    </div>
                  )}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Due</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isOverdue ? COLORS.red : COLORS.textSecondary }}>{inv.dueDate}</div>
                  </div>
                </div>

                {/* Notes */}
                {inv.notes && (
                  <div style={{ marginTop: 8, padding: "7px 10px", background: vari > 0 ? COLORS.redLight : COLORS.amberLight, borderRadius: 7, fontSize: 11, color: vari > 0 ? "#991B1B" : "#92400E", display: "flex", gap: 6 }}>
                    <span style={{ flexShrink: 0 }}>?</span>
                    <span>{inv.notes}</span>
                  </div>
                )}

                {/* Approval info */}
                {(inv.approvedBy || inv.paidDate) && (
                  <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
                    {inv.approvedBy && <span style={{ fontSize: 11, color: COLORS.textMuted }}>? Approved by <b style={{ color: COLORS.textSecondary }}>{inv.approvedBy}</b> on {inv.approvedDate}</span>}
                    {inv.paidDate && <span style={{ fontSize: 11, color: COLORS.green }}>? Paid {inv.paidDate}</span>}
                  </div>
                )}

                {/* Action buttons ? show when selected and actionable */}
                {isSelected && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    {inv.status === "pending_review" && (
                      <>
                        <button onClick={e => { e.stopPropagation(); setConfirmAction({ id: inv.id, action: "dispute" }); }}
                          style={{ padding: "8px 16px", background: COLORS.white, border: `1.5px solid ${COLORS.red}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.red, cursor: "pointer" }}>
                          Raise Dispute
                        </button>
                        <button onClick={e => { e.stopPropagation(); setConfirmAction({ id: inv.id, action: "approve" }); }}
                          style={{ padding: "8px 16px", background: COLORS.green, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.white, cursor: "pointer" }}>
                          ? Approve Invoice
                        </button>
                      </>
                    )}
                    {inv.status === "disputed" && (
                      <>
                        <button onClick={e => { e.stopPropagation(); setConfirmAction({ id: inv.id, action: "approve" }); }}
                          style={{ padding: "8px 16px", background: COLORS.blue, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.white, cursor: "pointer" }}>
                          Resolve & Approve
                        </button>
                      </>
                    )}
                    {inv.status === "approved" && (
                      <button onClick={e => { e.stopPropagation(); setConfirmAction({ id: inv.id, action: "pay" }); }}
                        style={{ padding: "8px 16px", background: COLORS.teal, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.white, cursor: "pointer" }}>
                        Mark as Paid
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm modal */}
      {confirmAction && (() => {
        const inv = invoices.find(i => i.id === confirmAction.id);
        const isApprove = confirmAction.action === "approve";
        const isDispute = confirmAction.action === "dispute";
        const isPay     = confirmAction.action === "pay";
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: COLORS.white, borderRadius: 16, padding: "28px 32px", width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 8 }}>
                {isApprove ? "Approve Invoice" : isDispute ? "Raise Dispute" : "Mark as Paid"}
              </div>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 1.6 }}>
                {isApprove && `Approve ${inv.id} from ${inv.supplierName} for $${inv.invoiceAmount.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}?${hasVariance(inv) ? ` Note: this invoice has a variance of $${Math.abs(variance(inv)).toFixed(2)} against the PO.` : " Amount matches PO."}`}
                {isDispute && `Raise a dispute on ${inv.id} from ${inv.supplierName}? The invoice will be flagged for resolution before payment.`}
                {isPay && `Confirm payment of ${inv.id} to ${inv.supplierName} for $${inv.invoiceAmount.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}?`}
              </div>

              {/* Summary card in modal */}
              <div style={{ padding: "12px 16px", background: COLORS.bg, borderRadius: 10, marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600 }}>Invoice</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, fontFamily: "monospace" }}>{inv.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600 }}>Supplier</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{inv.supplierName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600 }}>Amount</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isApprove ? COLORS.green : isDispute ? COLORS.red : COLORS.teal, fontFamily: "monospace" }}>${inv.invoiceAmount.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setConfirmAction(null)}
                  style={{ padding: "9px 18px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={() => isApprove ? handleApprove(inv.id) : isDispute ? handleDispute(inv.id) : handleMarkPaid(inv.id)}
                  style={{ padding: "9px 20px", background: isApprove ? COLORS.green : isDispute ? COLORS.red : COLORS.teal, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: COLORS.white, cursor: "pointer" }}>
                  {isApprove ? "? Confirm Approval" : isDispute ? "Raise Dispute" : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const SuppliersScreen = ({ suppliers = [], supplierInvoices = [], currentUserName = "Sean Templeton", onNavigate, regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  const [tab, setTab] = useState("suppliers");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const supplier = selected ? suppliers.find(s => s.id === selected) : null;

  const pendingApCount = supplierInvoices.filter(i => i.status === "pending_review").length;

  const filtered = suppliers.filter(s => {
    if (catFilter !== "all" && s.category !== catFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.specialty.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Suppliers & Subcontractors</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>{suppliers.length} registered suppliers</p>
        </div>
        {tab === "suppliers" && (
          <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Icon d={icons.plus} size={14} color={COLORS.navy} /> Add Supplier
          </button>
        )}
        {tab === "ap" && (
          <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Icon d={icons.plus} size={14} color={COLORS.navy} /> Record Invoice
          </button>
        )}
      </div>

      {/* Module tabs */}
      <div style={{ display: "flex", gap: 2, background: COLORS.bg, padding: 4, borderRadius: 10, border: `1px solid ${COLORS.border}`, width: "fit-content" }}>
        <button onClick={() => setTab("suppliers")} style={{ padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === "suppliers" ? COLORS.white : "transparent", color: tab === "suppliers" ? COLORS.textPrimary : COLORS.textMuted, boxShadow: tab === "suppliers" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
          Suppliers & POs
        </button>
        <button onClick={() => setTab("ap")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === "ap" ? COLORS.white : "transparent", color: tab === "ap" ? COLORS.textPrimary : COLORS.textMuted, boxShadow: tab === "ap" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
          Invoice Reconciliation
          {pendingApCount > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, borderRadius: 9, background: COLORS.amber, color: COLORS.navy, fontSize: 10, fontWeight: 800, padding: "0 5px" }}>
              {pendingApCount}
            </span>
          )}
        </button>
      </div>

      {/* â”€â”€ Suppliers & POs tab â”€â”€ */}
      {tab === "suppliers" && (<>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: "0 0 260px" }}>
          <Icon d={icons.search} size={14} color={COLORS.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.white, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
          {["all","supplier","subcontractor"].map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: catFilter === c ? COLORS.white : "transparent", color: catFilter === c ? COLORS.textPrimary : COLORS.textMuted, boxShadow: catFilter === c ? "0 1px 3px rgba(0,0,0,0.1)" : "none", textTransform: "capitalize" }}>{c === "all" ? "All" : c + "s"}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {/* Supplier list */}
        <div style={{ flex: "0 0 340px", display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(s => {
            const totalPO = s.pos.reduce((sum, p) => sum + p.amount, 0);
            const cat = catColors[s.category];
            return (
              <div key={s.id} onClick={() => setSelected(selected === s.id ? null : s.id)}
                style={{ background: COLORS.white, borderRadius: 10, border: `2px solid ${selected === s.id ? COLORS.amber : COLORS.border}`, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s", boxShadow: selected === s.id ? `0 0 0 3px ${COLORS.amber}20` : "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{s.specialty}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, background: cat.bg, padding: "2px 8px", borderRadius: 8, textTransform: "capitalize", whiteSpace: "nowrap" }}>{s.category}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon d={icons.user} size={12} color={COLORS.textMuted} />
                    <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{s.contact}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>{s.pos.length} PO{s.pos.length !== 1 ? "s" : ""}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.teal }}>${(totalPO/1000).toFixed(1)}k</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {supplier ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Supplier header */}
            <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>{supplier.name}</h2>
                    <span style={{ fontSize: 10, fontWeight: 700, color: catColors[supplier.category].color, background: catColors[supplier.category].bg, padding: "2px 8px", borderRadius: 8, textTransform: "capitalize" }}>{supplier.category}</span>
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.textSecondary }}>{supplier.specialty}</div>
                </div>
                <button style={{ padding: "8px 16px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>+ New PO</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Contact", supplier.contact],
                  ["Email", supplier.email],
                  ["Phone", supplier.phone],
                  ["Mobile", supplier.mobile || "?"],
                  ["Address", supplier.address],
                  ["Payment Terms", `${supplier.paymentTerms} days`],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, minWidth: 110, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Orders */}
            <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>Purchase Orders</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.teal }}>${supplier.pos.reduce((s,p) => s + p.amount, 0).toLocaleString("en-NZ", { minimumFractionDigits: 2 })} total</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: COLORS.bg }}>
                    {["PO #","Job","Description","Amount","Date","Status"].map(h => (
                      <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {supplier.pos.map((po, i) => {
                    const st = poStatusCfg[po.status] || poStatusCfg.pending;
                    return (
                      <tr key={po.id} style={{ cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = COLORS.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}` }}><span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: COLORS.navy }}>{po.id}</span></td>
                        <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}` }}><span style={{ fontFamily: "monospace", fontSize: 11, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "2px 6px" }}>{po.job}</span></td>
                        <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textSecondary, maxWidth: 200 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{po.description}</div></td>
                        <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, fontFamily: "monospace" }}>${po.amount.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textMuted }}>{po.date}</td>
                        <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: st.color, background: st.bg }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.color }} />{st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.textMuted, flexDirection: "column", gap: 10, background: COLORS.white, borderRadius: 12, border: `1px dashed ${COLORS.border}` }}>
            <Icon d={icons.clients} size={32} color={COLORS.border} />
            <span style={{ fontSize: 14, color: COLORS.textMuted }}>Select a supplier to view details</span>
          </div>
        )}
      </div>
      </>)}

      {/* â”€â”€ AP Reconciliation tab â”€â”€ */}
      {tab === "ap" && <APReconciliationTab invoices={supplierInvoices} suppliers={suppliers} currentUserName={currentUserName} />}
    </div>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// RESOURCES MODULE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default SuppliersScreen;
