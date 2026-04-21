import React from "react";
import { COLORS, icons, fmt, pct } from "../appData.js";
import { Icon, StatusBadge, KpiCard, ProgressBar } from "../components/ui.jsx";
const DashboardScreen = ({ onNavigate, jobs = [], invoices = [], timesheets = [], regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  const gf = j => (regionFilter === "all" || j.region === regionFilter) && divisionFilter[j.division];
  const filteredJOBS = jobs.filter(gf);
  const active = filteredJOBS.filter(j => j.status === "active");
  const totalRevenue = filteredJOBS.reduce((s, j) => s + (j.contractValue || 0), 0);
  const totalInvoiced = filteredJOBS.reduce((s, j) => s + (j.invoiced || 0), 0);
  const overdueInvoices = invoices.filter(i => i.status === "overdue");
  const pendingTS = timesheets.filter(t => t.status === "submitted").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Good morning, Sean</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Wednesday, 11 March 2026 ? here's what's happening today</p>
          {(regionFilter !== "all" || !divisionFilter.Water || !divisionFilter.Geotech) && (
            <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {regionFilter !== "all" && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 10, color: COLORS.amber, background: COLORS.amber + "20", border: `1px solid ${COLORS.amber}40` }}>Region: {regionFilter}</span>}
              {!divisionFilter.Water && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 10, color: COLORS.textMuted, background: COLORS.bg, border: `1px solid ${COLORS.border}`, textDecoration: "line-through" }}>Water hidden</span>}
              {!divisionFilter.Geotech && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 10, color: COLORS.textMuted, background: COLORS.bg, border: `1px solid ${COLORS.border}`, textDecoration: "line-through" }}>Geotech hidden</span>}
            </div>
          )}
        </div>
        <button onClick={() => onNavigate("newjob")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: "0.01em" }}>
          <Icon d={icons.plus} size={14} color={COLORS.navy} /> New Job
        </button>
      </div>

      {/* Alerts */}
      {(overdueInvoices.length > 0 || pendingTS > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {overdueInvoices.map(inv => (
            <div key={inv.id} onClick={() => onNavigate("finance")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, cursor: "pointer" }}>
              <Icon d={icons.alert} size={15} color={COLORS.red} />
              <span style={{ fontSize: 13, color: "#991B1B" }}>Overdue invoice {inv.id} ? {inv.client} ? {fmt(inv.amount)} was due {inv.dueDate}</span>
              <Icon d={icons.chevronRight} size={13} color="#991B1B" style={{ marginLeft: "auto" }} />
            </div>
          ))}
          {pendingTS > 0 && (
            <div onClick={() => onNavigate("timesheets")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: COLORS.amberLight, border: `1px solid #FDE68A`, borderRadius: 8, cursor: "pointer" }}>
              <Icon d={icons.clock} size={15} color={COLORS.amberDark} />
              <span style={{ fontSize: 13, color: "#92400E" }}>{pendingTS} timesheet{pendingTS > 1 ? "s" : ""} waiting for your approval</span>
              <Icon d={icons.chevronRight} size={13} color="#92400E" style={{ marginLeft: "auto" }} />
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <KpiCard label="Active Jobs" value={active.length} sub={`${filteredJOBS.filter(j=>j.status==="approved").length} approved, starting soon`} accent={COLORS.teal} icon={icons.jobs} />
        <KpiCard label="Contract Pipeline" value={fmt(totalRevenue)} sub="Total value across all live jobs" accent={COLORS.blue} icon={icons.finance} trend="up" />
        <KpiCard label="Invoiced YTD" value={fmt(totalInvoiced)} sub={`${pct(totalInvoiced, totalRevenue)}% of pipeline billed`} accent={COLORS.amber} icon={icons.reports} />
        <KpiCard label="Outstanding" value={fmt(overdueInvoices.reduce((s,i)=>s+i.amount,0))} sub={`${overdueInvoices.length} overdue invoice${overdueInvoices.length!==1?"s":""}`} accent={COLORS.red} icon={icons.alert} trend="down" />
      </div>

      {/* Active Jobs + Division Split */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        {/* Active jobs table */}
        <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>Active Jobs</span>
            <button onClick={() => onNavigate("jobs")} style={{ fontSize: 12, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all ?</button>
          </div>
          <div>
            {filteredJOBS.filter(j => ["active","approved"].includes(j.status)).map((job, i) => (
              <div key={job.id} onClick={() => onNavigate("jobdetail", job)} style={{ padding: "14px 20px", borderBottom: i < 4 ? `1px solid ${COLORS.border}` : "none", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: job.division === "Water" ? COLORS.blueLight : COLORS.tealLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon d={icons.jobs} size={16} color={job.division === "Water" ? COLORS.blue : COLORS.teal} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>{job.id}</span>
                    <span style={{ color: COLORS.border }}>?</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>{job.client}</span>
                    <span style={{ color: COLORS.border }}>?</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>{job.region}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <StatusBadge status={job.status} />
                  {job.contractValue && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>{fmt(job.contractValue)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Division split */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>Active by Division</span>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {[{ name: "Water", color: COLORS.blue }, { name: "Geotech", color: COLORS.teal }].map(div => {
                const divJobs = filteredJOBS.filter(j => j.division === div.name && j.status === "active");
                return (
                  <div key={div.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{div.name}</span>
                      <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{divJobs.length} job{divJobs.length !== 1 ? "s" : ""}</span>
                    </div>
                    <ProgressBar value={divJobs.length} max={active.length} color={div.color} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Locations */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>Jobs by Location</span>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {["South", "North"].map(loc => {
                const count = filteredJOBS.filter(j => j.region === loc && ["active","approved"].includes(j.status)).length;
                return (
                  <div key={loc} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon d={icons.mapPin} size={13} color={COLORS.textMuted} />
                      <span style={{ fontSize: 13, color: COLORS.textPrimary }}>{loc}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, background: COLORS.bg, padding: "2px 10px", borderRadius: 12, border: `1px solid ${COLORS.border}` }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending timesheets */}
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>Pending Approvals</span>
              <span style={{ fontSize: 11, background: COLORS.amber + "30", color: COLORS.amberDark, fontWeight: 700, borderRadius: 10, padding: "2px 8px" }}>{pendingTS}</span>
            </div>
            {timesheets.filter(t => t.status === "submitted").map(ts => (
              <div key={ts.id} onClick={() => onNavigate("timesheets")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{ts.user}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{ts.week}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.teal }}>{ts.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
