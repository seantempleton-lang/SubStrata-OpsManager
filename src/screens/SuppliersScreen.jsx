import React, { useMemo, useState } from "react";
import {
  COLORS,
  catColors,
  icons,
  poStatusCfg,
  sinvStatusCfg,
} from "../appData.js";
import { DivisionBadge, Icon } from "../components/ui.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

function currency(value) {
  return `$${Number(value || 0).toLocaleString("en-NZ", { minimumFractionDigits: 2 })}`;
}

function invoiceVariance(invoice) {
  return Number(invoice.invoiceAmount || 0) - Number(invoice.poAmount || 0);
}

function APReconciliationTab({
  invoices = [],
  suppliers = [],
}) {
  const { updateSupplierInvoiceStatus } = useAppData();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const filteredInvoices = invoices.filter(
    (invoice) => statusFilter === "all" || invoice.status === statusFilter,
  );

  async function runAction(invoiceId, action) {
    if (action === "approve") {
      await updateSupplierInvoiceStatus(invoiceId, "approved");
    }
    if (action === "dispute") {
      await updateSupplierInvoiceStatus(invoiceId, "disputed");
    }
    if (action === "pay") {
      await updateSupplierInvoiceStatus(invoiceId, "paid");
    }
    setConfirmAction(null);
  }

  const pendingCount = invoices.filter((invoice) => invoice.status === "pending_review").length;
  const pendingValue = invoices
    .filter((invoice) => invoice.status === "pending_review")
    .reduce((sum, invoice) => sum + Number(invoice.invoiceAmount || 0), 0);
  const approvedValue = invoices
    .filter((invoice) => invoice.status === "approved")
    .reduce((sum, invoice) => sum + Number(invoice.invoiceAmount || 0), 0);
  const disputedCount = invoices.filter((invoice) => invoice.status === "disputed").length;
  const paidValue = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + Number(invoice.invoiceAmount || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          {
            label: "Pending Review",
            value: `${pendingCount} invoice${pendingCount === 1 ? "" : "s"}`,
            sub: currency(pendingValue),
            color: COLORS.amber,
            accent: COLORS.amber,
          },
          {
            label: "Approved",
            value: currency(approvedValue),
            sub: "Awaiting payment",
            color: COLORS.blue,
            accent: COLORS.blue,
          },
          {
            label: "Disputed",
            value: `${disputedCount} invoice${disputedCount === 1 ? "" : "s"}`,
            sub: "Needs resolution",
            color: disputedCount > 0 ? COLORS.red : COLORS.textMuted,
            accent: COLORS.red,
          },
          {
            label: "Paid",
            value: currency(paidValue),
            sub: "Cleared",
            color: COLORS.green,
            accent: COLORS.green,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: COLORS.white,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              padding: "14px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              borderTop: `3px solid ${stat.accent}`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.textSecondary,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 4,
              }}
            >
              {stat.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          background: COLORS.bg,
          padding: 4,
          borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
          width: "fit-content",
        }}
      >
        {["all", "pending_review", "approved", "disputed", "paid"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: statusFilter === status ? COLORS.white : "transparent",
              color: statusFilter === status ? COLORS.textPrimary : COLORS.textMuted,
              boxShadow: statusFilter === status ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {status === "all" ? "All" : sinvStatusCfg[status]?.label || status}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredInvoices.map((invoice) => {
          const status = sinvStatusCfg[invoice.status] ?? {
            label: invoice.status,
            color: COLORS.textMuted,
            bg: COLORS.bg,
          };
          const variance = invoiceVariance(invoice);
          const selected = selectedInvoiceId === invoice.id;
          const supplier = suppliers.find((item) => item.id === invoice.supplierId);

          return (
            <div
              key={invoice.id}
              onClick={() => setSelectedInvoiceId(selected ? null : invoice.id)}
              style={{
                background: COLORS.white,
                borderRadius: 12,
                border: `2px solid ${selected ? COLORS.amber : COLORS.border}`,
                padding: "16px 20px",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLORS.navy }}>
                      {invoice.supplierRef}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary }}>
                      {invoice.supplierName}
                    </span>
                    {supplier?.division && <DivisionBadge div={supplier.division} />}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textPrimary, marginTop: 6 }}>
                    {invoice.description}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                    {invoice.job && (
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          background: COLORS.navyLight,
                          color: COLORS.amber,
                          borderRadius: 4,
                          padding: "1px 6px",
                          fontWeight: 700,
                        }}
                      >
                        {invoice.job}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                      Invoice date: {invoice.invoiceDate || "-"}
                    </span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                      Due: {invoice.dueDate || "-"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      color: status.color,
                      background: status.bg,
                      textTransform: "uppercase",
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.color }} />
                    {status.label}
                  </span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>
                    {currency(invoice.invoiceAmount)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                  marginTop: 12,
                  padding: "10px 12px",
                  background: COLORS.bg,
                  borderRadius: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>
                    PO
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, marginTop: 2 }}>
                    {invoice.poId || "-"}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                    {currency(invoice.poAmount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>
                    Invoice
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, marginTop: 2 }}>
                    {invoice.id}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                    {currency(invoice.invoiceAmount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>
                    Variance
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: variance > 0 ? COLORS.red : variance < 0 ? COLORS.orange : COLORS.green,
                      marginTop: 2,
                    }}
                  >
                    {variance === 0 ? "Matches PO" : `${variance > 0 ? "+" : "-"}${currency(Math.abs(variance))}`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>
                    Dates
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
                    Received: {invoice.receivedDate || "-"}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
                    Paid: {invoice.paidDate || "-"}
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "8px 10px",
                    background: variance === 0 ? COLORS.greenLight : COLORS.amberLight,
                    borderRadius: 8,
                    fontSize: 11,
                    color: variance > 0 ? "#92400E" : "#065F46",
                  }}
                >
                  {invoice.notes}
                </div>
              )}

              {(invoice.approvedBy || invoice.approvedDate || invoice.paidDate) && (
                <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {invoice.approvedBy && (
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                      Approved by {invoice.approvedBy}
                      {invoice.approvedDate ? ` on ${invoice.approvedDate}` : ""}
                    </span>
                  )}
                  {invoice.paidDate && (
                    <span style={{ fontSize: 11, color: COLORS.green }}>
                      Paid {invoice.paidDate}
                    </span>
                  )}
                </div>
              )}

              {selected && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: `1px solid ${COLORS.border}`,
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  {invoice.status === "pending_review" && (
                    <>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setConfirmAction({ id: invoice.id, action: "dispute" });
                        }}
                        style={{
                          padding: "8px 16px",
                          background: COLORS.white,
                          border: `1.5px solid ${COLORS.red}`,
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.red,
                          cursor: "pointer",
                        }}
                      >
                        Raise Dispute
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setConfirmAction({ id: invoice.id, action: "approve" });
                        }}
                        style={{
                          padding: "8px 16px",
                          background: COLORS.green,
                          border: "none",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.white,
                          cursor: "pointer",
                        }}
                      >
                        Approve Invoice
                      </button>
                    </>
                  )}

                  {invoice.status === "disputed" && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setConfirmAction({ id: invoice.id, action: "approve" });
                      }}
                      style={{
                        padding: "8px 16px",
                        background: COLORS.blue,
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        color: COLORS.white,
                        cursor: "pointer",
                      }}
                    >
                      Resolve and Approve
                    </button>
                  )}

                  {invoice.status === "approved" && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setConfirmAction({ id: invoice.id, action: "pay" });
                      }}
                      style={{
                        padding: "8px 16px",
                        background: COLORS.teal,
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        color: COLORS.white,
                        cursor: "pointer",
                      }}
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmAction && (() => {
        const invoice = invoices.find((item) => item.id === confirmAction.id);
        if (!invoice) return null;

        return (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: COLORS.white,
                borderRadius: 16,
                padding: "28px 32px",
                width: 460,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 8 }}>
                {confirmAction.action === "approve"
                  ? "Approve Invoice"
                  : confirmAction.action === "dispute"
                    ? "Raise Dispute"
                    : "Mark as Paid"}
              </div>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6 }}>
                {invoice.supplierName} | {invoice.supplierRef} | {currency(invoice.invoiceAmount)}
              </div>
              <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setConfirmAction(null)}
                  style={{
                    padding: "9px 18px",
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.textSecondary,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => runAction(invoice.id, confirmAction.action)}
                  style={{
                    padding: "9px 20px",
                    background:
                      confirmAction.action === "approve"
                        ? COLORS.green
                        : confirmAction.action === "dispute"
                          ? COLORS.red
                          : COLORS.teal,
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.white,
                    cursor: "pointer",
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const SuppliersScreen = ({
  suppliers = [],
  supplierInvoices = [],
  regionFilter = "all",
  divisionFilter = { Water: true, Geotech: true },
}) => {
  const [tab, setTab] = useState("suppliers");
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((supplier) => {
        if (regionFilter !== "all" && supplier.region !== regionFilter) return false;
        if (supplier.division && !divisionFilter[supplier.division]) return false;
        if (categoryFilter !== "all" && supplier.category !== categoryFilter) return false;
        const haystack = `${supplier.name} ${supplier.specialty || ""} ${supplier.contact || ""}`.toLowerCase();
        return !search || haystack.includes(search.toLowerCase());
      }),
    [categoryFilter, divisionFilter, regionFilter, search, suppliers],
  );

  const selectedSupplier =
    filteredSuppliers.find((supplier) => supplier.id === selectedSupplierId) ??
    suppliers.find((supplier) => supplier.id === selectedSupplierId) ??
    null;
  const pendingApCount = supplierInvoices.filter((invoice) => invoice.status === "pending_review").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>
          Suppliers and Subcontractors
        </h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>
          {filteredSuppliers.length} registered suppliers in the current filter
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 2,
          background: COLORS.bg,
          padding: 4,
          borderRadius: 10,
          border: `1px solid ${COLORS.border}`,
          width: "fit-content",
        }}
      >
        <button
          onClick={() => setTab("suppliers")}
          style={{
            padding: "7px 18px",
            borderRadius: 7,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            background: tab === "suppliers" ? COLORS.white : "transparent",
            color: tab === "suppliers" ? COLORS.textPrimary : COLORS.textMuted,
            boxShadow: tab === "suppliers" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}
        >
          Suppliers and POs
        </button>
        <button
          onClick={() => setTab("ap")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 18px",
            borderRadius: 7,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            background: tab === "ap" ? COLORS.white : "transparent",
            color: tab === "ap" ? COLORS.textPrimary : COLORS.textMuted,
            boxShadow: tab === "ap" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}
        >
          Invoice Reconciliation
          {pendingApCount > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                background: COLORS.amber,
                color: COLORS.navy,
                fontSize: 10,
                fontWeight: 800,
                padding: "0 5px",
              }}
            >
              {pendingApCount}
            </span>
          )}
        </button>
      </div>

      {tab === "suppliers" && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "0 0 260px" }}>
              <Icon
                d={icons.search}
                size={14}
                color={COLORS.textMuted}
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search suppliers..."
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 13,
                  background: COLORS.white,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 4,
                background: COLORS.bg,
                padding: 4,
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              {["all", "supplier", "subcontractor"].map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    background: categoryFilter === category ? COLORS.white : "transparent",
                    color: categoryFilter === category ? COLORS.textPrimary : COLORS.textMuted,
                    boxShadow:
                      categoryFilter === category ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    textTransform: "capitalize",
                  }}
                >
                  {category === "all" ? "All" : `${category}s`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: "0 0 360px", display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredSuppliers.map((supplier) => {
                const totalPo = supplier.pos.reduce((sum, po) => sum + Number(po.amount || 0), 0);
                const category = catColors[supplier.category] ?? {
                  color: COLORS.textMuted,
                  bg: COLORS.bg,
                };

                return (
                  <div
                    key={supplier.id}
                    onClick={() =>
                      setSelectedSupplierId(selectedSupplierId === supplier.id ? null : supplier.id)
                    }
                    style={{
                      background: COLORS.white,
                      borderRadius: 10,
                      border: `2px solid ${selectedSupplierId === supplier.id ? COLORS.amber : COLORS.border}`,
                      padding: "14px 16px",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>
                          {supplier.name}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                          {supplier.specialty}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: category.color,
                          background: category.bg,
                          padding: "2px 8px",
                          borderRadius: 8,
                          textTransform: "capitalize",
                        }}
                      >
                        {supplier.category}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Icon d={icons.user} size={12} color={COLORS.textMuted} />
                        <span style={{ fontSize: 11, color: COLORS.textSecondary }}>
                          {supplier.contact || "-"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                          {supplier.pos.length} PO{supplier.pos.length === 1 ? "" : "s"}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.teal }}>
                          {currency(totalPo)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ flex: 1 }}>
              {!selectedSupplier && (
                <div
                  style={{
                    minHeight: 320,
                    background: COLORS.white,
                    borderRadius: 12,
                    border: `1px dashed ${COLORS.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.textMuted,
                  }}
                >
                  Select a supplier to view details
                </div>
              )}

              {selectedSupplier && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div
                    style={{
                      background: COLORS.white,
                      borderRadius: 12,
                      border: `1px solid ${COLORS.border}`,
                      padding: "20px 24px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                          <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>
                            {selectedSupplier.name}
                          </h2>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: (catColors[selectedSupplier.category] ?? { color: COLORS.textMuted }).color,
                              background: (catColors[selectedSupplier.category] ?? { bg: COLORS.bg }).bg,
                              padding: "2px 8px",
                              borderRadius: 8,
                              textTransform: "capitalize",
                            }}
                          >
                            {selectedSupplier.category}
                          </span>
                          {selectedSupplier.division && <DivisionBadge div={selectedSupplier.division} />}
                        </div>
                        <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
                          {selectedSupplier.specialty}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        ["Contact", selectedSupplier.contact],
                        ["Email", selectedSupplier.email],
                        ["Phone", selectedSupplier.phone],
                        ["Region", selectedSupplier.region],
                        ["Payment Terms", selectedSupplier.paymentTerms ? `${selectedSupplier.paymentTerms} days` : "-"],
                        ["Active", selectedSupplier.isActive ? "Yes" : "No"],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: "flex", gap: 8 }}>
                          <span
                            style={{
                              fontSize: 12,
                              color: COLORS.textMuted,
                              fontWeight: 600,
                              minWidth: 110,
                              flexShrink: 0,
                            }}
                          >
                            {label}
                          </span>
                          <span style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 500 }}>
                            {value || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      background: COLORS.white,
                      borderRadius: 12,
                      border: `1px solid ${COLORS.border}`,
                      overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        padding: "14px 20px",
                        borderBottom: `1px solid ${COLORS.border}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>
                        Purchase Orders
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.teal }}>
                        {currency(selectedSupplier.pos.reduce((sum, po) => sum + Number(po.amount || 0), 0))}
                      </span>
                    </div>

                    {selectedSupplier.pos.length === 0 && (
                      <div style={{ padding: "20px", color: COLORS.textMuted, fontSize: 13 }}>
                        No purchase orders recorded for this supplier yet.
                      </div>
                    )}

                    {selectedSupplier.pos.length > 0 && (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: COLORS.bg }}>
                            {["PO #", "Job", "Description", "Amount", "Date", "Status"].map((heading) => (
                              <th
                                key={heading}
                                style={{
                                  padding: "8px 16px",
                                  textAlign: "left",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: COLORS.textSecondary,
                                  textTransform: "uppercase",
                                  borderBottom: `1px solid ${COLORS.border}`,
                                }}
                              >
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSupplier.pos.map((po) => {
                            const status = poStatusCfg[po.status] ?? poStatusCfg.pending;
                            return (
                              <tr key={po.id}>
                                <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                                  <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: COLORS.navy }}>
                                    {po.id}
                                  </span>
                                </td>
                                <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                                  <span style={{ fontFamily: "monospace", fontSize: 11 }}>
                                    {po.job || "-"}
                                  </span>
                                </td>
                                <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textSecondary }}>
                                  {po.description}
                                </td>
                                <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, fontWeight: 700, color: COLORS.textPrimary }}>
                                  {currency(po.amount)}
                                </td>
                                <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textMuted }}>
                                  {po.date || "-"}
                                </td>
                                <td style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      padding: "2px 8px",
                                      borderRadius: 10,
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: status.color,
                                      background: status.bg,
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.color }} />
                                    {status.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === "ap" && (
        <APReconciliationTab
          invoices={supplierInvoices}
          suppliers={suppliers}
        />
      )}
    </div>
  );
};

export default SuppliersScreen;
