import React, { useState, useMemo } from "react";
import {
  COLORS,
  statusConfig,
  JOBS,
  ESTIMATES,
  EQUIPMENT,
  icons,
  INVOICES,
  estimateStatusConfig,
  calcEstimateTotal,
  JOB_COSTS,
  TIMESHEET_DETAIL,
} from "../appData.js";
import {
  DivisionBadge,
  BarChart,
  HBarChart,
  DonutChart,
  StatCard,
  ReportCard,
  DateRangePicker,
  Icon,
} from "../components/ui.jsx";
const ReportsScreen = ({ estimates = ESTIMATES, regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  const [activeReport, setActiveReport] = useState("overview");
  const [divFilter, setDivFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo,   setDateTo]   = useState("2026-03-31");

  const handleDateChange = (from, to) => { setDateFrom(from); setDateTo(to); };

  const reports = [
    { id: "overview",    label: "Executive Overview",  icon: icons.dashboard },
    { id: "profitability", label: "Job Profitability", icon: icons.finance },
    { id: "utilisation", label: "Rig Utilisation",     icon: icons.jobs },
    { id: "pipeline",    label: "Revenue Pipeline",    icon: icons.estimates },
    { id: "debtors",     label: "Aged Debtors",        icon: icons.finance },
    { id: "timesheets",  label: "Timesheet Summary",   icon: icons.time },
    { id: "divpnl",      label: "Division P&L",        icon: icons.reports },
  ];

  // â”€â”€ Filtered jobs for date range â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredJobs = useMemo(() => JOBS.filter(j => {
    if (regionFilter !== "all" && j.region !== regionFilter) return false;
    if (!divisionFilter[j.division]) return false;
    if (divFilter !== "all" && j.division !== divFilter) return false;
    if (j.startDate && j.startDate > dateTo) return false;
    if (j.endDate && j.endDate < dateFrom) return false;
    return true;
  }), [divFilter, dateFrom, dateTo, regionFilter, divisionFilter]);

  const filteredEstimates = useMemo(() => estimates.filter(e => {
    if (regionFilter !== "all" && e.region !== regionFilter) return false;
    if (!divisionFilter[e.division]) return false;
    if (divFilter !== "all" && e.division !== divFilter) return false;
    if (e.date && (e.date < dateFrom || e.date > dateTo)) return false;
    return true;
  }), [dateFrom, dateTo, divFilter, divisionFilter, estimates, regionFilter]);

  // â”€â”€ 1. EXECUTIVE OVERVIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const OverviewReport = () => {
    const totalContracted  = filteredJobs.reduce((s, j) => s + (j.contractValue || 0), 0);
    const totalInvoiced    = INVOICES.reduce((s, i) => s + i.amount, 0);
    const totalOutstanding = INVOICES.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
    const totalOverdue     = INVOICES.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
    const activeJobs       = filteredJobs.filter(j => j.status === "active").length;
    const rigUtil          = Math.round((EQUIPMENT.filter(e => e.type === "rig" && e.status === "deployed").length / EQUIPMENT.filter(e => e.type === "rig").length) * 100);

    const jobsByStatus = Object.entries(
      filteredJobs.reduce((acc, j) => { acc[j.status] = (acc[j.status] || 0) + 1; return acc; }, {})
    ).map(([k, v]) => ({ label: statusConfig[k]?.label || k, value: v, color: statusConfig[k]?.color }));

    const monthlyInvoiced = [
      { label: "Nov", value: 57500 }, { label: "Dec", value: 28400 },
      { label: "Jan", value: 53500 }, { label: "Feb", value: 30750 },
      { label: "Mar", value: 21250 }, { label: "Apr", value: 0 },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <StatCard label="Total Contract Value" value={`$${(totalContracted/1000).toFixed(0)}k`} sub="All active & complete jobs" color={COLORS.blue} accent={COLORS.blue} />
          <StatCard label="Total Invoiced (YTD)" value={`$${(totalInvoiced/1000).toFixed(0)}k`} sub={`$${(totalOutstanding/1000).toFixed(0)}k outstanding`} color={COLORS.teal} accent={COLORS.teal} />
          <StatCard label="Overdue Receivables" value={`$${(totalOverdue/1000).toFixed(0)}k`} sub="Requires follow-up" color={COLORS.red} accent={COLORS.red} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <StatCard label="Active Jobs" value={activeJobs} sub={`${filteredJobs.length} jobs total`} />
          <StatCard label="Rig Utilisation" value={`${rigUtil}%`} sub="Rigs currently deployed" color={rigUtil >= 60 ? COLORS.green : COLORS.orange} />
          <StatCard label="Pending Estimates" value={`$${(filteredEstimates.filter(e => e.status === "sent").reduce((s,e) => s + calcEstimateTotal(e), 0)/1000).toFixed(0)}k`} sub="Awaiting client decision" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ReportCard title="Monthly Invoiced Revenue">
            <BarChart data={monthlyInvoiced} color={COLORS.blue} />
          </ReportCard>
          <ReportCard title="Jobs by Status">
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <DonutChart segments={jobsByStatus.map(d => ({ value: d.value, color: d.color }))} size={110} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {jobsByStatus.map(d => (
                  <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                      <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ReportCard>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ReportCard title="Division Split ? Contract Value">
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <DonutChart segments={[
                { value: filteredJobs.filter(j=>j.division==="Water").reduce((s,j)=>s+(j.contractValue||0),0), color: COLORS.blue },
                { value: filteredJobs.filter(j=>j.division==="Geotech").reduce((s,j)=>s+(j.contractValue||0),0), color: COLORS.teal },
              ]} size={110} />
              <div style={{ flex: 1 }}>
                {[{ label: "Water", color: COLORS.blue }, { label: "Geotech", color: COLORS.teal }].map(d => {
                  const val = filteredJobs.filter(j=>j.division===d.label).reduce((s,j)=>s+(j.contractValue||0),0);
                  return (
                    <div key={d.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                        <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{d.label}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>${(val/1000).toFixed(0)}k</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </ReportCard>
          <ReportCard title="Top 5 Clients by Contract Value">
            <HBarChart
              data={[...filteredJobs].filter(j=>j.contractValue).reduce((acc, j) => {
                const ex = acc.find(a=>a.label===j.client);
                if (ex) ex.value += j.contractValue; else acc.push({ label: j.client, value: j.contractValue });
                return acc;
              }, []).sort((a,b)=>b.value-a.value).slice(0,5).map(d => ({ ...d, display: `$${(d.value/1000).toFixed(0)}k`, pct: null }))
              }
              color={COLORS.navy}
            />
          </ReportCard>
        </div>
      </div>
    );
  };

  // â”€â”€ 2. JOB PROFITABILITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ProfitabilityReport = () => {
    const rows = filteredJobs.filter(j => j.contractValue).map(j => {
      const costs = JOB_COSTS[j.id] || { subcontractorCosts: 0, labourCosts: 0, otherCosts: 0 };
      const totalCost = costs.subcontractorCosts + costs.labourCosts + costs.otherCosts;
      const grossProfit = j.invoiced - totalCost;
      const margin = j.invoiced > 0 ? Math.round((grossProfit / j.invoiced) * 100) : null;
      return { ...j, ...costs, totalCost, grossProfit, margin };
    }).sort((a, b) => (b.contractValue || 0) - (a.contractValue || 0));

    const totals = rows.reduce((acc, r) => ({
      contract: acc.contract + r.contractValue,
      invoiced: acc.invoiced + r.invoiced,
      costs: acc.costs + r.totalCost,
      profit: acc.profit + r.grossProfit,
    }), { contract: 0, invoiced: 0, costs: 0, profit: 0 });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <StatCard label="Total Contract" value={`$${(totals.contract/1000).toFixed(0)}k`} accent={COLORS.blue} />
          <StatCard label="Total Invoiced" value={`$${(totals.invoiced/1000).toFixed(0)}k`} accent={COLORS.teal} />
          <StatCard label="Total Costs" value={`$${(totals.costs/1000).toFixed(0)}k`} accent={COLORS.orange} />
          <StatCard label="Gross Profit" value={`$${(totals.profit/1000).toFixed(0)}k`} sub={totals.invoiced > 0 ? `${Math.round((totals.profit/totals.invoiced)*100)}% margin` : ""} color={totals.profit >= 0 ? COLORS.green : COLORS.red} accent={COLORS.green} />
        </div>
        <ReportCard title="Job Profitability Breakdown">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  {["Job","Client","Division","Contract","Invoiced","Sub costs","Labour","Other","Total Cost","Gross Profit","Margin"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: h === "Job" || h === "Client" || h === "Division" ? "left" : "right", fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : COLORS.bg }}>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLORS.navy }}>{r.id}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textPrimary, maxWidth: 140 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.client}</div></td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}` }}><DivisionBadge div={r.division} /></td>
                    {[r.contractValue, r.invoiced, r.subcontractorCosts, r.labourCosts, r.otherCosts, r.totalCost].map((v, vi) => (
                      <td key={vi} style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 12, fontFamily: "monospace", color: COLORS.textPrimary }}>
                        {v > 0 ? `$${v.toLocaleString()}` : <span style={{ color: COLORS.textMuted }}>?</span>}
                      </td>
                    ))}
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: r.grossProfit >= 0 ? COLORS.green : COLORS.red }}>
                      {r.invoiced > 0 ? `$${r.grossProfit.toLocaleString()}` : <span style={{ color: COLORS.textMuted }}>?</span>}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right" }}>
                      {r.margin != null ? (
                        <span style={{ fontSize: 12, fontWeight: 800, color: r.margin >= 30 ? COLORS.green : r.margin >= 15 ? COLORS.amber : COLORS.red }}>{r.margin}%</span>
                      ) : <span style={{ color: COLORS.textMuted, fontSize: 12 }}>?</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: COLORS.navyLight }}>
                  <td colSpan={3} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: COLORS.white }}>TOTALS</td>
                  {[totals.contract, totals.invoiced, 0, 0, 0, totals.costs].map((v, vi) => (
                    <td key={vi} style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: COLORS.white }}>
                      {vi === 2 || vi === 3 || vi === 4 ? "" : `$${v.toLocaleString()}`}
                    </td>
                  ))}
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, fontFamily: "monospace", fontWeight: 800, color: COLORS.amber }}>${totals.profit.toLocaleString()}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, fontWeight: 800, color: COLORS.amber }}>{totals.invoiced > 0 ? `${Math.round((totals.profit/totals.invoiced)*100)}%` : ""}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </ReportCard>
        <ReportCard title="Margin by Job">
          <BarChart
            data={rows.filter(r => r.margin != null).map(r => ({ label: r.id, value: r.margin }))}
            color={(d) => d.value >= 30 ? COLORS.green : d.value >= 15 ? COLORS.amber : COLORS.red}
            showValues={true}
          />
        </ReportCard>
      </div>
    );
  };

  // â”€â”€ 3. RIG UTILISATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const UtilisationReport = () => {
    const rangeStart = new Date(dateFrom);
    const rangeEnd   = new Date(dateTo);
    const rangeDays  = Math.max(1, Math.round((rangeEnd - rangeStart) / 86400000));

    const rigData = RIGS.map(rig => {
      const rigJobs = PLANNER_JOBS.filter(pj => pj.rigId === rig.id);
      let deployedDays = 0, maintenanceDays = 0;
      rigJobs.forEach(pj => {
        const s = new Date(Math.max(new Date(pj.start), rangeStart));
        const e = new Date(Math.min(new Date(pj.end), rangeEnd));
        const days = Math.max(0, Math.round((e - s) / 86400000));
        if (pj.isDowntime) maintenanceDays += days; else deployedDays += days;
      });
      const availableDays = rangeDays - maintenanceDays;
      const utilPct = availableDays > 0 ? Math.round((deployedDays / availableDays) * 100) : 0;
      return { rig, deployedDays, maintenanceDays, availableDays, utilPct };
    });

    const avgUtil = Math.round(rigData.reduce((s, r) => s + r.utilPct, 0) / rigData.length);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <StatCard label="Average Utilisation" value={`${avgUtil}%`} sub="Across all rigs" color={avgUtil >= 60 ? COLORS.green : COLORS.orange} accent={COLORS.blue} />
          <StatCard label="Total Rig Days Available" value={rigData.reduce((s,r)=>s+r.availableDays,0)} sub={`${rangeDays} day period`} accent={COLORS.teal} />
          <StatCard label="Total Deployed Days" value={rigData.reduce((s,r)=>s+r.deployedDays,0)} accent={COLORS.green} />
        </div>
        <ReportCard title="Utilisation by Rig">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {rigData.map(rd => (
              <div key={rd.rig.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{rd.rig.name}</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 8 }}>{rd.rig.region} ? {rd.rig.category}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: rd.utilPct >= 60 ? COLORS.green : rd.utilPct >= 30 ? COLORS.amber : COLORS.red }}>{rd.utilPct}%</span>
                </div>
                <div style={{ display: "flex", height: 20, borderRadius: 6, overflow: "hidden", background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: `${(rd.deployedDays / rangeDays) * 100}%`, background: rd.rig.division === "Geotech" ? COLORS.teal : COLORS.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {rd.deployedDays > 5 && <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>Deployed {rd.deployedDays}d</span>}
                  </div>
                  <div style={{ width: `${(rd.maintenanceDays / rangeDays) * 100}%`, background: COLORS.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {rd.maintenanceDays > 5 && <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>Maint {rd.maintenanceDays}d</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: COLORS.textMuted }}>Deployed: <b style={{ color: COLORS.textSecondary }}>{rd.deployedDays}d</b></span>
                  <span style={{ fontSize: 10, color: COLORS.textMuted }}>Maintenance: <b style={{ color: COLORS.textSecondary }}>{rd.maintenanceDays}d</b></span>
                  <span style={{ fontSize: 10, color: COLORS.textMuted }}>Idle: <b style={{ color: COLORS.textSecondary }}>{Math.max(0, rd.availableDays - rd.deployedDays)}d</b></span>
                </div>
              </div>
            ))}
          </div>
        </ReportCard>
        <ReportCard title="Utilisation Rate Comparison">
          <BarChart
            data={rigData.map(rd => ({ label: rd.rig.name.split(" ? ")[0], value: rd.utilPct }))}
            color={(d) => d.value >= 60 ? COLORS.green : d.value >= 30 ? COLORS.amber : COLORS.red}
            height={140}
          />
        </ReportCard>
      </div>
    );
  };

  // â”€â”€ 4. REVENUE PIPELINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const PipelineReport = () => {
    const stages = ["draft", "sent", "under_review", "approved", "declined"];
    const stageData = stages.map(s => {
      const ests = filteredEstimates.filter(e => e.status === s);
      return { status: s, count: ests.length, value: ests.reduce((sum, e) => sum + calcEstimateTotal(e), 0) };
    });
    const funnelTotal = stageData.filter(s => s.status !== "declined").reduce((sum, s) => sum + s.value, 0);
    const submittedEstimateCount = filteredEstimates.filter(e => e.status !== "draft").length;
    const winRate = submittedEstimateCount > 0
      ? Math.round((filteredEstimates.filter(e => e.status === "approved").length / submittedEstimateCount) * 100)
      : 0;

    const funnelColors = { draft: "#94A3B8", sent: COLORS.blue, under_review: "#7C3AED", approved: COLORS.green, declined: COLORS.red };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <StatCard label="Total Estimates" value={filteredEstimates.length} accent={COLORS.blue} />
          <StatCard label="Pipeline Value" value={`$${(funnelTotal/1000).toFixed(1)}k`} sub="excl. declined" accent={COLORS.teal} />
          <StatCard label="Approved Value" value={`$${(stageData.find(s=>s.status==="approved")?.value/1000||0).toFixed(1)}k`} color={COLORS.green} accent={COLORS.green} />
          <StatCard label="Win Rate" value={`${winRate}%`} sub="Approved vs sent" color={winRate >= 50 ? COLORS.green : COLORS.orange} accent={COLORS.amber} />
        </div>

        <ReportCard title="Estimate Funnel ? Value by Stage">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stageData.map((sd, i) => {
              const cfg = estimateStatusConfig[sd.status];
              const widthPct = funnelTotal > 0 ? (sd.value / funnelTotal) * 100 : 0;
              return (
                <div key={sd.status} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 90, fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, textAlign: "right", flexShrink: 0 }}>{cfg?.label || sd.status}</div>
                  <div style={{ flex: 1, height: 32, background: COLORS.bg, borderRadius: 6, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
                    <div style={{ height: "100%", width: `${Math.max(widthPct, sd.value > 0 ? 3 : 0)}%`, background: funnelColors[sd.status], borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 10 }}>
                      {sd.value > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>${(sd.value/1000).toFixed(1)}k</span>}
                    </div>
                  </div>
                  <div style={{ width: 60, display: "flex", flex: "0 0 60px", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{sd.count}</span>
                    <span style={{ fontSize: 10, color: COLORS.textMuted }}>estimate{sd.count !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ReportCard>

        <ReportCard title="Estimates Detail">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                {["Estimate #", "Client", "Title", "Division", "Total", "Status", "Valid Until"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEstimates.map((e, i) => {
                const cfg = estimateStatusConfig[e.status];
                const total = calcEstimateTotal(e);
                return (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? "transparent" : COLORS.bg }}>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: COLORS.navy }}>{e.id}</td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textPrimary }}>{e.client}</td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textSecondary, maxWidth: 200 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div></td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}` }}><DivisionBadge div={e.division} /></td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLORS.textPrimary }}>${total.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: cfg?.color, background: cfg?.bg }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg?.color }} />{cfg?.label}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: new Date(e.validUntil) < new Date() ? COLORS.red : COLORS.textMuted }}>{e.validUntil}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ReportCard>
      </div>
    );
  };

  // â”€â”€ 5. AGED DEBTORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const AgedDebtorsReport = () => {
    const today = new Date("2026-03-11");
    const enriched = INVOICES.filter(i => i.status !== "paid").map(i => {
      const due = new Date(i.dueDate);
      const age = Math.round((today - due) / 86400000);
      const bucket = age <= 0 ? "current" : age <= 30 ? "1-30" : age <= 60 ? "31-60" : "61+";
      return { ...i, age, bucket };
    });

    const buckets = [
      { key: "current", label: "Current", color: COLORS.green },
      { key: "1-30",    label: "1?30 days", color: COLORS.amber },
      { key: "31-60",   label: "31?60 days", color: COLORS.orange },
      { key: "61+",     label: "61+ days", color: COLORS.red },
    ];

    const bucketTotals = buckets.map(b => ({
      ...b,
      amount: enriched.filter(i => i.bucket === b.key).reduce((s, i) => s + i.amount, 0),
      count: enriched.filter(i => i.bucket === b.key).length,
    }));

    const totalOutstanding = enriched.reduce((s, i) => s + i.amount, 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {bucketTotals.map(b => (
            <StatCard key={b.key} label={b.label} value={b.amount > 0 ? `$${(b.amount/1000).toFixed(1)}k` : "$0"} sub={`${b.count} invoice${b.count !== 1 ? "s" : ""}`} color={b.amount > 0 ? b.color : COLORS.textMuted} accent={b.color} />
          ))}
        </div>

        <ReportCard title="Outstanding Invoices">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                {["Invoice #", "Client", "Job", "Issue Date", "Due Date", "Days Overdue", "Amount", "Bucket"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: h === "Amount" ? "right" : "left", fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enriched.sort((a, b) => b.age - a.age).map((inv, i) => {
                const b = buckets.find(bk => bk.key === inv.bucket);
                return (
                  <tr key={inv.id} style={{ background: i % 2 === 0 ? "transparent" : COLORS.bg }}>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: COLORS.navy }}>{inv.id}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textPrimary }}>{inv.client}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}` }}><span style={{ fontFamily: "monospace", fontSize: 11, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "2px 6px" }}>{inv.job}</span></td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textMuted }}>{inv.issueDate}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textMuted }}>{inv.dueDate}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "left" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: inv.age > 0 ? b?.color : COLORS.green }}>
                        {inv.age > 0 ? `${inv.age} days` : "Not due"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: COLORS.textPrimary }}>${inv.amount.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700, background: b?.color + "20", color: b?.color, textTransform: "uppercase" }}>{b?.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: COLORS.navyLight }}>
                <td colSpan={6} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: COLORS.white }}>TOTAL OUTSTANDING</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: COLORS.amber }}>${totalOutstanding.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </ReportCard>

        <ReportCard title="Ageing Profile">
          <BarChart
            data={bucketTotals.map(b => ({ label: b.label, value: b.amount }))}
            color={(d, i) => buckets[i]?.color || COLORS.blue}
            height={130}
          />
        </ReportCard>
      </div>
    );
  };

  // â”€â”€ 6. TIMESHEET SUMMARY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const TimesheetSummaryReport = () => {
    const inRange = TIMESHEET_DETAIL.filter(t => t.week >= dateFrom && t.week <= dateTo);

    const byPerson = Object.values(inRange.reduce((acc, t) => {
      if (!acc[t.user]) acc[t.user] = { user: t.user, role: t.role, totalHours: 0, jobs: {} };
      acc[t.user].totalHours += t.hours;
      acc[t.user].jobs[t.job] = (acc[t.user].jobs[t.job] || 0) + t.hours;
      return acc;
    }, {})).sort((a, b) => b.totalHours - a.totalHours);

    const byJob = Object.values(inRange.reduce((acc, t) => {
      if (!acc[t.job]) acc[t.job] = { job: t.job, totalHours: 0, people: new Set() };
      acc[t.job].totalHours += t.hours;
      acc[t.job].people.add(t.user);
      return acc;
    }, {})).sort((a, b) => b.totalHours - a.totalHours);

    const totalHours = inRange.reduce((s, t) => s + t.hours, 0);
    const weeks = [...new Set(inRange.map(t => t.week))].sort();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <StatCard label="Total Hours" value={totalHours} sub={`${weeks.length} week${weeks.length !== 1 ? "s" : ""}`} accent={COLORS.blue} />
          <StatCard label="People" value={byPerson.length} accent={COLORS.teal} />
          <StatCard label="Jobs with Hours" value={byJob.length} accent={COLORS.amber} />
          <StatCard label="Avg Hrs / Person / Week" value={byPerson.length && weeks.length ? Math.round(totalHours / byPerson.length / weeks.length) : 0} sub="per week" accent={COLORS.green} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ReportCard title="Hours by Person">
            <HBarChart
              data={byPerson.map(p => ({ label: p.user, value: p.totalHours, display: `${p.totalHours}h`, pct: null }))}
              color={COLORS.navy}
            />
          </ReportCard>
          <ReportCard title="Hours by Job">
            <HBarChart
              data={byJob.map(j => {
                const job = JOBS.find(jb => jb.id === j.job);
                return { label: j.job + (job ? ` (${job.client.split(" ")[0]})` : ""), value: j.totalHours, display: `${j.totalHours}h`, pct: null };
              })}
              color={(d, i) => {
                const job = JOBS.find(j => j.id === byJob[i]?.job);
                return job?.division === "Geotech" ? COLORS.teal : COLORS.blue;
              }}
            />
          </ReportCard>
        </div>

        <ReportCard title="Weekly Hours Log">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${COLORS.border}` }}>Person</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${COLORS.border}` }}>Role</th>
                  {weeks.map(w => <th key={w} style={{ padding: "8px 12px", textAlign: "right", fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{new Date(w).toLocaleDateString("en-NZ", { day:"numeric", month:"short" })}</th>)}
                  <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${COLORS.border}` }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {byPerson.map((p, i) => (
                  <tr key={p.user} style={{ background: i % 2 === 0 ? "transparent" : COLORS.bg }}>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary }}>{p.user}</td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.textMuted }}>{p.role}</td>
                    {weeks.map(w => {
                      const entry = inRange.find(t => t.user === p.user && t.week === w);
                      return <td key={w} style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 12, fontFamily: "monospace", color: entry ? COLORS.textPrimary : COLORS.textMuted }}>{entry ? entry.hours : "?"}</td>;
                    })}
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, fontFamily: "monospace" }}>{p.totalHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportCard>
      </div>
    );
  };

  // â”€â”€ 7. DIVISION P&L â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const DivisionPnLReport = () => {
    const divs = ["Water", "Geotech"];
    const divData = divs.map(div => {
      const jobs = JOBS.filter(j => j.division === div);
      const revenue = INVOICES.filter(i => jobs.some(j => j.id === i.job)).reduce((s, i) => s + i.amount, 0);
      const subCosts = jobs.reduce((s, j) => s + (JOB_COSTS[j.id]?.subcontractorCosts || 0), 0);
      const labourCosts = jobs.reduce((s, j) => s + (JOB_COSTS[j.id]?.labourCosts || 0), 0);
      const otherCosts = jobs.reduce((s, j) => s + (JOB_COSTS[j.id]?.otherCosts || 0), 0);
      const totalCosts = subCosts + labourCosts + otherCosts;
      const grossProfit = revenue - totalCosts;
      const margin = revenue > 0 ? Math.round((grossProfit / revenue) * 100) : 0;
      const contractValue = jobs.reduce((s, j) => s + (j.contractValue || 0), 0);
      const pipelineValue = filteredEstimates.filter(e => e.division === div && e.status === "sent").reduce((s, e) => s + calcEstimateTotal(e), 0);
      return { div, jobs: jobs.length, contractValue, revenue, subCosts, labourCosts, otherCosts, totalCosts, grossProfit, margin, pipelineValue };
    });

    const totals = divData.reduce((acc, d) => ({
      contractValue: acc.contractValue + d.contractValue,
      revenue: acc.revenue + d.revenue,
      subCosts: acc.subCosts + d.subCosts,
      labourCosts: acc.labourCosts + d.labourCosts,
      otherCosts: acc.otherCosts + d.otherCosts,
      totalCosts: acc.totalCosts + d.totalCosts,
      grossProfit: acc.grossProfit + d.grossProfit,
    }), { contractValue: 0, revenue: 0, subCosts: 0, labourCosts: 0, otherCosts: 0, totalCosts: 0, grossProfit: 0 });

    const divColors = { Water: COLORS.blue, Geotech: COLORS.teal };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {divData.map(d => (
            <div key={d.div} style={{ background: COLORS.white, borderRadius: 12, border: `2px solid ${divColors[d.div]}`, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: divColors[d.div] }}>{d.div} Division</div>
                <span style={{ fontSize: 22, fontWeight: 800, color: d.margin >= 0 ? COLORS.green : COLORS.red }}>{d.margin}% margin</span>
              </div>
              {[
                { label: "Contract Value",  value: d.contractValue, color: COLORS.textPrimary },
                { label: "Invoiced Revenue",value: d.revenue,       color: divColors[d.div] },
                { label: "Subcontractors",  value: -d.subCosts,     color: COLORS.orange },
                { label: "Labour Costs",    value: -d.labourCosts,  color: COLORS.orange },
                { label: "Other Costs",     value: -d.otherCosts,   color: COLORS.orange },
                { label: "Gross Profit",    value: d.grossProfit,   color: d.grossProfit >= 0 ? COLORS.green : COLORS.red, bold: true },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${COLORS.border}`, ...(row.bold ? { borderTop: `2px solid ${COLORS.border}`, marginTop: 4 } : {}) }}>
                  <span style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: row.bold ? 700 : 500 }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontFamily: "monospace", fontWeight: row.bold ? 800 : 600, color: row.color }}>
                    {row.value < 0 ? `-$${Math.abs(row.value).toLocaleString()}` : `$${row.value.toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <ReportCard title="Division Comparison ? Revenue vs Costs vs Profit">
          <div style={{ display: "flex", gap: 40, justifyContent: "center", paddingTop: 8 }}>
            {divData.map(d => (
              <div key={d.div} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 160 }}>
                  {[
                    { label: "Revenue",  value: d.revenue,      color: divColors[d.div] },
                    { label: "Costs",    value: d.totalCosts,   color: COLORS.orange },
                    { label: "Profit",   value: d.grossProfit,  color: COLORS.green },
                  ].map(bar => {
                    const maxVal = Math.max(d.revenue, d.totalCosts, d.grossProfit, 1);
                    const h = Math.max((Math.abs(bar.value) / maxVal) * 130, bar.value !== 0 ? 4 : 0);
                    return (
                      <div key={bar.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 54 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.textSecondary }}>${(bar.value/1000).toFixed(0)}k</span>
                        <div style={{ width: "100%", height: h, background: bar.color, borderRadius: "4px 4px 0 0" }} />
                        <span style={{ fontSize: 9, color: COLORS.textMuted }}>{bar.label}</span>
                      </div>
                    );
                  })}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: divColors[d.div] }}>{d.div}</span>
              </div>
            ))}
          </div>
        </ReportCard>

        <ReportCard title="Combined P&L Summary">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                {["Line Item", "Water", "Geotech", "Total"].map(h => (
                  <th key={h} style={{ padding: "8px 16px", textAlign: h === "Line Item" ? "left" : "right", fontSize: 10, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Contract Value",  water: divData[0].contractValue, geo: divData[1].contractValue },
                { label: "Invoiced Revenue",water: divData[0].revenue,       geo: divData[1].revenue,       bold: false, accent: true },
                { label: "Subcontractor Costs", water: divData[0].subCosts,  geo: divData[1].subCosts,      neg: true },
                { label: "Labour Costs",    water: divData[0].labourCosts,   geo: divData[1].labourCosts,   neg: true },
                { label: "Other Costs",     water: divData[0].otherCosts,    geo: divData[1].otherCosts,    neg: true },
                { label: "Gross Profit",    water: divData[0].grossProfit,   geo: divData[1].grossProfit,   bold: true },
                { label: "Margin %",        water: `${divData[0].margin}%`,  geo: `${divData[1].margin}%`,  isStr: true, bold: true },
              ].map((row, i) => (
                <tr key={row.label} style={{ background: row.bold ? COLORS.bg : "transparent" }}>
                  <td style={{ padding: "9px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: row.bold ? 700 : 500, color: COLORS.textSecondary }}>{row.label}</td>
                  {[row.water, row.geo, row.isStr ? "?" : row.water + row.geo].map((v, vi) => {
                    const isTotal = vi === 2 && !row.isStr;
                    const total = isTotal ? (typeof row.water === "number" ? row.water + row.geo : "?") : v;
                    const display = row.isStr ? (vi === 2 ? `${Math.round(((divData[0].grossProfit + divData[1].grossProfit) / (divData[0].revenue + divData[1].revenue)) * 100)}%` : v) : (typeof total === "number" ? `$${total.toLocaleString()}` : total);
                    const color = row.bold && typeof total === "number" ? (total >= 0 ? COLORS.green : COLORS.red) : COLORS.textPrimary;
                    return <td key={vi} style={{ padding: "9px 16px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 13, fontFamily: row.isStr ? "inherit" : "monospace", fontWeight: row.bold ? 800 : 600, color }}>{display}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </ReportCard>
      </div>
    );
  };

  const reportComponents = {
    overview:      <OverviewReport />,
    profitability: <ProfitabilityReport />,
    utilisation:   <UtilisationReport />,
    pipeline:      <PipelineReport />,
    debtors:       <AgedDebtorsReport />,
    timesheets:    <TimesheetSummaryReport />,
    divpnl:        <DivisionPnLReport />,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Reports</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>
            {reports.find(r => r.id === activeReport)?.label}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <DateRangePicker from={dateFrom} to={dateTo} onChange={handleDateChange} />
          <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
            {["all","Water","Geotech"].map(d => (
              <button key={d} onClick={() => setDivFilter(d)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: divFilter === d ? COLORS.white : "transparent", color: divFilter === d ? COLORS.textPrimary : COLORS.textMuted, boxShadow: divFilter === d ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{d}</button>
            ))}
          </div>
          <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: COLORS.navy, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.white, cursor: "pointer" }}>
            <Icon d={icons.externalLink} size={12} color={COLORS.white} /> Export PDF
          </button>
        </div>
      </div>

      {/* Report nav tabs */}
      <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 10, border: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
        {reports.map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: activeReport === r.id ? COLORS.white : "transparent", color: activeReport === r.id ? COLORS.textPrimary : COLORS.textMuted, boxShadow: activeReport === r.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none", whiteSpace: "nowrap" }}>
            <Icon d={r.icon} size={13} color={activeReport === r.id ? COLORS.amber : COLORS.textMuted} />
            {r.label}
          </button>
        ))}
      </div>

      {/* Active report */}
      {reportComponents[activeReport]}
    </div>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN APP
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// NEW MODULE STUBS ? HSE, Personnel, Plant Inspections, Invoicing, Field Reports
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default ReportsScreen;
