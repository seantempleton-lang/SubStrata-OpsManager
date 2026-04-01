import React, { useState, useMemo, useEffect } from "react";

const COLORS = {
  navy: "#0F1E2E",
  navyLight: "#172840",
  navyBorder: "#243650",
  slate: "#1E3448",
  amber: "#F59E0B",
  amberLight: "#FEF3C7",
  amberDark: "#D97706",
  teal: "#0D9488",
  tealLight: "#CCFBF1",
  red: "#EF4444",
  redLight: "#FEE2E2",
  green: "#10B981",
  greenLight: "#D1FAE5",
  blue: "#3B82F6",
  blueLight: "#DBEAFE",
  orange: "#F97316",
  orangeLight: "#FFEDD5",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  white: "#FFFFFF",
};

const statusConfig = {
  enquiry:   { label: "Enquiry",   color: "#6366F1", bg: "#EEF2FF" },
  quoted:    { label: "Quoted",    color: "#F59E0B", bg: "#FEF3C7" },
  approved:  { label: "Approved",  color: "#3B82F6", bg: "#DBEAFE" },
  active:    { label: "Active",    color: "#10B981", bg: "#D1FAE5" },
  on_hold:   { label: "On Hold",   color: "#F97316", bg: "#FFEDD5" },
  complete:  { label: "Complete",  color: "#64748B", bg: "#F1F5F9" },
  cancelled: { label: "Cancelled", color: "#EF4444", bg: "#FEE2E2" },
};

const JOBS = [
  { id: "100018", title: "Bore Installation — Station Road Farm", client: "Irrigation NZ Ltd", clientCode: "INZ", division: "Water", region: "South", status: "active", manager: "Sean Templeton", supervisor: "Craig Tait", contractValue: 42500, invoiced: 21250, startDate: "2026-02-10", endDate: "2026-03-20", type: "water_bore", hoursLogged: 184, site: "Station Road, Leeston" },
  { id: "200042", title: "Ground Investigation — Prestons Road", client: "Tonkin + Taylor", clientCode: "TNT", division: "Geotech", region: "South", status: "active", manager: "Lisa Park", supervisor: "Mike Brown", contractValue: 68000, invoiced: 0, startDate: "2026-03-01", endDate: "2026-04-15", type: "geotechnical", hoursLogged: 96, site: "Prestons Road, Christchurch" },
  { id: "100015", title: "Monitoring Bore Network — Selwyn District", client: "Selwyn District Council", clientCode: "SDC", division: "Water", region: "South", status: "complete", manager: "Sean Templeton", supervisor: "Craig Tait", contractValue: 115000, invoiced: 115000, startDate: "2025-11-01", endDate: "2026-02-28", type: "monitoring_bore", hoursLogged: 620, site: "Multiple, Selwyn District" },
  { id: "200038", title: "CPT Testing — Lincoln University Campus", client: "Lincoln University", clientCode: "LU", division: "Geotech", region: "South", status: "quoted", manager: "Lisa Park", supervisor: null, contractValue: 24000, invoiced: 0, startDate: null, endDate: null, type: "cpt_testing", hoursLogged: 0, site: "Lincoln University, Lincoln" },
  { id: "100021", title: "Irrigation Bore — Rakaia Gorge", client: "High Country Farms", clientCode: "HCF", division: "Water", region: "South", status: "approved", manager: "Sean Templeton", supervisor: "Dave Rudd", contractValue: 55000, invoiced: 0, startDate: "2026-03-15", endDate: "2026-05-01", type: "water_bore", hoursLogged: 0, site: "Rakaia Gorge Road, Canterbury" },
  { id: "200029", title: "Slope Stability Investigation — State Highway 73", client: "NZTA", clientCode: "NZTA", division: "Geotech", region: "North", status: "active", manager: "Kevin Lam", supervisor: "Pete Hāpai", contractValue: 132000, invoiced: 44000, startDate: "2026-01-20", endDate: "2026-04-30", type: "geotechnical", hoursLogged: 410, site: "SH73, West Auckland" },
  { id: "100009", title: "Rural Water Supply — Waipara Valley", client: "North Canterbury Vineyards", clientCode: "NCV", division: "Water", region: "South", status: "on_hold", manager: "Sean Templeton", supervisor: "Craig Tait", contractValue: 38000, invoiced: 9500, startDate: "2026-01-15", endDate: null, type: "water_bore", hoursLogged: 88, site: "Waipara Valley, North Canterbury" },
  { id: "200044", title: "Contamination Assessment — Industrial Site", client: "Aurora Energy", clientCode: "AE", division: "Geotech", region: "North", status: "enquiry", manager: null, supervisor: null, contractValue: null, invoiced: 0, startDate: null, endDate: null, type: "environmental", hoursLogged: 0, site: "East Tamaki, Auckland" },
];

// ── Timesheet Data ──────────────────────────────────────────────────────────
const STAFF = [
  { id: "u1", name: "Craig Tait",  initials: "CT", role: "Driller",              supervisor: "Sean Templeton", division: "Water",   region: "South" },
  { id: "u2", name: "Dave Rudd",   initials: "DR", role: "Driller",              supervisor: "Sean Templeton", division: "Water",   region: "South" },
  { id: "u3", name: "Pete Hāpai", initials: "PH", role: "Driller",              supervisor: "Kevin Lam",      division: "Geotech", region: "North" },
  { id: "u4", name: "Mike Brown",  initials: "MB", role: "Geotech Field Tech",   supervisor: "Lisa Park",      division: "Geotech", region: "South" },
  { id: "u5", name: "Sam Ohu",     initials: "SO", role: "Driller's Assistant",  supervisor: "Lisa Park",      division: "Geotech", region: "South" },
  { id: "u6", name: "Tony Walsh",  initials: "TW", role: "Driller's Assistant",  supervisor: "Sean Templeton", division: "Water",   region: "South" },
];

// Rate types
const RATE_TYPES = [
  { id: "ordinary",  label: "Ordinary",        multiplier: 1.0, color: "#3B82F6" },
  { id: "time_half", label: "Time & a Half",    multiplier: 1.5, color: "#F59E0B" },
  { id: "double",    label: "Double Time",      multiplier: 2.0, color: "#EF4444" },
  { id: "day_off",   label: "Day in Lieu",      multiplier: 0.0, color: "#6366F1" },
];

// Leave types
const LEAVE_TYPES = [
  { id: "annual",    label: "Annual Leave",     color: "#10B981" },
  { id: "sick",      label: "Sick Leave",       color: "#EF4444" },
  { id: "unpaid",    label: "Unpaid Leave",     color: "#94A3B8" },
  { id: "other",     label: "Other Leave",      color: "#7C3AED" },
  { id: "public",    label: "Public Holiday",   color: "#F97316" },
];

// Expense types
const EXPENSE_TYPES = [
  { id: "tools",        label: "Tools / Consumables", icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
  { id: "receipt",      label: "Other Receipt",       icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" },
];

// Full rich timesheet data — week of 3–9 Mar 2026
const TIMESHEETS = [
  {
    id: "ts-001", userId: "u1", user: "Craig Tait", weekStart: "2026-03-09",
    status: "supervisor_approved", supervisorApprovedBy: "Sean Templeton", supervisorApprovedAt: "2026-03-10",
    managerApprovedBy: null, managerApprovedAt: null,
    submittedAt: "2026-03-09 18:30",
    days: [
      { date: "2026-03-09", dayType: "work", overnight: false, entries: [
          { jobId: "100018", hours: 10, rateType: "ordinary",  notes: "Drilling to 45m, casing run", crewWith: ["Tony Walsh"] },
        ]},
      { date: "2026-03-08", dayType: "work", overnight: false, entries: [
          { jobId: "100018", hours: 9, rateType: "ordinary",  notes: "Drilling 30–42m depth", crewWith: ["Tony Walsh"] },
        ]},
      { date: "2026-03-07", dayType: "work", overnight: true, entries: [
          { jobId: "100018", hours: 10, rateType: "ordinary",  notes: "Overnight — remote site", crewWith: ["Tony Walsh"] },
        ]},
      { date: "2026-03-06", dayType: "work", overnight: true, entries: [
          { jobId: "100018", hours: 10, rateType: "ordinary",  notes: "Mobilised to Leeston", crewWith: ["Tony Walsh"] },
        ]},
      { date: "2026-03-05", dayType: "work", overnight: false, entries: [
          { jobId: "100018", hours: 8, rateType: "ordinary",  notes: "Rig prep and load-out", crewWith: ["Tony Walsh"] },
        ]},
      { date: "2026-03-04", dayType: "leave", leaveType: "annual", notes: "Pre-approved", entries: [] },
      { date: "2026-03-03", dayType: "off",   entries: [] },
    ],
    expenses: [
      { id: "exp-1", type: "tools", description: "Tri-cone bit replacement", amount: 145.00, receipt: true },
    ],
    totalHours: 47, totalOvernights: 2,
  },
  {
    id: "ts-002", userId: "u2", user: "Dave Rudd", weekStart: "2026-03-09",
    status: "submitted", supervisorApprovedBy: null, supervisorApprovedAt: null,
    managerApprovedBy: null, managerApprovedAt: null,
    submittedAt: "2026-03-09 17:45",
    days: [
      { date: "2026-03-09", dayType: "work", overnight: false, entries: [
          { jobId: "100021", hours: 8, rateType: "ordinary",  notes: "Site setup Rakaia Gorge", crewWith: ["Tony Walsh"] },
        ]},
      { date: "2026-03-08", dayType: "work", overnight: false, entries: [
          { jobId: "100021", hours: 8, rateType: "ordinary",  notes: "Equipment check and prep", crewWith: [] },
        ]},
      { date: "2026-03-07", dayType: "work", overnight: false, entries: [
          { jobId: "100021", hours: 8, rateType: "ordinary",  notes: "", crewWith: [] },
        ]},
      { date: "2026-03-06", dayType: "work", overnight: false, entries: [
          { jobId: "100021", hours: 8, rateType: "ordinary",  notes: "", crewWith: [] },
        ]},
      { date: "2026-03-05", dayType: "work", overnight: false, entries: [
          { jobId: "100021", hours: 8, rateType: "time_half",  notes: "Call-out — urgent rig issue", crewWith: [] },
        ]},
      { date: "2026-03-04", dayType: "off",   entries: [] },
      { date: "2026-03-03", dayType: "off",   entries: [] },
    ],
    expenses: [],
    totalHours: 40, totalOvernights: 0,
  },
  {
    id: "ts-003", userId: "u3", user: "Pete Hāpai", weekStart: "2026-03-09",
    status: "manager_approved", supervisorApprovedBy: "Kevin Lam", supervisorApprovedAt: "2026-03-10",
    managerApprovedBy: "Kevin Lam", managerApprovedAt: "2026-03-11",
    submittedAt: "2026-03-09 16:00",
    days: [
      { date: "2026-03-09", dayType: "work", overnight: false, entries: [
          { jobId: "200029", hours: 9, rateType: "ordinary",  notes: "CPT testing SH73 Site C", crewWith: ["James Tūhoe"] },
        ]},
      { date: "2026-03-08", dayType: "work", overnight: false, entries: [
          { jobId: "200029", hours: 9, rateType: "ordinary",  notes: "", crewWith: ["James Tūhoe"] },
        ]},
      { date: "2026-03-07", dayType: "work", overnight: true, entries: [
          { jobId: "200029", hours: 9, rateType: "ordinary",  notes: "Overnight Auckland", crewWith: ["James Tūhoe"] },
        ]},
      { date: "2026-03-06", dayType: "work", overnight: true, entries: [
          { jobId: "200029", hours: 9, rateType: "ordinary",  notes: "Overnight Auckland", crewWith: ["James Tūhoe"] },
        ]},
      { date: "2026-03-05", dayType: "work", overnight: false, entries: [
          { jobId: "200029", hours: 6, rateType: "ordinary",  notes: "Travel day back to Chch", crewWith: [] },
        ]},
      { date: "2026-03-04", dayType: "off",   entries: [] },
      { date: "2026-03-03", dayType: "off",   entries: [] },
    ],
    expenses: [
      { id: "exp-2", type: "receipt", description: "Accommodation — Auckland 2 nights", amount: 310.00, receipt: true },
    ],
    totalHours: 42, totalOvernights: 2,
  },
  {
    id: "ts-004", userId: "u4", user: "Mike Brown", weekStart: "2026-03-09",
    status: "draft", supervisorApprovedBy: null, supervisorApprovedAt: null,
    managerApprovedBy: null, managerApprovedAt: null,
    submittedAt: null,
    days: [
      { date: "2026-03-09", dayType: "work", overnight: false, entries: [
          { jobId: "200042", hours: 8, rateType: "ordinary",  notes: "Logging cores BH3 & BH4", crewWith: ["Sam Ohu"] },
        ]},
      { date: "2026-03-08", dayType: "work", overnight: false, entries: [
          { jobId: "200042", hours: 8, rateType: "ordinary",  notes: "", crewWith: ["Sam Ohu"] },
        ]},
      { date: "2026-03-07", dayType: "work", overnight: false, entries: [
          { jobId: "200042", hours: 6, rateType: "ordinary",  notes: "Left early — unwell", crewWith: ["Sam Ohu"] },
          { jobId: "200042", hours: 2, rateType: "ordinary",  notes: "Report write-up from home", crewWith: [] },
        ]},
      { date: "2026-03-06", dayType: "leave", leaveType: "sick", notes: "Sick — GP cert attached", entries: [] },
      { date: "2026-03-05", dayType: "work", overnight: false, entries: [
          { jobId: "200042", hours: 4, rateType: "ordinary",  notes: "Half day — back from sick", crewWith: ["Sam Ohu"] },
        ]},
      { date: "2026-03-04", dayType: "off",   entries: [] },
      { date: "2026-03-03", dayType: "off",   entries: [] },
    ],
    expenses: [
      { id: "exp-3", type: "tools", description: "Core sample bags x200", amount: 68.50, receipt: true },
    ],
    totalHours: 28, totalOvernights: 0,
  },
];

const entryHours = (e) => {
  if (e.startTime && e.endTime) {
    const [sh, sm] = e.startTime.split(":").map(Number);
    const [eh, em] = e.endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? Math.round(diff / 60 * 10) / 10 : 0;
  }
  return e.hours || 0;
};
const calcTsHours = (ts) => ts.days.reduce((s, d) => s + d.entries.reduce((ds, e) => ds + entryHours(e), 0), 0);
const calcTsOvernights = (ts) => ts.days.filter(d => d.overnight).length;

const INVOICES = [
  { id: "INV-2026-0031", job: "100018", client: "Irrigation NZ Ltd", amount: 21250, status: "sent", dueDate: "2026-03-25", issueDate: "2026-02-24" },
  { id: "INV-2026-0028", job: "200029", client: "NZTA", amount: 44000, status: "overdue", dueDate: "2026-03-01", issueDate: "2026-01-31" },
  { id: "INV-2026-0025", job: "100009", client: "North Canterbury Vineyards", amount: 9500, status: "paid", dueDate: "2026-02-28", issueDate: "2026-01-29" },
  { id: "INV-2026-0022", job: "100015", client: "Selwyn District Council", amount: 57500, status: "paid", dueDate: "2026-02-15", issueDate: "2026-01-16" },
];

// ── Icons (inline SVG components) ──────────────────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={d} />
  </svg>
);

const icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  jobs: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  estimates: "M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3 M9 15h3l9-9-3-3-9 9v3",
  time: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2",
  clients: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  finance: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  reports: "M18 20V10 M12 20V4 M6 20v-6",
  settings: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v4l3 3",
  plus: "M12 5v14 M5 12h14",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  chevronRight: "M9 18l6-6-6-6",
  chevronDown: "M6 9l6 6 6-6",
  mapPin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  calendar: "M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  externalLink: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18 M6 6l12 12",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
  arrowUp: "M12 19V5 M5 12l7-7 7 7",
  arrowDown: "M12 5v14 M19 12l-7 7-7-7",
  folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
};

const fmt = (n) => n != null ? `$${n.toLocaleString("en-NZ")}` : "—";
const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;

// ── Pill / Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: "#64748B", bg: "#F1F5F9" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: cfg.color, background: cfg.bg, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const DivisionBadge = ({ div }) => (
  <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: div === "Water" ? COLORS.blue : COLORS.teal, background: div === "Water" ? COLORS.blueLight : COLORS.tealLight }}>
    {div}
  </span>
);

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, accent, icon, trend }) => (
  <div style={{ background: COLORS.white, borderRadius: 12, padding: "20px 24px", border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: accent + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon d={icon} size={16} color={accent} />
      </div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: trend === "up" ? COLORS.green : trend === "down" ? COLORS.red : COLORS.textMuted }}>{sub}</div>}
  </div>
);

// ── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max, color = COLORS.teal }) => {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ height: 6, borderRadius: 4, background: COLORS.border, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.4s ease" }} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════════════════

// ── Dashboard Screen ─────────────────────────────────────────────────────────
const DashboardScreen = ({ onNavigate, regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  const gf = j => (regionFilter === "all" || j.region === regionFilter) && divisionFilter[j.division];
  const filteredJOBS = JOBS.filter(gf);
  const active = filteredJOBS.filter(j => j.status === "active");
  const totalRevenue = filteredJOBS.reduce((s, j) => s + (j.contractValue || 0), 0);
  const totalInvoiced = filteredJOBS.reduce((s, j) => s + (j.invoiced || 0), 0);
  const overdueInvoices = INVOICES.filter(i => i.status === "overdue");
  const pendingTS = TIMESHEETS.filter(t => t.status === "submitted").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Good morning, Sean</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Wednesday, 11 March 2026 — here's what's happening today</p>
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
              <span style={{ fontSize: 13, color: "#991B1B" }}>Overdue invoice {inv.id} — {inv.client} · {fmt(inv.amount)} was due {inv.dueDate}</span>
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
            <button onClick={() => onNavigate("jobs")} style={{ fontSize: 12, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
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
                    <span style={{ color: COLORS.border }}>·</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>{job.client}</span>
                    <span style={{ color: COLORS.border }}>·</span>
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
            {TIMESHEETS.filter(t => t.status === "submitted").map(ts => (
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

// ── Jobs List Screen ──────────────────────────────────────────────────────────
const JobsScreen = ({ onNavigate, regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  const [filter, setFilter] = useState("all");
  const [divFilter, setDivFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = JOBS.filter(j => {
    if (regionFilter !== "all" && j.region !== regionFilter) return false;
    if (!divisionFilter[j.division]) return false;
    if (filter !== "all" && j.status !== filter) return false;
    if (divFilter !== "all" && j.division !== divFilter) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.id.toLowerCase().includes(search.toLowerCase()) && !j.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Jobs</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>{filtered.length} of {JOBS.length} jobs</p>
        </div>
        <button onClick={() => onNavigate("newjob")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Icon d={icons.plus} size={14} color={COLORS.navy} /> New Job
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "0 0 240px" }}>
          <Icon d={icons.search} size={14} color={COLORS.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, clients..." style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.white, color: COLORS.textPrimary, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
          {["all","active","approved","quoted","on_hold","complete"].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: filter === s ? COLORS.white : "transparent", color: filter === s ? COLORS.textPrimary : COLORS.textMuted, boxShadow: filter === s ? "0 1px 3px rgba(0,0,0,0.1)" : "none", textTransform: "capitalize" }}>
              {s === "all" ? "All" : statusConfig[s]?.label || s}
            </button>
          ))}
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
              {["Job Number","Title & Client","Division","Location","Status","Contract Value","Progress"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((job, i) => (
              <tr key={job.id} onClick={() => onNavigate("jobdetail", job)} style={{ cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLORS.navy, background: COLORS.bg, padding: "3px 8px", borderRadius: 5, border: `1px solid ${COLORS.border}` }}>{job.id}</span>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, maxWidth: 260 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{job.client}</div>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}><DivisionBadge div={job.division} /></td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{job.region}</span>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}><StatusBadge status={job.status} /></td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{fmt(job.contractValue)}</span>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, minWidth: 120 }}>
                  {job.contractValue ? (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: COLORS.textMuted }}>Invoiced</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.textSecondary }}>{pct(job.invoiced, job.contractValue)}%</span>
                      </div>
                      <ProgressBar value={job.invoiced} max={job.contractValue} color={job.division === "Water" ? COLORS.blue : COLORS.teal} />
                    </div>
                  ) : <span style={{ fontSize: 12, color: COLORS.textMuted }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Job Detail Screen ─────────────────────────────────────────────────────────
const JobDetailScreen = ({ job, onBack }) => {
  const [tab, setTab] = useState("overview");
  const notes = [
    { author: "Craig Tait", date: "10 Mar 2026 14:32", type: "general", text: "Completed 3rd drill run today. Down to 42m, groundwater encountered at 38m. Good flow rate. Weather clear." },
    { author: "Sean Templeton", date: "8 Mar 2026 09:15", type: "milestone", text: "Casing order confirmed with supplier — delivery expected 12 March." },
    { author: "Craig Tait", date: "5 Mar 2026 17:01", type: "general", text: "Slight delay — drill bit replaced after hitting cobble layer at 18m. Now using tri-cone for this formation." },
  ];
  const noteTypeColors = { general: COLORS.textMuted, milestone: COLORS.teal, issue: COLORS.red, safety: COLORS.amber };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>Jobs</button>
        <Icon d={icons.chevronRight} size={13} color={COLORS.textMuted} />
        <span style={{ fontSize: 13, color: COLORS.textSecondary, fontFamily: "monospace" }}>{job.id}</span>
      </div>

      {/* Job Header */}
      <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: COLORS.navy, background: COLORS.bg, padding: "3px 10px", borderRadius: 6, border: `1px solid ${COLORS.border}` }}>{job.id}</span>
              <DivisionBadge div={job.division} />
              <StatusBadge status={job.status} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: "0 0 6px", letterSpacing: "-0.01em" }}>{job.title}</h1>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon d={icons.clients} size={13} color={COLORS.textMuted} />
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{job.client}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon d={icons.mapPin} size={13} color={COLORS.textMuted} />
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{job.site}</span>
              </div>
              {job.startDate && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon d={icons.calendar} size={13} color={COLORS.textMuted} />
                  <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{job.startDate} → {job.endDate || "TBC"}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button style={{ padding: "8px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon d={icons.folder} size={13} color={COLORS.textMuted} /> SharePoint
            </button>
            <button style={{ padding: "8px 14px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>Edit Job</button>
          </div>
        </div>

        {/* Finance strip */}
        {job.contractValue && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}`, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Contract Value", value: fmt(job.contractValue), color: COLORS.textPrimary },
              { label: "Invoiced", value: fmt(job.invoiced), color: job.division === "Water" ? COLORS.blue : COLORS.teal },
              { label: "Outstanding", value: fmt(job.contractValue - job.invoiced), color: job.division === "Water" ? COLORS.teal : COLORS.blue },
              { label: "Hours Logged", value: `${job.hoursLogged}h`, color: COLORS.textPrimary },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.color, letterSpacing: "-0.02em", marginTop: 2 }}>{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, background: COLORS.bg, padding: 4, borderRadius: 10, border: `1px solid ${COLORS.border}`, width: "fit-content" }}>
        {["overview","notes","timesheets","documents"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === t ? COLORS.white : "transparent", color: tab === t ? COLORS.textPrimary : COLORS.textMuted, boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>Job Details</h3>
            {[
              ["Job Type", job.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())],
              ["Division", job.division],
              ["Region", job.region],
              ["Project Manager", job.manager || "—"],
              ["Site Supervisor", job.supervisor || "Not assigned"],
              ["Client PO Ref", "SDC-PO-2026-114"],
              ["SharePoint Folder", job.id + " — " + job.title],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 600, textAlign: "right", maxWidth: 200 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>Assigned Staff</h3>
              {[{ name: job.manager, role: "Project Manager" }, { name: job.supervisor, role: "Site Supervisor" }].filter(s => s.name).map(s => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: COLORS.navyLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.amber }}>{s.name.split(" ").map(n=>n[0]).join("")}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.role}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>Equipment</h3>
              {[{ name: "Rig 3 — Schramm T64", type: "Drill Rig" }, { name: "Support Truck — 4WD", type: "Support" }].map(eq => (
                <div key={eq.name} style={{ padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{eq.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{eq.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Job Notes</span>
            <button style={{ padding: "6px 14px", background: COLORS.amber, border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>+ Add Note</button>
          </div>
          {notes.map((note, i) => (
            <div key={i} style={{ padding: "16px 20px", borderBottom: i < notes.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.navyLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.amber }}>{note.author.split(" ").map(n=>n[0]).join("")}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{note.author}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: noteTypeColors[note.type] + "20", color: noteTypeColors[note.type], fontWeight: 600, textTransform: "capitalize" }}>{note.type}</span>
                </div>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{note.date}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6 }}>{note.text}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "timesheets" && (
        <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Timesheet entries charged to this job will appear here.</p>
          {TIMESHEETS.filter(t => t.jobs.includes(job.id)).map(ts => (
            <div key={ts.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{ts.user}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{ts.week}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.teal }}>{ts.hours}h</div>
                <StatusBadge status={ts.status === "submitted" ? "quoted" : ts.status === "approved" ? "active" : "enquiry"} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "documents" && (
        <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: COLORS.tealLight, borderRadius: 8, marginBottom: 16 }}>
            <Icon d={icons.folder} size={16} color={COLORS.teal} />
            <span style={{ fontSize: 13, color: COLORS.teal, fontWeight: 600 }}>SharePoint: {job.client} / {job.id}</span>
            <button style={{ marginLeft: "auto", fontSize: 12, color: COLORS.teal, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              Open <Icon d={icons.externalLink} size={12} color={COLORS.teal} />
            </button>
          </div>
          {["Site Investigation Report v2.pdf", "Bore Completion Certificate.docx", "Health & Safety Plan.pdf", "Client Correspondence.eml"].map(doc => (
            <div key={doc} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <Icon d={icons.folder} size={14} color={COLORS.textMuted} />
              <span style={{ fontSize: 13, color: COLORS.textPrimary }}>{doc}</span>
              <button style={{ marginLeft: "auto", fontSize: 11, color: COLORS.blue, background: "none", border: "none", cursor: "pointer" }}>View</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Timesheets Screen ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// TIMESHEETS MODULE — Full rebuild
// Dual-mode: Desktop manager view + Mobile field entry view
// ══════════════════════════════════════════════════════════════════════════════

const TS_STATUS_CFG = {
  draft:              { label: "Draft",               color: "#94A3B8", bg: "#F1F5F9",  step: 0 },
  submitted:          { label: "Submitted",           color: "#3B82F6", bg: "#DBEAFE",  step: 1 },
  supervisor_approved:{ label: "Sup. Approved",       color: "#F59E0B", bg: "#FEF3C7",  step: 2 },
  manager_approved:   { label: "Approved",            color: "#10B981", bg: "#D1FAE5",  step: 3 },
  rejected:           { label: "Rejected",            color: "#EF4444", bg: "#FEE2E2",  step: 0 },
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_DAYS_FROM_MONDAY = (weekStart) => {
  const monday = new Date(weekStart);
  // weekStart is the Sunday — adjust to Monday
  const d = new Date(monday);
  d.setDate(d.getDate() - 6); // weekStart="2026-03-09" is Mon (Mon 9 Mar)
  // Actually our weekStart IS Monday based on data — just generate 7 days
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() - (6 - i)); // Mon=0 ... Sun=6
    return day.toISOString().slice(0, 10);
  });
};

const fmtDay = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
};

const fmtDayShort = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric" });
};

// ── Approval status pipeline indicator ───────────────────────────────────────
const ApprovalPipeline = ({ status }) => {
  const steps = [
    { label: "Draft",        done: ["submitted","supervisor_approved","manager_approved"].includes(status) },
    { label: "Submitted",    done: ["supervisor_approved","manager_approved"].includes(status),
                             active: status === "submitted" },
    { label: "Sup. Review",  done: ["manager_approved"].includes(status),
                             active: status === "supervisor_approved" },
    { label: "Approved",     done: status === "manager_approved" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: s.done ? COLORS.green : s.active ? COLORS.amber : COLORS.border,
              border: `2px solid ${s.done ? COLORS.green : s.active ? COLORS.amber : COLORS.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {s.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
              {s.active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.navy }} />}
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: s.done ? COLORS.green : s.active ? COLORS.amber : COLORS.textMuted, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ height: 2, width: 24, background: s.done ? COLORS.green : COLORS.border, marginBottom: 14, flexShrink: 0 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Day type badge ────────────────────────────────────────────────────────────
const DayTypeBadge = ({ day }) => {
  if (day.dayType === "off") return <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600 }}>OFF</span>;
  if (day.dayType === "leave") {
    const lt = LEAVE_TYPES.find(l => l.id === day.leaveType) || LEAVE_TYPES[0];
    return <span style={{ fontSize: 10, fontWeight: 700, color: lt.color, background: lt.color + "20", padding: "1px 7px", borderRadius: 8 }}>{lt.label}</span>;
  }
  const hrs = day.entries.reduce((s, e) => s + e.hours, 0);
  const hasOT = day.entries.some(e => e.rateType !== "ordinary");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: COLORS.textPrimary }}>{hrs}h</span>
      {day.overnight && <span style={{ fontSize: 9, fontWeight: 700, color: "#7C3AED", background: "#EDE9FE", padding: "1px 5px", borderRadius: 5 }}>AWAY</span>}
      {hasOT && <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.orange, background: COLORS.orangeLight, padding: "1px 5px", borderRadius: 5 }}>OT</span>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MANAGER VIEW — desktop approval queue
// ══════════════════════════════════════════════════════════════════════════════
const ManagerTimesheetsView = ({ onViewTimesheet, tsVisible = () => true }) => {
  const [filter, setFilter] = useState("pending");
  const [weekFilter, setWeekFilter] = useState("2026-03-09");

  const filtered = TIMESHEETS.filter(ts => tsVisible(ts)).filter(ts => {
    if (filter === "pending") return ["submitted", "supervisor_approved"].includes(ts.status);
    if (filter === "approved") return ts.status === "manager_approved";
    if (filter === "draft") return ts.status === "draft";
    return true;
  });

  const totalHours = filtered.reduce((s, ts) => s + calcTsHours(ts), 0);
  const pendingCount = TIMESHEETS.filter(ts => tsVisible(ts) && ["submitted","supervisor_approved"].includes(ts.status)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Awaiting Approval", value: TIMESHEETS.filter(t => tsVisible(t) && t.status === "submitted").length, color: COLORS.blue, sub: "Need supervisor sign-off" },
          { label: "Sup. Approved", value: TIMESHEETS.filter(t => tsVisible(t) && t.status === "supervisor_approved").length, color: COLORS.amber, sub: "Need manager sign-off" },
          { label: "Fully Approved", value: TIMESHEETS.filter(t => tsVisible(t) && t.status === "manager_approved").length, color: COLORS.green, sub: "This week" },
          { label: "Total Hours", value: TIMESHEETS.filter(t => tsVisible(t)).reduce((s,t) => s + calcTsHours(t), 0) + "h", color: COLORS.teal, sub: "Across all staff" },
        ].map(k => (
          <div key={k.label} style={{ background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, marginTop: 6, letterSpacing: "-0.02em" }}>{k.value}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
          {[
            { id: "pending",  label: `Needs Action (${pendingCount})` },
            { id: "approved", label: "Approved" },
            { id: "draft",    label: "Draft" },
            { id: "all",      label: "All" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: filter === f.id ? COLORS.white : "transparent",
                color: filter === f.id ? COLORS.textPrimary : COLORS.textMuted,
                boxShadow: filter === f.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timesheet cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(ts => {
          const cfg = TS_STATUS_CFG[ts.status] || TS_STATUS_CFG.draft;
          const hours = calcTsHours(ts);
          const overnights = calcTsOvernights(ts);
          const expenseTotal = ts.expenses.reduce((s, e) => s + e.amount, 0);
          const staff = STAFF.find(s => s.id === ts.userId);
          const weekDays = WEEK_DAYS_FROM_MONDAY(ts.weekStart);
          return (
            <div key={ts.id} style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {/* Card header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, background: ts.status === "submitted" ? "#FAFBFE" : ts.status === "supervisor_approved" ? "#FFFBEB" : COLORS.bg }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.navyLight, border: `2px solid ${COLORS.amber}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: COLORS.amber }}>{ts.user.split(" ").map(n=>n[0]).join("")}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{ts.user}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{staff?.role} · {staff?.region}</div>
                  </div>
                  <div style={{ marginLeft: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <ApprovalPipeline status={ts.status} />
                  <button onClick={() => onViewTimesheet(ts)}
                    style={{ padding: "7px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer", whiteSpace: "nowrap" }}>
                    View Full →
                  </button>
                </div>
              </div>

              {/* Day summary strip */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${COLORS.border}` }}>
                {weekDays.map((date, di) => {
                  const day = ts.days.find(d => d.date === date) || { dayType: "off", entries: [] };
                  const dayHrs = day.entries.reduce((s, e) => s + e.hours, 0);
                  return (
                    <div key={date} style={{ padding: "8px 6px", textAlign: "center", borderRight: di < 6 ? `1px solid ${COLORS.border}` : "none",
                      background: day.dayType === "leave" ? "#FFF8F1" : day.dayType === "off" ? COLORS.bg : COLORS.white }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, marginBottom: 3 }}>{DAY_LABELS[di]}</div>
                      <DayTypeBadge day={day} />
                    </div>
                  );
                })}
              </div>

              {/* Footer: totals + actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px" }}>
                <div style={{ display: "flex", gap: 20 }}>
                  <div><span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Hours </span><span style={{ fontSize: 14, fontWeight: 800, color: COLORS.teal }}>{hours}h</span></div>
                  {overnights > 0 && <div><span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Overnights </span><span style={{ fontSize: 14, fontWeight: 800, color: "#7C3AED" }}>{overnights}</span></div>}
                  {expenseTotal > 0 && <div><span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Expenses </span><span style={{ fontSize: 14, fontWeight: 800, color: COLORS.blue }}>${expenseTotal.toFixed(2)}</span></div>}
                  {ts.submittedAt && <div style={{ fontSize: 11, color: COLORS.textMuted }}>Submitted {ts.submittedAt}</div>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {ts.status === "submitted" && (
                    <>
                      <button style={{ padding: "7px 16px", background: COLORS.greenLight, border: `1px solid ${COLORS.green}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.green, cursor: "pointer" }}>
                        ✓ Approve (Supervisor)
                      </button>
                      <button style={{ padding: "7px 12px", background: COLORS.redLight, border: `1px solid ${COLORS.red}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.red, cursor: "pointer" }}>
                        Return
                      </button>
                    </>
                  )}
                  {ts.status === "supervisor_approved" && (
                    <>
                      <button style={{ padding: "7px 16px", background: COLORS.green, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.white, cursor: "pointer" }}>
                        ✓ Final Approve
                      </button>
                      <button style={{ padding: "7px 12px", background: COLORS.redLight, border: `1px solid ${COLORS.red}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.red, cursor: "pointer" }}>
                        Return
                      </button>
                    </>
                  )}
                  {ts.status === "manager_approved" && (
                    <span style={{ fontSize: 12, color: COLORS.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                      Approved by {ts.managerApprovedBy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: COLORS.textMuted }}>No timesheets in this category</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TIMESHEET DETAIL — full view of one week (used by both views)
// ══════════════════════════════════════════════════════════════════════════════
const TimesheetDetail = ({ ts, onBack, isMobile }) => {
  const [activeDay, setActiveDay] = useState(null);
  const weekDays = WEEK_DAYS_FROM_MONDAY(ts.weekStart);
  const cfg = TS_STATUS_CFG[ts.status] || TS_STATUS_CFG.draft;
  const totalHours = calcTsHours(ts);
  const overnights = calcTsOvernights(ts);
  const expenseTotal = ts.expenses.reduce((s, e) => s + e.amount, 0);

  // On mobile, open first non-off day by default
  useEffect(() => {
    if (isMobile && activeDay === null) {
      const firstWork = ts.days.find(d => d.dayType !== "off");
      if (firstWork) setActiveDay(firstWork.date);
    }
  }, [isMobile]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 16 }}>
      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: COLORS.blue, fontWeight: 600, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue} strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          {isMobile ? "Back" : "Timesheets"}
        </button>
        <span style={{ color: COLORS.textMuted }}>·</span>
        <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{ts.user} — week of {fmtDay(ts.weekStart)}</span>
      </div>

      {/* Status card */}
      <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: isMobile ? "14px 16px" : "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.navyLight, border: `2px solid ${COLORS.amber}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.amber }}>{ts.user.split(" ").map(n=>n[0]).join("")}</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>{ts.user}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Week of {fmtDay(weekDays[0])} – {fmtDay(weekDays[6])}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-end", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: cfg.color, background: cfg.bg }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />
              {cfg.label}
            </span>
            <ApprovalPipeline status={ts.status} />
          </div>
        </div>

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
          {[
            { label: "Total Hours", value: totalHours + "h", color: COLORS.teal },
            { label: "Ordinary", value: ts.days.reduce((s,d) => s + d.entries.filter(e=>e.rateType==="ordinary").reduce((ds,e)=>ds+e.hours,0),0) + "h", color: COLORS.blue },
            { label: "Overtime", value: ts.days.reduce((s,d) => s + d.entries.filter(e=>e.rateType!=="ordinary").reduce((ds,e)=>ds+e.hours,0),0) + "h", color: COLORS.orange },
            { label: "Overnights", value: overnights, color: "#7C3AED" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "8px 0", background: COLORS.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginTop: 4, letterSpacing: "-0.02em" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Day-by-day */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {weekDays.map((date, di) => {
          const day = ts.days.find(d => d.date === date) || { date, dayType: "off", entries: [] };
          const isOpen = !isMobile || activeDay === date;
          const dayHrs = day.entries.reduce((s, e) => s + e.hours, 0);
          const dayJobs = [...new Set(day.entries.map(e => e.jobId))];
          const lt = day.dayType === "leave" ? LEAVE_TYPES.find(l => l.id === day.leaveType) : null;
          const isToday = date === "2026-03-11";

          return (
            <div key={date} style={{ background: COLORS.white, borderRadius: 10, border: `2px solid ${isToday ? COLORS.amber : COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              {/* Day header — always visible */}
              <div onClick={() => isMobile && setActiveDay(activeDay === date ? null : date)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px",
                  background: day.dayType === "off" ? COLORS.bg : day.dayType === "leave" ? "#FFF8F1" : COLORS.white,
                  cursor: isMobile ? "pointer" : "default" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ textAlign: "center", minWidth: 44 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>{DAY_LABELS[di]}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? COLORS.amber : COLORS.textPrimary }}>{new Date(date).getDate()}</div>
                  </div>
                  {day.dayType === "work" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {dayJobs.map(jid => {
                          const job = JOBS.find(j => j.id === jid);
                          return job ? <span key={jid} style={{ fontSize: 11, fontWeight: 600, color: job.division === "Water" ? COLORS.blue : COLORS.teal }}>{jid} — {job.client}</span> : null;
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{dayHrs}h</span>
                        {day.overnight && <span style={{ fontSize: 9, fontWeight: 700, color: "#7C3AED", background: "#EDE9FE", padding: "2px 7px", borderRadius: 6 }}>OVERNIGHT AWAY</span>}
                        {day.entries.some(e => e.rateType !== "ordinary") && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.orange, background: COLORS.orangeLight, padding: "2px 7px", borderRadius: 6 }}>OVERTIME</span>
                        )}
                      </div>
                    </div>
                  )}
                  {day.dayType === "leave" && lt && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: lt.color }}>{lt.label}{day.notes ? ` — ${day.notes}` : ""}</span>
                  )}
                  {day.dayType === "off" && <span style={{ fontSize: 12, color: COLORS.textMuted }}>Day off</span>}
                </div>
                {isMobile && day.dayType === "work" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                )}
              </div>

              {/* Entry details — shown when open */}
              {isOpen && day.dayType === "work" && day.entries.map((entry, ei) => {
                const job = JOBS.find(j => j.id === entry.jobId);
                const rt = RATE_TYPES.find(r => r.id === entry.rateType) || RATE_TYPES[0];
                        const eHours = entryHours(entry);
                return (
                  <div key={ei} style={{ padding: "10px 14px 10px 58px", borderTop: `1px solid ${COLORS.border}`, background: ei % 2 === 0 ? COLORS.white : "#FAFBFC" }}>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto auto auto", gap: isMobile ? 6 : 16, alignItems: "start" }}>
                      <div>
                        {job && <div style={{ fontSize: 12, fontWeight: 700, color: job.division === "Water" ? COLORS.blue : COLORS.teal }}>{job.id} — {job.title.split("—")[0].trim()}</div>}
                        {entry.notes && <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{entry.notes}</div>}
                        {entry.crewWith?.length > 0 && (
                          <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 4 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <span style={{ fontSize: 11, color: COLORS.textMuted }}>With: {entry.crewWith.join(", ")}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: isMobile ? "left" : "right" }}>
                        {entry.startTime ? (
                          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{entry.startTime} – {entry.endTime} <span style={{ fontWeight: 800, color: COLORS.textPrimary, marginLeft: 4 }}>{eHours}h</span></div>
                        ) : (
                          <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{eHours}h</span>
                        )}
                      </div>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: rt.color, background: rt.color + "20", padding: "2px 8px", borderRadius: 6 }}>{rt.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Expenses */}
      {ts.expenses.length > 0 && (
        <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "12px 16px", background: COLORS.navyLight, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.white }}>Expenses</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.amber }}>${expenseTotal.toFixed(2)}</span>
          </div>
          {ts.expenses.map((exp, i) => {
            const et = EXPENSE_TYPES.find(e => e.id === exp.type) || EXPENSE_TYPES[1];
            return (
              <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: i < ts.expenses.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.bg, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2"><path d={et.icon}/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{exp.description}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                      {et.label}
                      {exp.receipt && <span style={{ color: COLORS.green, fontWeight: 600 }}>· Receipt attached</span>}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>${exp.amount.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE ENTRY VIEW — field staff time entry UI
// ══════════════════════════════════════════════════════════════════════════════
const MobileTimesheetEntry = ({ onBack }) => {
  const TODAY = "2026-03-11";
  const WEEK_START = "2026-03-09"; // Mon
  const weekDays = WEEK_DAYS_FROM_MONDAY(WEEK_START);

  // Load mike brown's draft as starting point
  const existingTs = TIMESHEETS.find(t => t.userId === "u4");
  const [activeDay, setActiveDay] = useState(TODAY);
  const [days, setDays] = useState(() => {
    const map = {};
    weekDays.forEach(date => {
      const existing = existingTs?.days.find(d => d.date === date);
      map[date] = existing ? { ...existing, entries: existing.entries.map(e => ({ ...e, id: Math.random().toString(36).slice(2) })) }
                           : { date, dayType: "work", overnight: false, entries: [], leaveType: null, notes: "" };
    });
    return map;
  });
  const [expenses, setExpenses] = useState(existingTs?.expenses || []);
  const [tab, setTab] = useState("time"); // "time" | "expenses" | "leave"
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ type: "tools", description: "", amount: "" });
  const [leaveForm, setLeaveForm] = useState({ leaveType: "annual", notes: "" });

  const day = days[activeDay] || { dayType: "work", overnight: false, entries: [] };
  const totalHours = Object.values(days).reduce((s, d) => s + d.entries.reduce((ds, e) => ds + e.hours, 0), 0);

  const updateDay = (date, updates) => setDays(prev => ({ ...prev, [date]: { ...prev[date], ...updates } }));

  // Compute decimal hours from start/end time strings "HH:MM"
  const hoursFromTimes = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? Math.round(diff / 60 * 10) / 10 : 0;
  };

  const addEntry = () => {
    const newEntry = { id: Math.random().toString(36).slice(2), jobId: "200042", startTime: "07:00", endTime: "17:00", notes: "", crewWith: [] };
    updateDay(activeDay, { entries: [...(day.entries || []), newEntry] });
  };

  const updateEntry = (entryId, field, val) => {
    updateDay(activeDay, { entries: day.entries.map(e => e.id === entryId ? { ...e, [field]: val } : e) });
  };

  const removeEntry = (entryId) => {
    updateDay(activeDay, { entries: day.entries.filter(e => e.id !== entryId) });
  };

  const addExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) return;
    setExpenses(prev => [...prev, { id: Math.random().toString(36).slice(2), ...expenseForm, amount: parseFloat(expenseForm.amount), receipt: false }]);
    setExpenseForm({ type: "tools", description: "", amount: "" });
    setShowExpenseModal(false);
  };

  const applyLeave = () => {
    updateDay(activeDay, { dayType: "leave", leaveType: leaveForm.leaveType, notes: leaveForm.notes, entries: [] });
    setShowLeaveModal(false);
  };

  const inputSt = { width: "100%", padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 15, outline: "none", background: COLORS.white, boxSizing: "border-box", color: COLORS.textPrimary };
  const selectSt = { ...inputSt, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 };

  const ACTIVE_JOBS = JOBS.filter(j => ["active","approved"].includes(j.status));

  return (
    <div style={{ background: "#F0F4F8", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Mobile top bar */}
      <div style={{ background: COLORS.navy, padding: "0 16px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 4px", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.white, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              <span style={{ color: COLORS.amber }}>Sub</span>Strata
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase" }}>My Timesheet</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.navyLight, border: `2px solid ${COLORS.amber}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.amber }}>MB</span>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 2 }}>
          {[{ id: "time", label: "Time" }, { id: "expenses", label: "Expenses" }, { id: "leave", label: "Leave" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: "10px 0", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                color: tab === t.id ? COLORS.amber : "rgba(255,255,255,0.5)",
                borderBottom: `2px solid ${tab === t.id ? COLORS.amber : "transparent"}` }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Week total bar */}
      <div style={{ background: COLORS.navyLight, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Week Total</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white, letterSpacing: "-0.02em" }}>{totalHours}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>h</span></div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {expenses.length > 0 && (
            <div style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, padding: "4px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Expenses</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#93C5FD" }}>${expenses.reduce((s,e) => s + e.amount, 0).toFixed(0)}</div>
            </div>
          )}
          <div style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "4px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.amber }}>DRAFT</div>
          </div>
        </div>
      </div>

      {tab === "time" && (
        <>
          {/* Day selector — horizontal scroll */}
          <div style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <div style={{ display: "flex", minWidth: "fit-content", padding: "8px 12px", gap: 6 }}>
              {weekDays.map((date, di) => {
                const d = days[date] || {};
                const hrs = (d.entries || []).reduce((s, e) => s + hoursFromTimes(e.startTime, e.endTime), 0);
                const isActive = activeDay === date;
                const isToday = date === TODAY;
                const isLeave = d.dayType === "leave";
                const lt = isLeave ? LEAVE_TYPES.find(l => l.id === d.leaveType) : null;
                return (
                  <button key={date} onClick={() => setActiveDay(date)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 10px", borderRadius: 12, minWidth: 52,
                      background: isActive ? COLORS.navy : COLORS.white,
                      border: `2px solid ${isActive ? COLORS.amber : isToday ? COLORS.amber + "80" : COLORS.border}`,
                      cursor: "pointer", transition: "all 0.15s" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? "rgba(255,255,255,0.6)" : COLORS.textMuted, textTransform: "uppercase", marginBottom: 2 }}>{DAY_LABELS[di]}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: isActive ? COLORS.white : isToday ? COLORS.amber : COLORS.textPrimary }}>{new Date(date).getDate()}</span>
                    {isLeave
                      ? <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? lt?.color : lt?.color, marginTop: 2 }}>LEAVE</span>
                      : hrs > 0
                        ? <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? COLORS.amber : COLORS.teal, marginTop: 2 }}>{hrs}h</span>
                        : <span style={{ fontSize: 9, color: isActive ? "rgba(255,255,255,0.3)" : COLORS.border, marginTop: 2 }}>—</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active day content */}
          <div style={{ padding: "14px 14px 100px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>{fmtDay(activeDay)}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                  {day.dayType === "work" ? `${day.entries.reduce((s,e) => s+e.hours, 0)}h logged` : day.dayType === "leave" ? "On leave" : "Day off"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {/* Overnight toggle */}
                {day.dayType === "work" && (
                  <button onClick={() => updateDay(activeDay, { overnight: !day.overnight })}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10,
                      background: day.overnight ? "#EDE9FE" : COLORS.bg,
                      border: `2px solid ${day.overnight ? "#7C3AED" : COLORS.border}`,
                      cursor: "pointer", fontSize: 12, fontWeight: 700,
                      color: day.overnight ? "#7C3AED" : COLORS.textMuted }}>
                    🌙 {day.overnight ? "Away" : "Home"}
                  </button>
                )}
                {/* Leave button */}
                {day.dayType !== "leave" && (
                  <button onClick={() => setShowLeaveModal(true)}
                    style={{ padding: "8px 12px", borderRadius: 10, background: COLORS.bg, border: `1px solid ${COLORS.border}`, cursor: "pointer", fontSize: 12, fontWeight: 600, color: COLORS.textSecondary }}>
                    Leave
                  </button>
                )}
                {day.dayType === "leave" && (
                  <button onClick={() => updateDay(activeDay, { dayType: "work", entries: [], overnight: false })}
                    style={{ padding: "8px 12px", borderRadius: 10, background: COLORS.redLight, border: `1px solid ${COLORS.red}`, cursor: "pointer", fontSize: 12, fontWeight: 600, color: COLORS.red }}>
                    Clear leave
                  </button>
                )}
              </div>
            </div>

            {day.dayType === "leave" && (() => {
              const lt = LEAVE_TYPES.find(l => l.id === day.leaveType);
              return (
                <div style={{ background: COLORS.white, borderRadius: 14, border: `2px solid ${lt?.color || COLORS.border}`, padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏖️</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: lt?.color }}>{lt?.label}</div>
                  {day.notes && <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 6 }}>{day.notes}</div>}
                </div>
              );
            })()}

            {day.dayType === "work" && (
              <>
                {day.entries.map((entry, ei) => {
                  const job = JOBS.find(j => j.id === entry.jobId);
                  const entryHours = hoursFromTimes(entry.startTime, entry.endTime);
                  return (
                    <div key={entry.id} style={{ background: COLORS.white, borderRadius: 14, border: `1px solid ${COLORS.border}`, marginBottom: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                      <div style={{ padding: "10px 14px", background: job?.division === "Water" ? "#EFF6FF" : "#F0FDFA", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: job?.division === "Water" ? COLORS.blue : COLORS.teal, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {entry.jobId ? `Entry ${ei + 1}` : "New Entry"}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {entryHours > 0 && <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.teal }}>{entryHours}h</span>}
                          <button onClick={() => removeEntry(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: COLORS.red, fontSize: 18, lineHeight: 1 }}>×</button>
                        </div>
                      </div>
                      <div style={{ padding: "14px" }}>
                        {/* Job selector */}
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Job</label>
                          <select value={entry.jobId} onChange={e => updateEntry(entry.id, "jobId", e.target.value)} style={selectSt}>
                            {ACTIVE_JOBS.map(j => <option key={j.id} value={j.id}>{j.id} — {j.title.split("—")[0].trim()}</option>)}
                          </select>
                        </div>
                        {/* Client display — auto-populated from job */}
                        {job && (
                          <div style={{ marginBottom: 12, padding: "8px 12px", background: job.division === "Water" ? "#EFF6FF" : "#F0FDFA", borderRadius: 8, display: "flex", gap: 8, alignItems: "center" }}>
                            <Icon d={icons.clients} size={13} color={job.division === "Water" ? COLORS.blue : COLORS.teal} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: job.division === "Water" ? COLORS.blue : COLORS.teal }}>{job.client}</span>
                            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: COLORS.textMuted }}>{job.region}</span>
                          </div>
                        )}
                        {/* Start / End time */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Start Time</label>
                            <input type="time" value={entry.startTime || "07:00"} onChange={e => updateEntry(entry.id, "startTime", e.target.value)}
                              style={{ ...inputSt, fontSize: 18, fontWeight: 800, textAlign: "center", letterSpacing: "0.04em" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Finish Time</label>
                            <input type="time" value={entry.endTime || "17:00"} onChange={e => updateEntry(entry.id, "endTime", e.target.value)}
                              style={{ ...inputSt, fontSize: 18, fontWeight: 800, textAlign: "center", letterSpacing: "0.04em" }} />
                          </div>
                        </div>
                        {entryHours > 0 && (
                          <div style={{ marginBottom: 12, padding: "6px 12px", background: COLORS.tealLight, borderRadius: 8, fontSize: 13, fontWeight: 700, color: COLORS.teal, textAlign: "center" }}>
                            {entryHours} hour{entryHours !== 1 ? "s" : ""} — rate type assigned by supervisor on approval
                          </div>
                        )}
                        {/* Notes */}
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Notes (optional)</label>
                          <input value={entry.notes} onChange={e => updateEntry(entry.id, "notes", e.target.value)}
                            placeholder="What were you working on?" style={{ ...inputSt, fontSize: 14 }} />
                        </div>
                        {/* Crew */}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Working with</label>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {STAFF.filter(s => s.id !== "u4").map(s => {
                              const selected = entry.crewWith?.includes(s.name);
                              return (
                                <button key={s.id} onClick={() => {
                                    const crew = entry.crewWith || [];
                                    updateEntry(entry.id, "crewWith", selected ? crew.filter(n => n !== s.name) : [...crew, s.name]);
                                  }}
                                  style={{ padding: "6px 12px", borderRadius: 20, border: `2px solid ${selected ? COLORS.amber : COLORS.border}`,
                                    background: selected ? COLORS.amberLight : COLORS.white, cursor: "pointer",
                                    fontSize: 12, fontWeight: 700, color: selected ? COLORS.navy : COLORS.textMuted }}>
                                  {s.initials} — {s.name.split(" ")[0]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add entry button */}
                <button onClick={addEntry}
                  style={{ width: "100%", padding: "16px", background: COLORS.white, border: `2px dashed ${COLORS.border}`, borderRadius: 14, cursor: "pointer", fontSize: 15, fontWeight: 700, color: COLORS.textMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  Add job entry
                </button>
              </>
            )}
          </div>
        </>
      )}

      {tab === "expenses" && (
        <div style={{ padding: "14px 14px 100px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>Expenses</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Tools, receipts & reimbursables</div>
            </div>
            <button onClick={() => setShowExpenseModal(true)}
              style={{ padding: "10px 16px", background: COLORS.amber, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, color: COLORS.navy, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.navy} strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add
            </button>
          </div>
          {expenses.length === 0 && (
            <div style={{ background: COLORS.white, borderRadius: 14, border: `2px dashed ${COLORS.border}`, padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🧾</div>
              <div style={{ fontSize: 14, color: COLORS.textMuted }}>No expenses yet</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>Tap + Add to log tools, receipts or reimbursables</div>
            </div>
          )}
          {expenses.map((exp, i) => {
            const et = EXPENSE_TYPES.find(e => e.id === exp.type) || EXPENSE_TYPES[1];
            return (
              <div key={exp.id} style={{ background: COLORS.white, borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{exp.description}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{et.label}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary }}>${exp.amount.toFixed(2)}</span>
                  <button onClick={() => setExpenses(prev => prev.filter(e => e.id !== exp.id))}
                    style={{ background: COLORS.redLight, border: "none", borderRadius: 8, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: COLORS.red }}>×</button>
                </div>
              </div>
            );
          })}
          {expenses.length > 0 && (
            <div style={{ background: COLORS.navyLight, borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.white }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.amber }}>${expenses.reduce((s,e) => s+e.amount, 0).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {tab === "leave" && (
        <div style={{ padding: "14px 14px 100px" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>Leave Requests</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>Apply for leave on any day — go to the Time tab, select a day, then tap Leave</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.values(days).filter(d => d.dayType === "leave").map(d => {
              const lt = LEAVE_TYPES.find(l => l.id === d.leaveType);
              return (
                <div key={d.date} style={{ background: COLORS.white, borderRadius: 14, border: `2px solid ${lt?.color || COLORS.border}`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: lt?.color }}>{lt?.label}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{fmtDay(d.date)}</div>
                    {d.notes && <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 3 }}>{d.notes}</div>}
                  </div>
                  <button onClick={() => updateDay(d.date, { dayType: "work", entries: [], overnight: false })}
                    style={{ background: COLORS.redLight, border: "none", borderRadius: 8, cursor: "pointer", padding: "6px 10px", fontSize: 12, fontWeight: 600, color: COLORS.red }}>
                    Remove
                  </button>
                </div>
              );
            })}
            {Object.values(days).filter(d => d.dayType === "leave").length === 0 && (
              <div style={{ background: COLORS.white, borderRadius: 14, border: `2px dashed ${COLORS.border}`, padding: "32px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>No leave applied this week.</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>Select a day in the Time tab and tap Leave.</div>
              </div>
            )}
          </div>
          {/* Leave type reference */}
          <div style={{ marginTop: 20, background: COLORS.white, borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Leave Types</div>
            {LEAVE_TYPES.map(lt => (
              <div key={lt.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: lt.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 500 }}>{lt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky bottom submit bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.white, borderTop: `1px solid ${COLORS.border}`, padding: "12px 16px", display: "flex", gap: 10, boxShadow: "0 -4px 16px rgba(0,0,0,0.1)", zIndex: 100 }}>
        <button style={{ flex: 1, padding: "14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, fontSize: 15, fontWeight: 700, color: COLORS.textPrimary, cursor: "pointer" }}>
          Save Draft
        </button>
        <button style={{ flex: 2, padding: "14px", background: COLORS.amber, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>
          Submit for Approval →
        </button>
      </div>

      {/* Leave modal */}
      {showLeaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: COLORS.white, borderRadius: "20px 20px 0 0", padding: "24px 20px", width: "100%", boxShadow: "0 -8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 4 }}>Apply Leave</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>{fmtDay(activeDay)}</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Leave Type</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {LEAVE_TYPES.map(lt => (
                  <button key={lt.id} onClick={() => setLeaveForm(f => ({ ...f, leaveType: lt.id }))}
                    style={{ padding: "12px 16px", borderRadius: 10, border: `2px solid ${leaveForm.leaveType === lt.id ? lt.color : COLORS.border}`,
                      background: leaveForm.leaveType === lt.id ? lt.color + "15" : COLORS.white, cursor: "pointer",
                      fontSize: 14, fontWeight: 700, color: leaveForm.leaveType === lt.id ? lt.color : COLORS.textPrimary, textAlign: "left",
                      display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: lt.color, flexShrink: 0 }} />
                    {lt.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Notes (optional)</label>
              <input value={leaveForm.notes} onChange={e => setLeaveForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. GP certificate attached" style={inputSt} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowLeaveModal(false)} style={{ flex: 1, padding: "14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, fontSize: 15, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Cancel</button>
              <button onClick={applyLeave} style={{ flex: 2, padding: "14px", background: COLORS.amber, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>Apply Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* Expense modal */}
      {showExpenseModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: COLORS.white, borderRadius: "20px 20px 0 0", padding: "24px 20px", width: "100%", boxShadow: "0 -8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 20 }}>Add Expense</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {EXPENSE_TYPES.map(et => (
                  <button key={et.id} onClick={() => setExpenseForm(f => ({ ...f, type: et.id }))}
                    style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: `2px solid ${expenseForm.type === et.id ? COLORS.teal : COLORS.border}`,
                      background: expenseForm.type === et.id ? COLORS.tealLight : COLORS.white, cursor: "pointer",
                      fontSize: 13, fontWeight: 700, color: expenseForm.type === et.id ? COLORS.teal : COLORS.textMuted }}>
                    {et.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Description</label>
              <input value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Drill bit replacement, 3x" style={inputSt} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Amount ($)</label>
              <input value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00" type="number" inputMode="decimal" style={{ ...inputSt, fontSize: 24, fontWeight: 800 }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowExpenseModal(false)} style={{ flex: 1, padding: "14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, fontSize: 15, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Cancel</button>
              <button onClick={addExpense} style={{ flex: 2, padding: "14px", background: COLORS.amber, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN TIMESHEETS SCREEN — toggles between manager and mobile views
// ══════════════════════════════════════════════════════════════════════════════
const TimesheetsScreen = ({ regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  // Global filter helper for timesheets — filter by staff's division/region
  const tsVisible = (ts) => {
    const staff = STAFF.find(s => s.id === ts.userId);
    if (!staff) return true;
    if (regionFilter !== "all" && staff.region !== regionFilter) return false;
    if (!divisionFilter[staff.division]) return false;
    return true;
  };
  const [view, setView] = useState("manager"); // "manager" | "mobile"
  const [selectedTs, setSelectedTs] = useState(null);

  if (view === "mobile") {
    return <MobileTimesheetEntry onBack={() => setView("manager")} />;
  }

  if (selectedTs) {
    return <TimesheetDetail ts={selectedTs} onBack={() => setSelectedTs(null)} isMobile={false} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Timesheets</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Week of 9 Mar 2026 · Two-stage approval</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {/* Mobile preview button */}
          <button onClick={() => setView("mobile")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: COLORS.navy, color: COLORS.white, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            Field Entry View
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.navy} strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            My Timesheet
          </button>
        </div>
      </div>
      <ManagerTimesheetsView onViewTimesheet={(ts) => setSelectedTs(ts)} tsVisible={tsVisible} />
    </div>
  );
};

// ── Finance Screen ────────────────────────────────────────────────────────────
const FinanceScreen = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Financials</h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Invoices, payments & job costs</p>
      </div>
      <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
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
          <div style={{ fontSize: 24, fontWeight: 800, color: k.color, marginTop: 6, letterSpacing: "-0.02em" }}>{k.value}</div>
        </div>
      ))}
    </div>
    <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>Recent Invoices</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: COLORS.bg }}>
            {["Invoice #","Job","Client","Amount","Issue Date","Due Date","Status"].map(h=>(
              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INVOICES.map((inv, i) => {
            const statusMap = { sent: "approved", overdue: "on_hold", paid: "complete", draft: "enquiry" };
            return (
              <tr key={inv.id} onMouseEnter={e => e.currentTarget.style.background=COLORS.bg} onMouseLeave={e => e.currentTarget.style.background="transparent"} style={{ cursor: "pointer" }}>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLORS.navy }}>{inv.id}</span>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "2px 6px" }}>{inv.job}</span>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.textSecondary }}>{inv.client}</td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary }}>{fmt(inv.amount)}</span>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.textSecondary }}>{inv.issueDate}</td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, color: inv.status === "overdue" ? COLORS.red : COLORS.textSecondary, fontWeight: inv.status === "overdue" ? 700 : 400 }}>{inv.dueDate}</td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <StatusBadge status={statusMap[inv.status] || "enquiry"} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const CLIENTS = [
  {
    id: "c1", code: "INZ", name: "Irrigation NZ Ltd", industry: "Agriculture", region: "Canterbury",
    phone: "03 307 8800", email: "projects@irrigationnz.co.nz", website: "irrigationnz.co.nz",
    billingAddress: "14 Wilkin Street, Ashburton 7700", paymentTerms: 30, creditLimit: 200000,
    isActive: true, since: "2019-03-01",
    contacts: [
      { id: "co1", name: "Brendon McLachlan", title: "Mr", role: "Engineering Manager", email: "b.mclachlan@irrigationnz.co.nz", phone: "03 307 8801", mobile: "021 456 789", isPrimary: true },
      { id: "co2", name: "Tracey Wills", title: "Ms", role: "Accounts Payable", email: "accounts@irrigationnz.co.nz", phone: "03 307 8802", mobile: null, isPrimary: false },
    ],
    activities: [
      { id: "a1", type: "call", subject: "Progress update — Job 100018", date: "2026-03-08", author: "Sean Templeton", notes: "Spoke with Brendon re: bore depth progress. On track for completion by 20 March. He requested a draft completion certificate be sent ahead of final inspection." },
      { id: "a2", type: "email", subject: "Invoice INV-2026-0031 sent", date: "2026-02-24", author: "Sean Templeton", notes: "Invoice for first progress claim emailed to accounts@irrigationnz.co.nz. Brendon CC'd." },
      { id: "a3", type: "meeting", subject: "Site visit — Station Road Farm", date: "2026-02-10", author: "Sean Templeton", notes: "Pre-mobilisation site meeting with Brendon and site owner. Access confirmed, rig location agreed, health & safety briefing completed." },
    ],
  },
  {
    id: "c2", code: "SDC", name: "Selwyn District Council", industry: "Local Government", region: "Canterbury",
    phone: "03 347 2800", email: "infrastructure@selwyn.govt.nz", website: "selwyn.govt.nz",
    billingAddress: "2 Norman Kirk Drive, Rolleston 7614", paymentTerms: 20, creditLimit: 500000,
    isActive: true, since: "2017-06-15",
    contacts: [
      { id: "co3", name: "Rachel Forde", title: "Ms", role: "Water Services Engineer", email: "r.forde@selwyn.govt.nz", phone: "03 347 2855", mobile: "027 312 4490", isPrimary: true },
      { id: "co4", name: "Grant Tamati", title: "Mr", role: "Senior Procurement", email: "g.tamati@selwyn.govt.nz", phone: "03 347 2801", mobile: null, isPrimary: false },
    ],
    activities: [
      { id: "a4", type: "meeting", subject: "Annual contract review", date: "2026-02-01", author: "Sean Templeton", notes: "Met with Rachel and Grant to review 2025 programme. Council happy with quality of work. Discussed 2026 monitoring bore expansion — likely 4–6 new bores across Rolleston growth area. Follow up with proposal by end of February." },
      { id: "a5", type: "email", subject: "Final completion docs — Job 100015", date: "2026-03-02", author: "Sean Templeton", notes: "Sent final bore completion certificates and drilling logs for all 8 bores. Rachel confirmed receipt." },
    ],
  },
  {
    id: "c3", code: "TNT", name: "Tonkin + Taylor", industry: "Engineering Consultancy", region: "Canterbury",
    phone: "03 366 4063", email: "chch@tonkintaylor.co.nz", website: "tonkintaylor.co.nz",
    billingAddress: "Level 2, 104 Peterborough Street, Christchurch 8013", paymentTerms: 30, creditLimit: 300000,
    isActive: true, since: "2020-09-10",
    contacts: [
      { id: "co5", name: "James Holloway", title: "Dr", role: "Principal Geotechnical Engineer", email: "j.holloway@tonkintaylor.co.nz", phone: "03 366 4063", mobile: "021 889 234", isPrimary: true },
    ],
    activities: [
      { id: "a6", type: "call", subject: "Mobilisation confirmed — Job 200042", date: "2026-02-27", author: "Lisa Park", notes: "Confirmed rig mobilisation for 1 March. James will be on site for first two days. Borehole locations sent through — 6 BH to 15m, 2 BH to 25m." },
    ],
  },
  {
    id: "c4", code: "NZTA", name: "NZTA", industry: "Government / Infrastructure", region: "National",
    phone: "0800 699 000", email: "procurement@nzta.govt.nz", website: "nzta.govt.nz",
    billingAddress: "50 Victoria Street, Wellington 6011", paymentTerms: 20, creditLimit: 1000000,
    isActive: true, since: "2021-01-20",
    contacts: [
      { id: "co6", name: "Kevin Lam", title: "Mr", role: "Project Manager — Infrastructure", email: "k.lam@nzta.govt.nz", phone: "09 444 7200", mobile: "021 765 002", isPrimary: true },
      { id: "co7", name: "Aroha Ngata", title: "Ms", role: "Contracts Administrator", email: "a.ngata@nzta.govt.nz", phone: "09 444 7201", mobile: null, isPrimary: false },
    ],
    activities: [
      { id: "a7", type: "call", subject: "Overdue invoice follow-up — INV-2026-0028", date: "2026-03-10", author: "Sean Templeton", notes: "Called Aroha re: overdue invoice. Payment delayed due to internal purchase order issue on their end. She expects it resolved within the week. Will email remittance advice." },
      { id: "a8", type: "meeting", subject: "Contract award — SH73 slope investigation", date: "2026-01-10", author: "Kevin Lam", notes: "Contract awarded following competitive tender. Scope: geotechnical investigation of 3 slope failure sites along SH73 west of Auckland. Mobilisation late January." },
    ],
  },
  {
    id: "c5", code: "HCF", name: "High Country Farms", industry: "Agriculture", region: "Canterbury",
    phone: "03 318 6600", email: "admin@highcountryfarms.co.nz", website: null,
    billingAddress: "Rakaia Gorge Road, RD2, Methven 7772", paymentTerms: 30, creditLimit: 100000,
    isActive: true, since: "2023-07-01",
    contacts: [
      { id: "co8", name: "Stuart Mackenzie", title: "Mr", role: "Owner / Director", email: "stuart@highcountryfarms.co.nz", phone: "03 318 6600", mobile: "027 234 5678", isPrimary: true },
    ],
    activities: [
      { id: "a9", type: "email", subject: "Estimate EST-2026-0014 approved", date: "2026-02-28", author: "Sean Templeton", notes: "Stuart confirmed approval of estimate by email. Requested start date of 15 March. Dave Rudd assigned as supervisor." },
    ],
  },
  {
    id: "c6", code: "NCV", name: "North Canterbury Vineyards", industry: "Agriculture / Viticulture", region: "North Canterbury",
    phone: "03 314 6800", email: "operations@ncvineyards.co.nz", website: "ncvineyards.co.nz",
    billingAddress: "State Highway 1, Waipara 7447", paymentTerms: 30, creditLimit: 75000,
    isActive: true, since: "2024-02-14",
    contacts: [
      { id: "co9", name: "Camille Broussard", title: "Ms", role: "Operations Manager", email: "c.broussard@ncvineyards.co.nz", phone: "03 314 6800", mobile: "021 098 765", isPrimary: true },
    ],
    activities: [
      { id: "a10", type: "call", subject: "Job 100009 on-hold discussion", date: "2026-02-20", author: "Sean Templeton", notes: "Camille requested we pause drilling pending resource consent decision from ECan. Expect resolution in 4–6 weeks. Job status set to On Hold." },
    ],
  },
];

// ── Clients List Screen ───────────────────────────────────────────────────────
const ClientsScreen = ({ onNavigate, regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");

  const industries = ["all", ...Array.from(new Set(CLIENTS.map(c => c.industry)))];
  const filtered = CLIENTS.filter(c => {
    if (industryFilter !== "all" && c.industry !== industryFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    // Region/division filter — include client if they have at least one job matching the filter
    const clientJobs = JOBS.filter(j => j.client === c.name);
    if (clientJobs.length > 0) {
      const match = clientJobs.some(j =>
        (regionFilter === "all" || j.region === regionFilter) && divisionFilter[j.division]
      );
      if (!match) return false;
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Clients</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>{filtered.length} client{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Icon d={icons.plus} size={14} color={COLORS.navy} /> New Client
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "0 0 260px" }}>
          <Icon d={icons.search} size={14} color={COLORS.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.white, color: COLORS.textPrimary, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 4, background: COLORS.bg, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
          {industries.map(ind => (
            <button key={ind} onClick={() => setIndustryFilter(ind)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: industryFilter === ind ? COLORS.white : "transparent", color: industryFilter === ind ? COLORS.textPrimary : COLORS.textMuted, boxShadow: industryFilter === ind ? "0 1px 3px rgba(0,0,0,0.1)" : "none", whiteSpace: "nowrap" }}>
              {ind === "all" ? "All Industries" : ind}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {filtered.map(client => {
          const clientJobs = JOBS.filter(j => j.client === client.name);
          const activeJobs = clientJobs.filter(j => j.status === "active").length;
          const totalValue = clientJobs.reduce((s, j) => s + (j.contractValue || 0), 0);
          const primaryContact = client.contacts.find(c => c.isPrimary);
          const lastActivity = client.activities[0];
          const activityIcons = { call: icons.time, email: icons.estimates, meeting: icons.clients, site_visit: icons.mapPin };

          return (
            <div key={client.id} onClick={() => onNavigate("clientdetail", client)}
              style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor = COLORS.amber; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = COLORS.border; }}>

              {/* Client header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: COLORS.navyLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.amber, letterSpacing: "-0.02em" }}>{client.code.slice(0, 3)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>{client.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{client.industry}</div>
                  </div>
                </div>
                {activeJobs > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.green, background: COLORS.greenLight, padding: "3px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>
                    {activeJobs} active
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 0", borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 12 }}>
                {[
                  { label: "Total Jobs", value: clientJobs.length },
                  { label: "Contract Value", value: totalValue > 0 ? `$${(totalValue / 1000).toFixed(0)}k` : "—" },
                  { label: "Payment Terms", value: `${client.paymentTerms}d` },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-0.02em" }}>{stat.value}</div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Primary contact */}
              {primaryContact && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Icon d={icons.user} size={13} color={COLORS.textMuted} />
                  <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{primaryContact.name}</span>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>· {primaryContact.role}</span>
                </div>
              )}

              {/* Last activity */}
              {lastActivity && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", background: COLORS.bg, borderRadius: 7 }}>
                  <Icon d={activityIcons[lastActivity.type] || icons.clients} size={12} color={COLORS.textMuted} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: 600 }}>{lastActivity.subject}</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}> · {lastActivity.date}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Client Detail Screen ──────────────────────────────────────────────────────
const ClientDetailScreen = ({ client, onBack, onNavigate }) => {
  const [tab, setTab] = useState("overview");
  const clientJobs = JOBS.filter(j => j.client === client.name);
  const totalValue = clientJobs.reduce((s, j) => s + (j.contractValue || 0), 0);
  const totalInvoiced = INVOICES.filter(i => i.client === client.name).reduce((s, i) => s + i.amount, 0);
  const activityTypeConfig = {
    call:      { label: "Call",      color: COLORS.blue,  bg: COLORS.blueLight },
    email:     { label: "Email",     color: COLORS.teal,  bg: COLORS.tealLight },
    meeting:   { label: "Meeting",   color: "#7C3AED",    bg: "#EDE9FE" },
    site_visit:{ label: "Site Visit",color: COLORS.amber, bg: COLORS.amberLight },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>Clients</button>
        <Icon d={icons.chevronRight} size={13} color={COLORS.textMuted} />
        <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{client.name}</span>
      </div>

      {/* Client Header Card */}
      <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: COLORS.navyLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.amber, letterSpacing: "-0.02em" }}>{client.code.slice(0,3)}</span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.01em" }}>{client.name}</h1>
                <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>{client.code}</span>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon d={icons.jobs} size={13} color={COLORS.textMuted} />
                  <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{client.industry}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon d={icons.mapPin} size={13} color={COLORS.textMuted} />
                  <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{client.region}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon d={icons.calendar} size={13} color={COLORS.textMuted} />
                  <span style={{ fontSize: 13, color: COLORS.textSecondary }}>Client since {client.since.slice(0,4)}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button style={{ padding: "8px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Edit Client</button>
            <button style={{ padding: "8px 14px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>+ New Job</button>
          </div>
        </div>

        {/* Finance strip */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}`, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {[
            { label: "Total Jobs", value: clientJobs.length, color: COLORS.textPrimary },
            { label: "Active Jobs", value: clientJobs.filter(j => j.status === "active").length, color: COLORS.green },
            { label: "Contract Value", value: `$${(totalValue/1000).toFixed(0)}k`, color: COLORS.blue },
            { label: "Invoiced", value: `$${(totalInvoiced/1000).toFixed(0)}k`, color: COLORS.teal },
            { label: "Payment Terms", value: `${client.paymentTerms} days`, color: COLORS.textPrimary },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: item.color, letterSpacing: "-0.02em", marginTop: 2 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, background: COLORS.bg, padding: 4, borderRadius: 10, border: `1px solid ${COLORS.border}`, width: "fit-content" }}>
        {["overview", "contacts", "jobs", "activity"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === t ? COLORS.white : "transparent", color: tab === t ? COLORS.textPrimary : COLORS.textMuted, boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>Client Details</h3>
            {[
              ["Client Code", client.code],
              ["Industry", client.industry],
              ["Region", client.region],
              ["Phone", client.phone],
              ["Email", client.email],
              ["Website", client.website || "—"],
              ["Billing Address", client.billingAddress],
              ["Payment Terms", `${client.paymentTerms} days`],
              ["Credit Limit", `$${client.creditLimit.toLocaleString()}`],
              ["Client Since", client.since],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500, flexShrink: 0, marginRight: 16 }}>{label}</span>
                <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 600, textAlign: "right" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Right: recent activity + job summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>Recent Activity</span>
                <button onClick={() => setTab("activity")} style={{ fontSize: 12, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
              </div>
              {client.activities.slice(0, 3).map((act, i) => {
                const cfg = activityTypeConfig[act.type] || activityTypeConfig.call;
                return (
                  <div key={act.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < 2 ? `1px solid ${COLORS.border}` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: "2px 7px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>{cfg.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary }}>{act.subject}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{act.author} · {act.date}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>Jobs</span>
                <button onClick={() => setTab("jobs")} style={{ fontSize: 12, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
              </div>
              {clientJobs.length === 0 && <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>No jobs yet.</p>}
              {clientJobs.slice(0, 3).map(job => (
                <div key={job.id} onClick={(e) => { e.stopPropagation(); onNavigate("jobdetail", job); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <div>
                    <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: COLORS.navy }}>{job.id}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Contacts Tab ── */}
      {tab === "contacts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={{ padding: "8px 16px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>+ Add Contact</button>
          </div>
          {client.contacts.map(contact => (
            <div key={contact.id} style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: contact.isPrimary ? COLORS.navyLight : COLORS.bg, border: contact.isPrimary ? `2px solid ${COLORS.amber}` : `2px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: contact.isPrimary ? COLORS.amber : COLORS.textMuted }}>
                  {contact.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.textPrimary }}>{contact.title} {contact.name}</span>
                  {contact.isPrimary && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.amber, background: COLORS.amberLight, padding: "2px 8px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Primary</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 10 }}>{contact.role}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    { icon: icons.estimates, label: "Email", value: contact.email },
                    { icon: icons.time, label: "Phone", value: contact.phone },
                    { icon: icons.user, label: "Mobile", value: contact.mobile || "—" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Icon d={item.icon} size={13} color={COLORS.textMuted} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 500 }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button style={{ padding: "6px 12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 11, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Jobs Tab ── */}
      {tab === "jobs" && (
        <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {clientJobs.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted, fontSize: 14 }}>No jobs for this client yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  {["Job Number", "Title", "Division", "Status", "Contract Value", "Invoiced"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientJobs.map((job, i) => (
                  <tr key={job.id} onClick={() => onNavigate("jobdetail", job)} style={{ cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLORS.navy, background: COLORS.bg, padding: "3px 8px", borderRadius: 5, border: `1px solid ${COLORS.border}` }}>{job.id}</span>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, maxWidth: 220 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}><DivisionBadge div={job.division} /></td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}><StatusBadge status={job.status} /></td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>{fmt(job.contractValue)}</td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                      {job.contractValue ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <ProgressBar value={job.invoiced} max={job.contractValue} color={job.division === "Water" ? COLORS.blue : COLORS.teal} />
                          <span style={{ fontSize: 11, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{pct(job.invoiced, job.contractValue)}%</span>
                        </div>
                      ) : <span style={{ fontSize: 12, color: COLORS.textMuted }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Activity Tab ── */}
      {tab === "activity" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={{ padding: "8px 16px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>+ Log Activity</button>
          </div>
          {client.activities.map((act, i) => {
            const cfg = activityTypeConfig[act.type] || activityTypeConfig.call;
            return (
              <div key={act.id} style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={act.type === "call" ? icons.time : act.type === "email" ? icons.estimates : icons.clients} size={16} color={cfg.color} />
                  </div>
                  {i < client.activities.length - 1 && <div style={{ width: 2, flex: 1, background: COLORS.border, borderRadius: 1 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: i < client.activities.length - 1 ? 8 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>{cfg.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{act.subject}</span>
                    </div>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, whiteSpace: "nowrap", marginLeft: 12 }}>{act.date}</span>
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>Logged by {act.author}</div>
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6 }}>{act.notes}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
// ── Estimates Data ────────────────────────────────────────────────────────────
const ESTIMATES = [
  {
    id: "EST-2026-0021", ref: "23559", revision: 1,
    client: "Landform Projects", clientCode: "LFP", contact: "Richard Wise", contactMobile: "027 221 2987",
    division: "Geotech", region: "South",
    title: "Deep Geotechnical Investigation", siteAddress: "100 Park Terrace, Christchurch",
    status: "sent", date: "2026-03-11", validUntil: "2026-04-11",
    preparedBy: "Sean Templeton",
    scope: "1 x Sonic Borehole to 30mbgl with full core recovery & SPTs at 1.5m crs; hole completed with 50NB uPVC conduit grouted in place for downhole shear wave velocity testing.\n4x CPTu/DPSH soundings to refusal.\nIncludes provision for downhole shear wave velocity testing by subcontractor (note costs split between 78 & 100 Park Tce)\nClient to verify locations of underground services & ensure proposed drill sites are clear of buried obstructions.",
    sections: [
      {
        title: "Preliminaries",
        items: [
          { description: "Mobilisation/Demobilisation/Health & Safety/Daily Travel - Christchurch area", qty: 2, rate: 295.00, unit: "ea" },
          { description: "Health and safety additional - (inductions, SSSP, extra PPE, etc)", qty: 1, rate: 225.00, unit: "ls" },
          { description: "Standby (hourly, manned)", qty: null, rate: 255.00, unit: "hr" },
        ],
      },
      {
        title: "Cone Penetration Testing / Seismic Sounding / DPSH / Flat Dilatometer (Various)",
        items: [
          { description: "Day rate CPTu sounding - Pagani TG63-150 or TG73-200 (unlimited metreage including DPSH/DPT, minimum charge ½ day)", qty: 1, rate: 3550.00, unit: "day" },
          { description: "Expendable push in plug/tip for grouting - if required", qty: null, rate: 72.00, unit: "ea" },
          { description: "Cement powder for grout (min ½ bag/location) - if required", qty: null, rate: 42.50, unit: "bag" },
          { description: "Install cement/bentonite grout (exclude supply of consumables) - if required", qty: null, rate: 255.00, unit: "hr" },
        ],
      },
      {
        title: "Geotechnical/Environmental Investigation Boreholes (Sonic Dual Tube Sampling)",
        items: [
          { description: "Setup/withdrawal (per location)", qty: 1, rate: 355.00, unit: "ea" },
          { description: "DT45 Sonic coring - soil 0 - 30m", qty: 30, rate: 217.00, unit: "m" },
          { description: "DT45 Sonic coring - soil 30m+", qty: null, rate: 253.00, unit: "m" },
          { description: "DT45 Sonic coring - rock/cobble/fill extra over soil rate", qty: null, rate: 49.00, unit: "m" },
          { description: "DT60/DT80 Sonic - overcasing", qty: 2, rate: 355.00, unit: "hr" },
          { description: "Standard penetration test 0 - 30m (solid/split spoon)", qty: 20, rate: 85.00, unit: "ea" },
          { description: "Standard penetration test 30m+ (solid/split spoon)", qty: null, rate: 115.00, unit: "ea" },
        ],
      },
      {
        title: "Specialised Testing (Downhole Shear Wave Velocity)",
        items: [
          { description: "Mob/Demob/site establishment", qty: 1, rate: 325.00, unit: "ls" },
          { description: "Downhole Vs Survey - 30m profiling", qty: 1, rate: 2990.00, unit: "ls" },
          { description: "Downhole Vs Survey - interpretation, analysis and reporting", qty: 1, rate: 1035.00, unit: "ls" },
        ],
      },
      {
        title: "Installations/Consumables",
        items: [
          { description: "Supply and install 50NB piezometer pipe - unslotted", qty: 30, rate: 42.50, unit: "m" },
          { description: "Core Trays", qty: 13, rate: 39.50, unit: "ea" },
          { description: "Flush mounted toby box (environmental)", qty: 1, rate: 215.00, unit: "ea" },
          { description: "Weighted drill muds for drilling in artesian conditions, per m³, includes mixing and delivery to site - if required", qty: null, rate: 845.00, unit: "m³" },
          { description: "Cement/Concrete (min ½ bag/location)", qty: 3, rate: 42.50, unit: "bag" },
          { description: "Bentonite (min ½ bag/location)", qty: 0.5, rate: 47.50, unit: "bag" },
          { description: "Cement powder for grout (min ½ bag/location)", qty: 4, rate: 42.50, unit: "bag" },
          { description: "Install cement/bentonite grout (exclude supply of consumables)", qty: 2, rate: 255.00, unit: "hr" },
          { description: "Monitoring well development - hand bailer / electric submersible pump", qty: 0.5, rate: 185.00, unit: "hr" },
        ],
      },
      {
        title: "Miscellaneous",
        items: [
          { description: "Site water supply", qty: 1, rate: 450.00, unit: "ls" },
          { description: "Decontaminate equipment/tidy/reinstate site", qty: 2, rate: 133.00, unit: "hr" },
          { description: "Sawcut concrete/asphalt pavement - per location (max. 200 mm thickness)", qty: null, rate: 190.00, unit: "ea" },
        ],
      },
    ],
    notes: [
      "All Prices exclude GST.",
      "Cost estimates are based on McMillan's Schedule of Standard Rates and this schedule shall take precedence in the event of any ambiguity.",
      "All works are subject to McMillan standard terms and conditions - available on request.",
      "Cancellations of confirmed jobs within 5 business days of proposed project start date may incur cancellation fee up to 10% of total estimate.",
      "It is the client's responsibility to obtain necessary consents and approvals for us to gain suitable access to testing locations for our equipment and personnel.",
      "We reserve the right to decline entry to any test location unsuitable or unsafe for access.",
      "Provisional sums are given as approximate estimates only, and will be charged at cost +15%.",
      "Minimum daily charge applies if CPT sounding or drilling charges do not exceed minimum charge - per rig, per day, per site attendance.",
      "Quantities given above are ESTIMATES ONLY and subject to change based on actual quantities used.",
      "Contaminated soils (if encountered) may incur additional costs for soil disposal and PPE.",
      "It is the client's responsibility to organise any traffic management requirements.",
      "It is the client's responsibility to identify any underground services.",
    ],
  },
  {
    id: "EST-2026-0019", ref: "23541", revision: 2,
    client: "Selwyn District Council", clientCode: "SDC", contact: "Rachel Forde", contactMobile: "027 312 4490",
    division: "Water", region: "South",
    title: "Monitoring Bore Installation — Rolleston Growth Area", siteAddress: "Selwyn District, Multiple Locations",
    status: "approved", date: "2026-02-15", validUntil: "2026-03-15",
    preparedBy: "Sean Templeton",
    scope: "Installation of 4 x groundwater monitoring bores to 25mbgl in the Rolleston growth area. Bores to be completed with 50NB uPVC screen and casing, surface mounted with flush toby boxes. Locations to be confirmed by Council prior to mobilisation.",
    sections: [
      {
        title: "Preliminaries",
        items: [
          { description: "Mobilisation/Demobilisation - Southbridge base", qty: 1, rate: 450.00, unit: "ls" },
          { description: "Health & Safety / Site Inductions", qty: 4, rate: 185.00, unit: "ea" },
          { description: "Daily Travel - Rolleston area", qty: 5, rate: 145.00, unit: "day" },
        ],
      },
      {
        title: "Water Bore Drilling",
        items: [
          { description: "Setup/withdrawal (per location)", qty: 4, rate: 355.00, unit: "ea" },
          { description: "Air rotary drilling 0-25m", qty: 100, rate: 185.00, unit: "m" },
          { description: "Air rotary drilling 25m+", qty: null, rate: 215.00, unit: "m" },
          { description: "Standby - manned (hourly)", qty: null, rate: 255.00, unit: "hr" },
        ],
      },
      {
        title: "Installations/Consumables",
        items: [
          { description: "Supply and install 50NB uPVC screen - slotted 0.3mm", qty: 40, rate: 48.50, unit: "m" },
          { description: "Supply and install 50NB uPVC casing - unslotted", qty: 60, rate: 38.50, unit: "m" },
          { description: "Flush mounted toby box (environmental)", qty: 4, rate: 215.00, unit: "ea" },
          { description: "Pea gravel pack", qty: 2, rate: 285.00, unit: "m³" },
          { description: "Bentonite seal", qty: 8, rate: 47.50, unit: "bag" },
          { description: "Cement/bentonite grout (surface seal)", qty: 8, rate: 42.50, unit: "bag" },
        ],
      },
      {
        title: "Miscellaneous",
        items: [
          { description: "Bore development - submersible pump", qty: 4, rate: 185.00, unit: "hr" },
          { description: "Decontaminate equipment/tidy/reinstate site", qty: 4, rate: 133.00, unit: "hr" },
          { description: "Bore completion report (per bore)", qty: 4, rate: 385.00, unit: "ea" },
        ],
      },
    ],
    notes: [
      "All Prices exclude GST.",
      "Cost estimates are based on McMillan's Schedule of Standard Rates.",
      "Quantities given above are ESTIMATES ONLY and subject to change based on actual quantities used.",
      "It is the client's responsibility to identify any underground services.",
      "It is the client's responsibility to organise any traffic management requirements.",
    ],
  },
  {
    id: "EST-2026-0017", ref: "23528", revision: 1,
    client: "Lincoln University", clientCode: "LU", contact: "Dr James Holloway", contactMobile: "021 889 234",
    division: "Geotech", region: "South",
    title: "CPT Testing — Lincoln University Campus", siteAddress: "Lincoln University, Lincoln",
    status: "draft", date: "2026-03-05", validUntil: "2026-04-05",
    preparedBy: "Sean Templeton",
    scope: "4 x CPTu soundings to refusal across the Lincoln University campus. Locations as indicated on site plan ref LU-2026-SP01. Client to confirm underground service clearance prior to mobilisation.",
    sections: [
      {
        title: "Preliminaries",
        items: [
          { description: "Mobilisation/Demobilisation/Daily Travel - Lincoln", qty: 1, rate: 295.00, unit: "ea" },
          { description: "Health and safety / site induction", qty: 1, rate: 225.00, unit: "ls" },
        ],
      },
      {
        title: "Cone Penetration Testing (CPTu)",
        items: [
          { description: "Day rate CPTu sounding - Pagani TG63-150 (unlimited metreage, min ½ day charge)", qty: 1, rate: 3550.00, unit: "day" },
          { description: "Expendable push in plug/tip for grouting - if required", qty: null, rate: 72.00, unit: "ea" },
          { description: "Install cement/bentonite grout - if required", qty: null, rate: 255.00, unit: "hr" },
        ],
      },
      {
        title: "Miscellaneous",
        items: [
          { description: "Decontaminate equipment / reinstate site", qty: 1, rate: 133.00, unit: "hr" },
          { description: "Sawcut concrete/asphalt pavement - per location (max. 200mm thickness)", qty: null, rate: 190.00, unit: "ea" },
        ],
      },
    ],
    notes: [
      "All Prices exclude GST.",
      "Cost estimates are based on McMillan's Schedule of Standard Rates.",
      "Quantities given above are ESTIMATES ONLY and subject to change based on actual quantities used.",
    ],
  },
];

const calcSectionTotal = (section) =>
  section.items.reduce((s, item) => s + (item.qty ? item.qty * item.rate : 0), 0);

const calcEstimateTotal = (est) =>
  est.sections.reduce((s, sec) => s + calcSectionTotal(sec), 0);

const fmtRate = (n) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
const fmtCost = (n) => n > 0 ? `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : "—";

const estimateStatusConfig = {
  draft:       { label: "Draft",       color: "#64748B", bg: "#F1F5F9" },
  sent:        { label: "Sent",        color: "#3B82F6", bg: "#DBEAFE" },
  under_review:{ label: "Under Review",color: "#7C3AED", bg: "#EDE9FE" },
  approved:    { label: "Approved",    color: "#10B981", bg: "#D1FAE5" },
  declined:    { label: "Declined",    color: "#EF4444", bg: "#FEE2E2" },
  superseded:  { label: "Superseded", color: "#94A3B8", bg: "#F8FAFC" },
};

// ── Estimates List Screen ─────────────────────────────────────────────────────
const EstimatesScreen = ({ onNavigate, estimates = ESTIMATES }) => {
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
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{est.client} · {est.siteAddress}</div>
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
                    <button onClick={e => { e.stopPropagation(); onNavigate("estimatedetail", est); }} style={{ fontSize: 11, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View →</button>
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

// ── Estimate Detail Screen ────────────────────────────────────────────────────
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
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{estimate.contact} · {estimate.contactMobile}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon d={icons.calendar} size={13} color={COLORS.textMuted} />
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{estimate.date} · Valid until {estimate.validUntil}</span>
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
                            <td style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 12, color: isProvisional ? COLORS.textMuted : COLORS.textPrimary, fontFamily: "monospace" }}>{item.qty ?? ""}</td>
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

        {/* Right column — totals + notes */}
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

// ── Default section templates drawn from the 100 Park Tce estimate ──────────
const SECTION_TEMPLATES = {
  Geotech: [
    { title: "Preliminaries", items: [
      { description: "Mobilisation/Demobilisation/Health & Safety/Daily Travel - Christchurch area", qty: "", rate: "295.00", unit: "ea" },
      { description: "Health and safety additional - (inductions, SSSP, extra PPE, etc)", qty: "", rate: "225.00", unit: "ls" },
      { description: "Standby (hourly, manned)", qty: "", rate: "255.00", unit: "hr" },
    ]},
    { title: "Cone Penetration Testing (CPTu)", items: [
      { description: "Day rate CPTu sounding - Pagani TG63-150 or TG73-200 (unlimited metreage, minimum charge ½ day)", qty: "", rate: "3550.00", unit: "day" },
      { description: "Expendable push in plug/tip for grouting - if required", qty: "", rate: "72.00", unit: "ea" },
      { description: "Cement powder for grout (min ½ bag/location) - if required", qty: "", rate: "42.50", unit: "bag" },
      { description: "Install cement/bentonite grout (exclude supply of consumables) - if required", qty: "", rate: "255.00", unit: "hr" },
    ]},
    { title: "Geotechnical Boreholes (Sonic Dual Tube Sampling)", items: [
      { description: "Setup/withdrawal (per location)", qty: "", rate: "355.00", unit: "ea" },
      { description: "DT45 Sonic coring - soil 0 - 30m", qty: "", rate: "217.00", unit: "m" },
      { description: "DT45 Sonic coring - soil 30m+", qty: "", rate: "253.00", unit: "m" },
      { description: "Standard penetration test 0 - 30m (solid/split spoon)", qty: "", rate: "85.00", unit: "ea" },
    ]},
    { title: "Installations/Consumables", items: [
      { description: "Supply and install 50NB piezometer pipe - unslotted", qty: "", rate: "42.50", unit: "m" },
      { description: "Core Trays", qty: "", rate: "39.50", unit: "ea" },
      { description: "Flush mounted toby box (environmental)", qty: "", rate: "215.00", unit: "ea" },
      { description: "Cement/Concrete (min ½ bag/location)", qty: "", rate: "42.50", unit: "bag" },
    ]},
    { title: "Miscellaneous", items: [
      { description: "Site water supply", qty: "", rate: "450.00", unit: "ls" },
      { description: "Decontaminate equipment/tidy/reinstate site", qty: "", rate: "133.00", unit: "hr" },
      { description: "Sawcut concrete/asphalt pavement - per location (max. 200mm thickness)", qty: "", rate: "190.00", unit: "ea" },
    ]},
  ],
  Water: [
    { title: "Preliminaries", items: [
      { description: "Mobilisation/Demobilisation - base", qty: "", rate: "450.00", unit: "ls" },
      { description: "Health & Safety / Site Inductions", qty: "", rate: "185.00", unit: "ea" },
      { description: "Daily Travel", qty: "", rate: "145.00", unit: "day" },
    ]},
    { title: "Water Bore Drilling", items: [
      { description: "Setup/withdrawal (per location)", qty: "", rate: "355.00", unit: "ea" },
      { description: "Air rotary drilling 0-25m", qty: "", rate: "185.00", unit: "m" },
      { description: "Air rotary drilling 25m+", qty: "", rate: "215.00", unit: "m" },
      { description: "Standby - manned (hourly)", qty: "", rate: "255.00", unit: "hr" },
    ]},
    { title: "Installations/Consumables", items: [
      { description: "Supply and install 50NB uPVC screen - slotted 0.3mm", qty: "", rate: "48.50", unit: "m" },
      { description: "Supply and install 50NB uPVC casing - unslotted", qty: "", rate: "38.50", unit: "m" },
      { description: "Flush mounted toby box (environmental)", qty: "", rate: "215.00", unit: "ea" },
      { description: "Pea gravel pack", qty: "", rate: "285.00", unit: "m³" },
      { description: "Bentonite seal", qty: "", rate: "47.50", unit: "bag" },
    ]},
    { title: "Miscellaneous", items: [
      { description: "Bore development - submersible pump", qty: "", rate: "185.00", unit: "hr" },
      { description: "Decontaminate equipment/tidy/reinstate site", qty: "", rate: "133.00", unit: "hr" },
      { description: "Bore completion report (per bore)", qty: "", rate: "385.00", unit: "ea" },
    ]},
  ],
};

const DEFAULT_NOTES = [
  "All Prices exclude GST.",
  "Cost estimates are based on McMillan's Schedule of Standard Rates and this schedule shall take precedence in the event of any ambiguity.",
  "All works are subject to McMillan standard terms and conditions - available on request.",
  "Cancellations of confirmed jobs within 5 business days of proposed project start date may incur cancellation fee up to 10% of total estimate.",
  "It is the client's responsibility to obtain necessary consents and approvals for us to gain suitable access to testing locations for our equipment and personnel.",
  "We reserve the right to decline entry to any test location unsuitable or unsafe for access.",
  "Provisional sums are given as approximate estimates only, and will be charged at cost +15%.",
  "Quantities given above are ESTIMATES ONLY and subject to change based on actual quantities used.",
  "Contaminated soils (if encountered) may incur additional costs for soil disposal and PPE.",
  "It is the client's responsibility to organise any traffic management requirements.",
  "It is the client's responsibility to identify any underground services.",
];

const UNIT_OPTIONS = ["ea", "ls", "hr", "day", "m", "m²", "m³", "bag", "t", "week"];

const makeItem = () => ({ id: Math.random().toString(36).slice(2), description: "", qty: "", rate: "", unit: "ea" });
const makeSection = (title = "New Section") => ({ id: Math.random().toString(36).slice(2), title, items: [makeItem()] });

const NewEstimateScreen = ({ onBack, onSave }) => {
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

  // Switch division → reload template sections (with confirm if items have been edited)
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
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Auto-numbered on save · Draft status</p>
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
        {/* ── LEFT COLUMN ── */}
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
                ? <p style={{ margin: "6px 0 0", fontSize: 11, color: COLORS.teal }}>Geotechnical template loaded — CPT, boreholes, specialised testing</p>
                : <p style={{ margin: "6px 0 0", fontSize: 11, color: COLORS.blue }}>Water template loaded — drilling, casing, installations</p>}
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
                placeholder={"Describe the scope — each line will appear as a separate paragraph.\ne.g. 1 x Sonic Borehole to 30mbgl with full core recovery & SPTs at 1.5m crs...\n4x CPTu/DPSH soundings to refusal."}
                rows={5}
                style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }} />
            </div>
          </div>

          {/* ── SECTIONS ── */}
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
                    {secTotal > 0 ? `$${secTotal.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                  </span>
                  <button onClick={() => moveSection(sec.id, -1)} disabled={si === 0}
                    style={{ background: "none", border: "none", cursor: si === 0 ? "default" : "pointer", opacity: si === 0 ? 0.3 : 1, padding: "2px 4px", color: COLORS.textMuted }}>▲</button>
                  <button onClick={() => moveSection(sec.id, 1)} disabled={si === sections.length - 1}
                    style={{ background: "none", border: "none", cursor: si === sections.length - 1 ? "default" : "pointer", opacity: si === sections.length - 1 ? 0.3 : 1, padding: "2px 4px", color: COLORS.textMuted }}>▼</button>
                  <button onClick={() => removeSection(sec.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", color: COLORS.red, fontSize: 16, lineHeight: 1 }}>×</button>
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
                            placeholder="—" type="text" inputMode="decimal"
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
                            {cost != null ? `$${cost.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                          </div>
                          {/* Actions */}
                          <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <button onClick={() => moveItem(sec.id, item.id, -1)} disabled={ii === 0}
                              style={{ background: "none", border: "none", cursor: ii === 0 ? "default" : "pointer", opacity: ii === 0 ? 0.25 : 0.6, fontSize: 11, padding: "2px 3px", color: COLORS.textMuted }}>▲</button>
                            <button onClick={() => moveItem(sec.id, item.id, 1)} disabled={ii === sec.items.length - 1}
                              style={{ background: "none", border: "none", cursor: ii === sec.items.length - 1 ? "default" : "pointer", opacity: ii === sec.items.length - 1 ? 0.25 : 0.6, fontSize: 11, padding: "2px 3px", color: COLORS.textMuted }}>▼</button>
                            <button onClick={() => removeItem(sec.id, item.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.red, fontSize: 15, padding: "0 3px", lineHeight: 1 }}>×</button>
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
                        {secTotal > 0 ? `$${secTotal.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
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

        {/* ── RIGHT COLUMN — live totals ── */}
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
                      {st > 0 ? `$${st.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}` : "—"}
                    </span>
                  </div>
                );
              })}
              <div style={{ height: 1, background: COLORS.border, margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 600 }}>Subtotal (excl GST)</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, fontFamily: "monospace" }}>
                  {total > 0 ? `$${total.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}` : "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>GST (15%)</span>
                <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace" }}>
                  {gst > 0 ? `$${gst.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}` : "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: COLORS.navyLight, borderRadius: 8, marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.white }}>Total (incl GST)</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.amber, fontFamily: "monospace" }}>
                  {(total + gst) > 0 ? `$${(total + gst).toLocaleString("en-NZ", { minimumFractionDigits: 2 })}` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Provisional items notice */}
          <div style={{ background: COLORS.amberLight, border: `1px solid #FDE68A`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", marginBottom: 4 }}>PROVISIONAL ITEMS</div>
            <p style={{ margin: 0, fontSize: 11, color: "#92400E", lineHeight: 1.6 }}>
              Line items with <strong>no quantity</strong> are shown in italic and calculated as <strong>$0</strong> — they appear on the estimate as provisional/if-required items.
            </p>
          </div>

          {/* Tip card */}
          <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 6 }}>TIPS</div>
            <ul style={{ margin: 0, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                "Leave Qty blank → provisional/if required line",
                "Click section title to rename it",
                "▲▼ arrows reorder sections and items",
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

const NewJobScreen = ({ onBack }) => {
  const [form, setForm] = useState({ title: "", client: "", division: "Water", region: "South", type: "water_bore", status: "enquiry" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const fieldStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, color: COLORS.textPrimary, outline: "none", boxSizing: "border-box", background: COLORS.white };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6, display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>Jobs</button>
        <Icon d={icons.chevronRight} size={13} color={COLORS.textMuted} />
        <span style={{ fontSize: 13, color: COLORS.textSecondary }}>New Job</span>
      </div>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Create New Job</h1>
        <p style={{ margin: 0, color: COLORS.textSecondary, fontSize: 14 }}>A job number will be auto-generated on save (e.g. 100022 for Water, 200045 for Geotech)</p>
      </div>
      <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>Basic Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Job Title *</label>
            <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Bore Installation — Station Road Farm" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Client *</label>
            <select value={form.client} onChange={e=>set("client",e.target.value)} style={fieldStyle}>
              <option value="">Select client...</option>
              <option>Irrigation NZ Ltd</option>
              <option>Selwyn District Council</option>
              <option>Tonkin + Taylor</option>
              <option>NZTA</option>
              <option>High Country Farms</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Division *</label>
            <select value={form.division} onChange={e=>set("division",e.target.value)} style={fieldStyle}>
              <option>Water</option>
              <option>Geotech</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Base Location *</label>
            <select value={form.region} onChange={e=>set("region",e.target.value)} style={fieldStyle}>
              <option>Christchurch</option>
              <option>Southbridge</option>
              <option>Auckland</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Job Type *</label>
            <select value={form.type} onChange={e=>set("type",e.target.value)} style={fieldStyle}>
              <option value="water_bore">Water Bore</option>
              <option value="monitoring_bore">Monitoring Bore</option>
              <option value="geotechnical">Geotechnical Investigation</option>
              <option value="cpt_testing">CPT Testing</option>
              <option value="environmental">Environmental / Contamination</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Initial Status</label>
            <select value={form.status} onChange={e=>set("status",e.target.value)} style={fieldStyle}>
              <option value="enquiry">Enquiry</option>
              <option value="quoted">Quoted</option>
              <option value="approved">Approved</option>
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Site Address</label>
            <input placeholder="Physical address of drilling site" style={fieldStyle} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Description / Scope</label>
            <textarea placeholder="Describe the scope of work..." rows={3} style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.5 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${COLORS.border}` }}>
          <button onClick={onBack} style={{ padding: "10px 20px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Cancel</button>
          <button style={{ padding: "10px 24px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>Save Job & Create SharePoint Folder</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUPPLIERS MODULE
// ═══════════════════════════════════════════════════════════════════════════

const SUPPLIERS = [
  {
    id: "s1", code: "GEO-LAB", name: "GNS Science", category: "subcontractor", specialty: "Downhole Seismic / Lab Testing",
    contact: "Dr. Hamish Bowman", email: "h.bowman@gns.cri.nz", phone: "04 570 1444", mobile: "021 334 788",
    address: "1 Fairway Drive, Avalon, Lower Hutt 5010", paymentTerms: 30, isActive: true,
    pos: [
      { id: "PO-2026-0011", job: "200042", jobTitle: "Ground Investigation — Prestons Road", description: "Downhole Vs Survey subcontract — Prestons Road BH1", amount: 4025.00, status: "approved", date: "2026-03-02" },
      { id: "PO-2026-0008", job: "200029", jobTitle: "Slope Stability Investigation — SH73", description: "Seismic CPT subcontract — SH73 West Auckland", amount: 6200.00, status: "paid", date: "2026-02-10" },
    ],
  },
  {
    id: "s2", code: "DRILL-SUP", name: "Drilling Supplies NZ", category: "supplier", specialty: "Drilling Consumables & Bits",
    contact: "Barry Finch", email: "sales@drillingsuppliesnz.co.nz", phone: "03 348 5500", mobile: "027 445 6621",
    address: "18 Nga Mahi Road, Sockburn, Christchurch 8042", paymentTerms: 20, isActive: true,
    pos: [
      { id: "PO-2026-0014", job: "100018", jobTitle: "Bore Installation — Station Road Farm", description: "Tri-cone drill bits x3, 200m casing supply", amount: 3840.00, status: "approved", date: "2026-03-05" },
      { id: "PO-2026-0009", job: "100021", jobTitle: "Irrigation Bore — Rakaia Gorge", description: "Air rotary consumables — casing, bits, stabilisers", amount: 5210.00, status: "pending", date: "2026-03-10" },
    ],
  },
  {
    id: "s3", code: "ENV-LAB", name: "Hill Laboratories", category: "subcontractor", specialty: "Environmental / Soil Testing",
    contact: "Claire Sutton", email: "c.sutton@hill-labs.co.nz", phone: "07 858 2000", mobile: null,
    address: "28 Duke Street, Hamilton 3204", paymentTerms: 30, isActive: true,
    pos: [
      { id: "PO-2026-0013", job: "200044", jobTitle: "Contamination Assessment — Industrial Site", description: "Soil chemistry analysis — 24 samples", amount: 2880.00, status: "pending", date: "2026-03-08" },
    ],
  },
  {
    id: "s4", code: "PUMP-SVC", name: "Pump & Bore Services", category: "subcontractor", specialty: "Bore Development & Pump Testing",
    contact: "Grant McLeod", email: "grant@pumpbore.co.nz", phone: "03 325 3900", mobile: "027 712 3344",
    address: "45 Dunns Crossing Road, Rolleston 7614", paymentTerms: 14, isActive: true,
    pos: [
      { id: "PO-2026-0007", job: "100015", jobTitle: "Monitoring Bore Network — Selwyn District", description: "Electric submersible pump testing — 8 bores", amount: 4400.00, status: "paid", date: "2026-02-20" },
    ],
  },
  {
    id: "s5", code: "TRAFFIC", name: "Safety & Traffic NZ", category: "supplier", specialty: "Traffic Management",
    contact: "Rob Tane", email: "jobs@safetynz.co.nz", phone: "0800 444 123", mobile: "021 998 001",
    address: "Unit 3, 66 Treffers Road, Christchurch 8042", paymentTerms: 14, isActive: true,
    pos: [
      { id: "PO-2026-0010", job: "200042", jobTitle: "Ground Investigation — Prestons Road", description: "TCP traffic management — Prestons Rd, 3 days", amount: 1350.00, status: "approved", date: "2026-03-01" },
    ],
  },
];

const poStatusCfg = {
  pending:  { label: "Pending",  color: "#F59E0B", bg: "#FEF3C7" },
  approved: { label: "Approved", color: "#3B82F6", bg: "#DBEAFE" },
  paid:     { label: "Paid",     color: "#10B981", bg: "#D1FAE5" },
  disputed: { label: "Disputed", color: "#EF4444", bg: "#FEE2E2" },
};

const catColors = {
  subcontractor: { color: "#7C3AED", bg: "#EDE9FE" },
  supplier:      { color: "#0D9488", bg: "#CCFBF1" },
};

// ── Supplier Invoices (Accounts Payable) ─────────────────────────────────
const SUPPLIER_INVOICES_INIT = [
  {
    id: "SINV-2026-0009", supplierId: "s1", supplierName: "GNS Science",
    poId: "PO-2026-0011", job: "200042", jobTitle: "Ground Investigation — Prestons Road",
    supplierRef: "GNS-INV-4421", description: "Downhole Vs Survey — Prestons Road BH1",
    invoiceDate: "2026-03-05", dueDate: "2026-04-04", receivedDate: "2026-03-06",
    poAmount: 4025.00, invoiceAmount: 4025.00,
    status: "pending_review", approvedBy: null, approvedDate: null, paidDate: null,
    notes: "",
  },
  {
    id: "SINV-2026-0008", supplierId: "s5", supplierName: "Safety & Traffic NZ",
    poId: "PO-2026-0010", job: "200042", jobTitle: "Ground Investigation — Prestons Road",
    supplierRef: "STN-8812", description: "TCP Traffic Management — Prestons Rd, 3 days",
    invoiceDate: "2026-03-04", dueDate: "2026-03-18", receivedDate: "2026-03-05",
    poAmount: 1350.00, invoiceAmount: 1485.00,
    status: "pending_review", approvedBy: null, approvedDate: null, paidDate: null,
    notes: "Invoice $135 over PO — supplier charged extra half-day. Awaiting clarification.",
  },
  {
    id: "SINV-2026-0007", supplierId: "s2", supplierName: "Drilling Supplies NZ",
    poId: "PO-2026-0014", job: "100018", jobTitle: "Bore Installation — Station Road Farm",
    supplierRef: "DSNZ-11042", description: "Tri-cone drill bits x3, 200m casing supply",
    invoiceDate: "2026-03-06", dueDate: "2026-03-26", receivedDate: "2026-03-07",
    poAmount: 3840.00, invoiceAmount: 3840.00,
    status: "approved", approvedBy: "Sean Templeton", approvedDate: "2026-03-08", paidDate: null,
    notes: "",
  },
  {
    id: "SINV-2026-0006", supplierId: "s3", supplierName: "Hill Laboratories",
    poId: "PO-2026-0013", job: "200044", jobTitle: "Contamination Assessment — Industrial Site",
    supplierRef: "HILL-22819", description: "Soil chemistry analysis — 24 samples",
    invoiceDate: "2026-03-08", dueDate: "2026-04-07", receivedDate: "2026-03-09",
    poAmount: 2880.00, invoiceAmount: 2760.00,
    status: "pending_review", approvedBy: null, approvedDate: null, paidDate: null,
    notes: "Invoice $120 under PO — only 23 samples completed, one location inaccessible.",
  },
  {
    id: "SINV-2026-0005", supplierId: "s1", supplierName: "GNS Science",
    poId: "PO-2026-0008", job: "200029", jobTitle: "Slope Stability Investigation — SH73",
    supplierRef: "GNS-INV-4388", description: "Seismic CPT subcontract — SH73 West Auckland",
    invoiceDate: "2026-02-12", dueDate: "2026-03-13", receivedDate: "2026-02-13",
    poAmount: 6200.00, invoiceAmount: 6200.00,
    status: "paid", approvedBy: "Sean Templeton", approvedDate: "2026-02-14", paidDate: "2026-03-10",
    notes: "",
  },
  {
    id: "SINV-2026-0004", supplierId: "s4", supplierName: "Pump & Bore Services",
    poId: "PO-2026-0007", job: "100015", jobTitle: "Monitoring Bore Network — Selwyn District",
    supplierRef: "PBS-3341", description: "Electric submersible pump testing — 8 bores",
    invoiceDate: "2026-02-22", dueDate: "2026-03-08", receivedDate: "2026-02-23",
    poAmount: 4400.00, invoiceAmount: 4400.00,
    status: "paid", approvedBy: "Sean Templeton", approvedDate: "2026-02-24", paidDate: "2026-03-05",
    notes: "",
  },
];

const sinvStatusCfg = {
  pending_review: { label: "Pending Review", color: "#F59E0B", bg: "#FEF3C7" },
  approved:       { label: "Approved",        color: "#3B82F6", bg: "#DBEAFE" },
  disputed:       { label: "Disputed",        color: "#EF4444", bg: "#FEE2E2" },
  paid:           { label: "Paid",            color: "#10B981", bg: "#D1FAE5" },
};

// ── AP Reconciliation Sub-Module ─────────────────────────────────────────
const APReconciliationTab = () => {
  const [invoices, setInvoices] = useState(SUPPLIER_INVOICES_INIT);
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

  const handleApprove = (id) => {
    setInvoices(prev => prev.map(i => i.id === id
      ? { ...i, status: "approved", approvedBy: "Sean Templeton", approvedDate: "2026-03-11" }
      : i
    ));
    setConfirmAction(null);
  };

  const handleDispute = (id) => {
    setInvoices(prev => prev.map(i => i.id === id
      ? { ...i, status: "disputed" }
      : i
    ));
    setConfirmAction(null);
  };

  const handleMarkPaid = (id) => {
    setInvoices(prev => prev.map(i => i.id === id
      ? { ...i, status: "paid", paidDate: "2026-03-11" }
      : i
    ));
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
            const po = SUPPLIERS.flatMap(s => s.pos).find(p => p.id === inv.poId);
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
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>·</span>
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
                    {hasVariance(inv) ? "≠" : "="}
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
                    <span style={{ flexShrink: 0 }}>⚠</span>
                    <span>{inv.notes}</span>
                  </div>
                )}

                {/* Approval info */}
                {(inv.approvedBy || inv.paidDate) && (
                  <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
                    {inv.approvedBy && <span style={{ fontSize: 11, color: COLORS.textMuted }}>✓ Approved by <b style={{ color: COLORS.textSecondary }}>{inv.approvedBy}</b> on {inv.approvedDate}</span>}
                    {inv.paidDate && <span style={{ fontSize: 11, color: COLORS.green }}>✓ Paid {inv.paidDate}</span>}
                  </div>
                )}

                {/* Action buttons — show when selected and actionable */}
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
                          ✓ Approve Invoice
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
                  {isApprove ? "✓ Confirm Approval" : isDispute ? "Raise Dispute" : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const SuppliersScreen = ({ onNavigate, regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  const [tab, setTab] = useState("suppliers");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const supplier = selected ? SUPPLIERS.find(s => s.id === selected) : null;

  const pendingApCount = SUPPLIER_INVOICES_INIT.filter(i => i.status === "pending_review").length;

  const filtered = SUPPLIERS.filter(s => {
    if (catFilter !== "all" && s.category !== catFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.specialty.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Suppliers & Subcontractors</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>{SUPPLIERS.length} registered suppliers</p>
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

      {/* ── Suppliers & POs tab ── */}
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
                  ["Mobile", supplier.mobile || "—"],
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

      {/* ── AP Reconciliation tab ── */}
      {tab === "ap" && <APReconciliationTab />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// RESOURCES MODULE
// ═══════════════════════════════════════════════════════════════════════════

const EQUIPMENT = [
  { id: "eq1", name: "Rig 1 — Schramm T64W", type: "rig", category: "Rotary Air / Water Well Rig", division: "Water", region: "South", status: "deployed", jobId: "100018", rego: "SB7421", year: 2018, notes: "Major service due April 2026" },
  { id: "eq2", name: "Rig 2 — Schramm T130XD", type: "rig", category: "Rotary Air / Water Well Rig", division: "Water", region: "South", status: "available", jobId: null, rego: "CH4812", year: 2021, notes: "" },
  { id: "eq3", name: "Rig 3 — Geoprobe 7822DT", type: "rig", category: "Sonic / Geotechnical Rig", division: "Geotech", region: "South", status: "deployed", jobId: "200042", rego: "CH9034", year: 2020, notes: "" },
  { id: "eq4", name: "Rig 4 — Pagani TG73-200", type: "rig", category: "CPT / SCPT Rig", division: "Geotech", region: "North", status: "deployed", jobId: "200029", rego: "AK2291", year: 2022, notes: "" },
  { id: "eq5", name: "Rig 5 — Dando Terrier", type: "rig", category: "Rotary / Percussion Rig", division: "Water", region: "South", status: "maintenance", jobId: null, rego: "SB1104", year: 2015, notes: "Mast cylinder replacement in progress — est. return 25 March" },
  { id: "eq6", name: "Support Truck 1 — Isuzu NPR", type: "vehicle", category: "Support Vehicle", division: "Water", region: "South", status: "deployed", jobId: "100018", rego: "SB6612", year: 2019, notes: "" },
  { id: "eq7", name: "Support Truck 2 — Toyota Hilux 4WD", type: "vehicle", category: "Support Vehicle", division: "Geotech", region: "South", status: "deployed", jobId: "200042", rego: "CH3341", year: 2023, notes: "" },
  { id: "eq8", name: "Support Truck 3 — Ford Ranger 4WD", type: "vehicle", category: "Support Vehicle", division: "Water", region: "South", status: "available", jobId: null, rego: "CH7890", year: 2022, notes: "" },
  { id: "eq9", name: "Generator 1 — Hatz 20kVA", type: "ancillary", category: "Generator", division: null, region: "South", status: "deployed", jobId: "200042", rego: null, year: 2020, notes: "" },
  { id: "eq10", name: "Generator 2 — Kubota 15kVA", type: "ancillary", category: "Generator", division: null, region: "South", status: "available", jobId: null, rego: null, year: 2019, notes: "" },
  { id: "eq11", name: "Submersible Pump 1 — Grundfos MP1", type: "ancillary", category: "Pump", division: null, region: "South", status: "deployed", jobId: "100018", rego: null, year: 2021, notes: "" },
  { id: "eq12", name: "Air Compressor — Sullair 375", type: "ancillary", category: "Compressor", division: null, region: "South", status: "available", jobId: null, rego: null, year: 2018, notes: "" },
];

const eqStatusCfg = {
  available:   { label: "Available",   color: "#10B981", bg: "#D1FAE5" },
  deployed:    { label: "Deployed",    color: "#3B82F6", bg: "#DBEAFE" },
  maintenance: { label: "Maintenance", color: "#F97316", bg: "#FFEDD5" },
  retired:     { label: "Retired",     color: "#94A3B8", bg: "#F1F5F9" },
};

const INSPECTIONS_DATA = [
  // Rig 1 — Schramm T64W (eq1) history
  { id: "ins-101", eqId: "eq1", date: "2026-03-08", tech: "Dave Rudd",   faults: ["Minor hydraulic fitting seep — monitored"], status: "open",     priority: "low",    notes: "Watching — no active oil loss, re-check next pre-start" },
  { id: "ins-102", eqId: "eq1", date: "2026-03-01", tech: "Craig Tait",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-103", eqId: "eq1", date: "2026-02-22", tech: "Craig Tait",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-104", eqId: "eq1", date: "2026-02-15", tech: "Dave Rudd",   faults: ["Drill string vibration — rod 4 flagged for replacement"], status: "resolved", priority: "medium", notes: "Rod replaced 2026-02-17" },

  // Rig 2 — Schramm T130XD (eq2) history
  { id: "ins-201", eqId: "eq2", date: "2026-03-09", tech: "Tony Walsh",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-202", eqId: "eq2", date: "2026-03-02", tech: "Tony Walsh",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-203", eqId: "eq2", date: "2026-02-23", tech: "Dave Rudd",   faults: ["Coolant level low — topped up on-site"], status: "resolved", priority: "low", notes: "Topped up, no recurrence" },

  // Rig 3 — Geoprobe 7822DT (eq3) history
  { id: "ins-301", eqId: "eq3", date: "2026-03-09", tech: "Mike Brown",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-302", eqId: "eq3", date: "2026-03-02", tech: "Sam Ohu",     faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-303", eqId: "eq3", date: "2026-02-23", tech: "Mike Brown",  faults: ["Probe rod thread wear — 3 rods borderline"], status: "resolved", priority: "medium", notes: "Rods replaced 2026-02-25, stock ordered" },
  { id: "ins-304", eqId: "eq3", date: "2026-02-16", tech: "Sam Ohu",     faults: [], status: "pass", priority: null, notes: "" },

  // Rig 4 — Pagani TG73-200 (eq4) history
  { id: "ins-401", eqId: "eq4", date: "2026-03-07", tech: "Pete Hāpai", faults: ["Drill rod thread wear — 2 rods flagged"], status: "open", priority: "medium", notes: "Flagged for replacement on return to yard" },
  { id: "ins-402", eqId: "eq4", date: "2026-02-28", tech: "Pete Hāpai", faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-403", eqId: "eq4", date: "2026-02-21", tech: "Pete Hāpai", faults: ["CPT cone calibration drift — +2.3% on ref load"], status: "resolved", priority: "medium", notes: "Recalibrated by GNS 2026-02-24" },

  // Rig 5 — Dando Terrier (eq5) history
  { id: "ins-501", eqId: "eq5", date: "2026-03-05", tech: "Craig Tait",  faults: ["Mast cylinder leaking — oil loss", "Left outrigger pad worn"], status: "open", priority: "high", notes: "Rig stood down. Workshop booked 2026-03-10" },
  { id: "ins-502", eqId: "eq5", date: "2026-02-26", tech: "Craig Tait",  faults: ["Mast cylinder — early seep detected"], status: "resolved", priority: "low", notes: "Monitored — escalated to fault on 2026-03-05 inspection" },
  { id: "ins-503", eqId: "eq5", date: "2026-02-19", tech: "Tony Walsh",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-504", eqId: "eq5", date: "2026-02-12", tech: "Craig Tait",  faults: [], status: "pass", priority: null, notes: "" },
];

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

      {/* ── INSPECTIONS TAB ── */}
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
                      {hasFaults ? `${ins.faults.length} fault${ins.faults.length > 1 ? "s" : ""}` : "✓ Pass"}
                    </span>
                  </div>
                </div>
                {hasFaults && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                    {ins.faults.map((f, fi) => (
                      <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: COLORS.redLight, borderRadius: 7, fontSize: 12, color: "#7F1D1D" }}>⚠ {f}</div>
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

      {/* ── PLANT REGISTER TAB ── */}
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
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{eq.category} · {eq.year}</div>
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
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, marginTop: 1 }}>{linkedJob.id} — {linkedJob.client}</div>
                  </div>
                  <StatusBadge status={linkedJob.status} />
                </div>
              )}
              {/* Latest inspection summary */}
              {latestIns && (
                <div onClick={e => { e.stopPropagation(); setDrilldownEq(eq.id); }}
                  style={{ padding: "6px 10px", background: latestIns.faults.length > 0 ? COLORS.redLight : COLORS.greenLight, borderRadius: 6, fontSize: 11, display: "flex", justifyContent: "space-between", cursor: "pointer", marginBottom: eq.notes ? 6 : 0 }}>
                  <span style={{ color: latestIns.faults.length > 0 ? "#7F1D1D" : "#065F46", fontWeight: 600 }}>
                    {latestIns.faults.length > 0 ? `⚠ ${latestIns.faults.length} fault${latestIns.faults.length > 1 ? "s" : ""} — tap for history` : "✓ Last inspection passed — tap for history"}
                  </span>
                  <span style={{ color: COLORS.textMuted }}>{latestIns.date}</span>
                </div>
              )}
              {eq.notes && (
                <div style={{ marginTop: 0, padding: "6px 10px", background: COLORS.orangeLight, borderRadius: 6, fontSize: 11, color: "#92400E" }}>⚠ {eq.notes}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Per-equipment inspection history drill-down ── */}
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
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{eq?.category} · {eq?.year} · {eq?.region}</div>
                </div>
              </div>
              <button onClick={() => setDrilldownEq(null)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, cursor: "pointer", padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                ✕ Close
              </button>
            </div>

            {/* Stats strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: `1px solid ${COLORS.border}` }}>
              {[
                { label: "Total Inspections", value: eqInspections.length,      color: COLORS.textPrimary },
                { label: "Open Faults",        value: openCount,                 color: openCount > 0 ? COLORS.red : COLORS.green },
                { label: "Pass Rate",          value: passRate + "%",            color: passRate === 100 ? COLORS.green : passRate >= 75 ? COLORS.teal : COLORS.orange },
                { label: "Last Inspected",     value: eqInspections[0]?.date || "—", color: COLORS.textSecondary },
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
                              {ins.status === "resolved" ? "✓" : "⚠"} {f}
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
                          No faults — all clear
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

// ═══════════════════════════════════════════════════════════════════════════
// PLANNER MODULE
// ═══════════════════════════════════════════════════════════════════════════

const PLANNER_JOBS = [
  { rigId: "eq1", jobId: "100018", client: "Irrigation NZ Ltd", site: "Station Road, Leeston", start: "2026-02-10", end: "2026-03-20", color: COLORS.blue, personnel: ["Craig Tait", "Dave Rudd"] },
  { rigId: "eq2", jobId: "100021", client: "High Country Farms", site: "Rakaia Gorge Road", start: "2026-03-15", end: "2026-05-01", color: COLORS.blue, personnel: ["Dave Rudd", "Tony Walsh"] },
  { rigId: "eq3", jobId: "200042", client: "Tonkin + Taylor", site: "Prestons Road, Chch", start: "2026-03-01", end: "2026-04-15", color: COLORS.teal, personnel: ["Mike Brown", "Sam Ohu"] },
  { rigId: "eq4", jobId: "200029", client: "NZTA", site: "SH73, West Auckland", start: "2026-01-20", end: "2026-04-30", color: COLORS.teal, personnel: ["Pete Hāpai", "James Tūhoe"] },
  { rigId: "eq5", jobId: null, client: null, site: null, start: "2026-03-01", end: "2026-03-25", color: COLORS.orange, isDowntime: true, label: "Maintenance — Mast Cylinder", personnel: [] },
  { rigId: "eq1", jobId: "100015", client: "Selwyn District Council", site: "Multiple, Selwyn", start: "2025-11-01", end: "2026-02-28", color: "#94A3B8", personnel: ["Craig Tait", "Dave Rudd"] },
  { rigId: "eq3", jobId: "200038", client: "Lincoln University", site: "Lincoln University", start: "2026-04-20", end: "2026-05-10", color: COLORS.teal, personnel: ["Mike Brown", "Sam Ohu"] },
  { rigId: "eq2", jobId: "100009", client: "North Canterbury Vineyards", site: "Waipara Valley", start: "2026-01-15", end: "2026-02-15", color: "#94A3B8", personnel: ["Tony Walsh", "Craig Tait"] },
];

const RIGS = EQUIPMENT.filter(e => e.type === "rig");

const addDays = (dateStr, days) => {
  const d = new Date(dateStr); d.setDate(d.getDate() + days); return d;
};
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const toDateStr = (d) => d.toISOString().slice(0, 10);

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

  // Conflict detection — any rig with overlapping job bars
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
            Rig scheduling · {filteredRigs.length} rig{filteredRigs.length !== 1 ? "s" : ""} shown
            {regionFilter !== "all" && <span style={{ color: COLORS.amber, fontWeight: 700 }}> · {regionFilter}</span>}
            {conflicts.length > 0 && <span style={{ color: COLORS.red, fontWeight: 700 }}> · {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} detected</span>}
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
            <button onClick={() => setOffsetWeeks(o => o - 4)} style={{ padding: "7px 12px", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>◀ Earlier</button>
            <button onClick={() => setOffsetWeeks(0)} style={{ padding: "7px 12px", background: COLORS.amber, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.navy, cursor: "pointer" }}>Today</button>
            <button onClick={() => setOffsetWeeks(o => o + 4)} style={{ padding: "7px 12px", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Later ▶</button>
          </>}
        </div>
      </div>

      {/* Conflict alerts */}
      {conflicts.length > 0 && (
        <div style={{ background: COLORS.redLight, border: `1px solid ${COLORS.red}30`, borderRadius: 10, padding: "10px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.red, marginBottom: 2 }}>⚠ Resource Conflicts Detected</div>
          {conflicts.map((c, i) => {
            const rig = RIGS.find(r => r.id === c.rigId);
            return (
              <div key={i} style={{ fontSize: 12, color: COLORS.red }}>
                {rig?.name.split(" — ")[0]}: jobs <strong>{c.jobA}</strong> and <strong>{c.jobB}</strong> overlap — adjust dates below
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
                  {/* Day lines — weekend shading */}
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
                          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary }}>{rig.name.split(" — ")[0]}</div>
                          <div style={{ fontSize: 10, color: COLORS.textMuted }}>{rig.name.split(" — ")[1]}</div>
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
              PLANNER_JOBS.map((pj, i) => ({ ...pj, ...jobDates[i], rigName: rig.name.split(" — ")[0] }))
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
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{tooltip.job.start} → {tooltip.job.end}</div>
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
              {pj.isDowntime ? pj.label : `${pj.jobId} — ${pj.client}`}
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

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS MODULE
// ═══════════════════════════════════════════════════════════════════════════

// ── Shared chart primitives ───────────────────────────────────────────────

const BarChart = ({ data, height = 160, color = COLORS.blue, showValues = true }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, paddingTop: 20 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
          {showValues && d.value > 0 && (
            <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.textSecondary, whiteSpace: "nowrap" }}>
              {typeof d.value === "number" && d.value >= 1000 ? `$${(d.value/1000).toFixed(0)}k` : d.value}
            </span>
          )}
          <div style={{ width: "100%", background: typeof color === "function" ? color(d, i) : color, borderRadius: "4px 4px 0 0", height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%`, transition: "height 0.3s ease", minHeight: d.value > 0 ? 4 : 0 }} />
          <span style={{ fontSize: 9, fontWeight: 600, color: COLORS.textMuted, textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%", textOverflow: "ellipsis" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const HBarChart = ({ data, max: maxProp, color = COLORS.blue }) => {
  const max = maxProp || Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 130, fontSize: 12, color: COLORS.textSecondary, fontWeight: 500, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</div>
          <div style={{ flex: 1, background: COLORS.bg, borderRadius: 4, height: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max((d.value / max) * 100, d.value > 0 ? 2 : 0)}%`, background: typeof color === "function" ? color(d, i) : color, borderRadius: 4, transition: "width 0.3s ease", display: "flex", alignItems: "center", paddingLeft: 6 }}>
              {d.value > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap" }}>{d.pct != null ? `${d.pct}%` : d.value}</span>}
            </div>
          </div>
          <div style={{ width: 60, fontSize: 11, fontWeight: 700, color: COLORS.textPrimary, textAlign: "right", flexShrink: 0 }}>{d.display || d.value}</div>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ segments, size = 100 }) => {
  const total = segments.reduce((s, g) => s + g.value, 0);
  let cumulative = 0;
  const r = 40, cx = 50, cy = 50;
  const paths = segments.map(seg => {
    const pct = total > 0 ? seg.value / total : 0;
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += seg.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const largeArc = pct > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);
    const ri = 24;
    const xi1 = cx + ri * Math.cos(startAngle), yi1 = cy + ri * Math.sin(startAngle);
    const xi2 = cx + ri * Math.cos(endAngle),   yi2 = cy + ri * Math.sin(endAngle);
    return pct > 0 ? `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${xi2},${yi2} A${ri},${ri} 0 ${largeArc} 0 ${xi1},${yi1} Z` : null;
  }).filter(Boolean);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {paths.map((d, i) => <path key={i} d={d} fill={segments[i].color} />)}
    </svg>
  );
};

const StatCard = ({ label, value, sub, color = COLORS.textPrimary, accent }) => (
  <div style={{ background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: accent ? `3px solid ${accent}` : undefined }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>{sub}</div>}
  </div>
);

const ReportCard = ({ title, children, action }) => (
  <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.bg }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>{title}</span>
      {action && <button onClick={action.fn} style={{ fontSize: 11, fontWeight: 700, color: COLORS.blue, background: "none", border: "none", cursor: "pointer" }}>{action.label}</button>}
    </div>
    <div style={{ padding: "16px 20px" }}>{children}</div>
  </div>
);

const DateRangePicker = ({ from, to, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>From</span>
    <input type="date" value={from} onChange={e => onChange(e.target.value, to)}
      style={{ padding: "6px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 12, color: COLORS.textPrimary, outline: "none", background: COLORS.white }} />
    <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>To</span>
    <input type="date" value={to} onChange={e => onChange(from, e.target.value)}
      style={{ padding: "6px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 12, color: COLORS.textPrimary, outline: "none", background: COLORS.white }} />
  </div>
);

// Supplementary cost/hours data for reports
const JOB_COSTS = {
  "100018": { subcontractorCosts: 0,    labourCosts: 18400, otherCosts: 3200 },
  "200042": { subcontractorCosts: 5375, labourCosts: 9600,  otherCosts: 1800 },
  "100015": { subcontractorCosts: 4400, labourCosts: 52000, otherCosts: 9100 },
  "200038": { subcontractorCosts: 0,    labourCosts: 0,     otherCosts: 0    },
  "100021": { subcontractorCosts: 0,    labourCosts: 0,     otherCosts: 0    },
  "200029": { subcontractorCosts: 6200, labourCosts: 39400, otherCosts: 6800 },
  "100009": { subcontractorCosts: 0,    labourCosts: 8800,  otherCosts: 1400 },
  "200044": { subcontractorCosts: 0,    labourCosts: 0,     otherCosts: 0    },
};

const TIMESHEET_DETAIL = [
  { week: "2026-02-09", user: "Craig Tait",  job: "100018", hours: 45, role: "Driller" },
  { week: "2026-02-09", user: "Dave Rudd",   job: "100018", hours: 40, role: "Offsider" },
  { week: "2026-02-09", user: "Mike Brown",  job: "200042", hours: 38, role: "Driller" },
  { week: "2026-02-09", user: "Pete Hāpai", job: "200029", hours: 44, role: "Driller" },
  { week: "2026-02-16", user: "Craig Tait",  job: "100018", hours: 44, role: "Driller" },
  { week: "2026-02-16", user: "Dave Rudd",   job: "100018", hours: 40, role: "Offsider" },
  { week: "2026-02-16", user: "Mike Brown",  job: "200042", hours: 40, role: "Driller" },
  { week: "2026-02-16", user: "Pete Hāpai", job: "200029", hours: 44, role: "Driller" },
  { week: "2026-02-23", user: "Craig Tait",  job: "100018", hours: 46, role: "Driller" },
  { week: "2026-02-23", user: "Dave Rudd",   job: "100021", hours: 40, role: "Driller" },
  { week: "2026-02-23", user: "Mike Brown",  job: "200042", hours: 18, role: "Driller" },
  { week: "2026-02-23", user: "Pete Hāpai", job: "200029", hours: 45, role: "Driller" },
  { week: "2026-03-02", user: "Craig Tait",  job: "100018", hours: 45, role: "Driller" },
  { week: "2026-03-02", user: "Dave Rudd",   job: "100021", hours: 40, role: "Driller" },
  { week: "2026-03-02", user: "Mike Brown",  job: "200042", hours: 40, role: "Driller" },
  { week: "2026-03-02", user: "Pete Hāpai", job: "200029", hours: 44, role: "Driller" },
  { week: "2026-03-09", user: "Craig Tait",  job: "100018", hours: 45, role: "Driller" },
  { week: "2026-03-09", user: "Dave Rudd",   job: "100021", hours: 40, role: "Driller" },
  { week: "2026-03-09", user: "Mike Brown",  job: "200042", hours: 28, role: "Driller" },
  { week: "2026-03-09", user: "Pete Hāpai", job: "200029", hours: 42, role: "Driller" },
];

// ── Reports Screen ────────────────────────────────────────────────────────
const ReportsScreen = ({ regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
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

  // ── Filtered jobs for date range ─────────────────────────────────────────
  const filteredJobs = useMemo(() => JOBS.filter(j => {
    if (regionFilter !== "all" && j.region !== regionFilter) return false;
    if (!divisionFilter[j.division]) return false;
    if (divFilter !== "all" && j.division !== divFilter) return false;
    if (j.startDate && j.startDate > dateTo) return false;
    if (j.endDate && j.endDate < dateFrom) return false;
    return true;
  }), [divFilter, dateFrom, dateTo, regionFilter, divisionFilter]);

  // ── 1. EXECUTIVE OVERVIEW ────────────────────────────────────────────────
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
          <StatCard label="Pending Estimates" value={`$${(ESTIMATES.filter(e => e.status === "sent").reduce((s,e) => s + calcEstimateTotal(e), 0)/1000).toFixed(0)}k`} sub="Awaiting client decision" />
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
          <ReportCard title="Division Split — Contract Value">
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

  // ── 2. JOB PROFITABILITY ─────────────────────────────────────────────────
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
                        {v > 0 ? `$${v.toLocaleString()}` : <span style={{ color: COLORS.textMuted }}>—</span>}
                      </td>
                    ))}
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: r.grossProfit >= 0 ? COLORS.green : COLORS.red }}>
                      {r.invoiced > 0 ? `$${r.grossProfit.toLocaleString()}` : <span style={{ color: COLORS.textMuted }}>—</span>}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right" }}>
                      {r.margin != null ? (
                        <span style={{ fontSize: 12, fontWeight: 800, color: r.margin >= 30 ? COLORS.green : r.margin >= 15 ? COLORS.amber : COLORS.red }}>{r.margin}%</span>
                      ) : <span style={{ color: COLORS.textMuted, fontSize: 12 }}>—</span>}
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

  // ── 3. RIG UTILISATION ───────────────────────────────────────────────────
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
                    <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 8 }}>{rd.rig.region} · {rd.rig.category}</span>
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
            data={rigData.map(rd => ({ label: rd.rig.name.split(" — ")[0], value: rd.utilPct }))}
            color={(d) => d.value >= 60 ? COLORS.green : d.value >= 30 ? COLORS.amber : COLORS.red}
            height={140}
          />
        </ReportCard>
      </div>
    );
  };

  // ── 4. REVENUE PIPELINE ──────────────────────────────────────────────────
  const PipelineReport = () => {
    const stages = ["draft", "sent", "under_review", "approved", "declined"];
    const stageData = stages.map(s => {
      const ests = ESTIMATES.filter(e => e.status === s);
      return { status: s, count: ests.length, value: ests.reduce((sum, e) => sum + calcEstimateTotal(e), 0) };
    });
    const funnelTotal = stageData.filter(s => s.status !== "declined").reduce((sum, s) => sum + s.value, 0);
    const winRate = ESTIMATES.length > 0
      ? Math.round((ESTIMATES.filter(e => e.status === "approved").length / ESTIMATES.filter(e => e.status !== "draft").length) * 100)
      : 0;

    const funnelColors = { draft: "#94A3B8", sent: COLORS.blue, under_review: "#7C3AED", approved: COLORS.green, declined: COLORS.red };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <StatCard label="Total Estimates" value={ESTIMATES.length} accent={COLORS.blue} />
          <StatCard label="Pipeline Value" value={`$${(funnelTotal/1000).toFixed(1)}k`} sub="excl. declined" accent={COLORS.teal} />
          <StatCard label="Approved Value" value={`$${(stageData.find(s=>s.status==="approved")?.value/1000||0).toFixed(1)}k`} color={COLORS.green} accent={COLORS.green} />
          <StatCard label="Win Rate" value={`${winRate}%`} sub="Approved vs sent" color={winRate >= 50 ? COLORS.green : COLORS.orange} accent={COLORS.amber} />
        </div>

        <ReportCard title="Estimate Funnel — Value by Stage">
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
              {ESTIMATES.map((e, i) => {
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

  // ── 5. AGED DEBTORS ──────────────────────────────────────────────────────
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
      { key: "1-30",    label: "1–30 days", color: COLORS.amber },
      { key: "31-60",   label: "31–60 days", color: COLORS.orange },
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

  // ── 6. TIMESHEET SUMMARY ─────────────────────────────────────────────────
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
                      return <td key={w} style={{ padding: "9px 12px", borderBottom: `1px solid ${COLORS.border}`, textAlign: "right", fontSize: 12, fontFamily: "monospace", color: entry ? COLORS.textPrimary : COLORS.textMuted }}>{entry ? entry.hours : "—"}</td>;
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

  // ── 7. DIVISION P&L ───────────────────────────────────────────────────────
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
      const pipelineValue = ESTIMATES.filter(e => e.division === div && e.status === "sent").reduce((s, e) => s + calcEstimateTotal(e), 0);
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

        <ReportCard title="Division Comparison — Revenue vs Costs vs Profit">
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
                  {[row.water, row.geo, row.isStr ? "—" : row.water + row.geo].map((v, vi) => {
                    const isTotal = vi === 2 && !row.isStr;
                    const total = isTotal ? (typeof row.water === "number" ? row.water + row.geo : "—") : v;
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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// NEW MODULE STUBS — HSE, Personnel, Plant Inspections, Invoicing, Field Reports
// ══════════════════════════════════════════════════════════════════════════════

const HSEScreen = ({ regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Health, Safety & Environment</h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>HSWA 2015 compliance · Site-specific documentation</p>
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
      { job: "200042", client: "Tonkin + Taylor", title: "Ground Investigation — Prestons Road", sssp: "SSSP-2026-003", status: "active", nextReview: "2026-04-01", hazards: ["Ground collapse", "Traffic management", "SPT rebound"], actions: [] },
      { job: "100018", client: "Irrigation NZ Ltd", title: "Bore Installation — Station Road Farm", sssp: "SSSP-2026-002", status: "active", nextReview: "2026-03-20", hazards: ["Rotary drilling", "High pressure air", "Remote location"], actions: ["Update emergency contacts"] },
      { job: "200029", client: "NZTA", title: "Slope Stability — SH73", sssp: "SSSP-2026-001", status: "active", nextReview: "2026-03-25", hazards: ["Traffic — live highway", "Slope instability", "Working at height"], actions: ["Traffic management plan due"] },
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
            <button style={{ padding: "6px 12px", background: COLORS.navyLight, border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, color: COLORS.white, cursor: "pointer" }}>Field Form ↗</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: item.actions.length ? 10 : 0 }}>
          {item.hazards.map(h => (
            <span key={h} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 12, background: "#FEF3C7", color: "#92400E", fontWeight: 600 }}>⚠ {h}</span>
          ))}
          <span style={{ fontSize: 11, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
            <Icon d={icons.calendar} size={11} color={COLORS.textMuted} /> Review due {item.nextReview}
          </span>
        </div>
        {item.actions.length > 0 && (
          <div style={{ padding: "8px 12px", background: COLORS.redLight, borderRadius: 8, border: `1px solid ${COLORS.red}20` }}>
            {item.actions.map(a => <div key={a} style={{ fontSize: 12, color: COLORS.red, fontWeight: 600 }}>→ {a}</div>)}
          </div>
        )}
      </div>
    ))}
    <div style={{ background: COLORS.bg, borderRadius: 12, border: `2px dashed ${COLORS.border}`, padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>Quipcheck form integration coming — accident/incident reports, pre-start checklists, and JSAs will pull live from your Quipcheck account.</div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// LEAVE DATA — pending and approved applications
// ══════════════════════════════════════════════════════════════════════════════
const LEAVE_APPS = [
  { id: "la-1", userId: "u1", staffName: "Craig Tait",  type: "annual",  start: "2026-03-30", end: "2026-04-03", days: 5, status: "pending",  notes: "Pre-approved by email", submittedAt: "2026-03-09" },
  { id: "la-2", userId: "u3", staffName: "Pete Hāpai", type: "annual",  start: "2026-04-14", end: "2026-04-17", days: 4, status: "pending",  notes: "School holidays", submittedAt: "2026-03-07" },
  { id: "la-3", userId: "u2", staffName: "Dave Rudd",   type: "sick",    start: "2026-03-06", end: "2026-03-06", days: 1, status: "approved", notes: "GP cert attached", approvedBy: "Sean Templeton", approvedAt: "2026-03-07" },
  { id: "la-4", userId: "u4", staffName: "Mike Brown",  type: "sick",    start: "2026-03-06", end: "2026-03-06", days: 1, status: "approved", notes: "Self-certified", approvedBy: "Lisa Park", approvedAt: "2026-03-07" },
  { id: "la-5", userId: "u5", staffName: "Sam Ohu",     type: "annual",  start: "2026-04-22", end: "2026-04-24", days: 3, status: "pending",  notes: "Easter travel", submittedAt: "2026-03-10" },
  { id: "la-6", userId: "u1", staffName: "Craig Tait",  type: "annual",  start: "2026-05-05", end: "2026-05-09", days: 5, status: "pending",  notes: "", submittedAt: "2026-03-10" },
];

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

      {/* ── STAFF TAB ── */}
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
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 }}>Region: {s.region} · Reports to: {s.supervisor?.split(" ")[0]}</div>
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
                        ⏳ {ltLabel(a.type)} pending
                      </span>
                    ))}
                    {approvedLeave.map(a => (
                      <span key={a.id} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, color: ltColor(a.type), background: ltColor(a.type) + "20" }}>
                        ✓ {ltLabel(a.type)} {a.start}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── LEAVE CALENDAR TAB ── */}
      {tab === "leave" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Pending approvals */}
          {leaveApps.filter(a => a.status === "pending").length > 0 && (
            <div style={{ background: COLORS.white, borderRadius: 12, border: `2px solid ${COLORS.blue}30`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "12px 18px", background: "#F0F6FF", borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700, fontSize: 13, color: COLORS.blue }}>
                Pending Leave Requests — Awaiting Approval
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
                        {app.start === app.end ? app.start : `${app.start} – ${app.end}`}
                        {app.notes && <span style={{ color: COLORS.textMuted }}> · {app.notes}</span>}
                      </div>
                      {/* Conflict warning */}
                      {conflicts.length > 0 && (
                        <div style={{ marginTop: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {conflicts.map((c, ci) => (
                            <span key={ci} style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 8, color: COLORS.red, background: COLORS.redLight, display: "flex", alignItems: "center", gap: 4 }}>
                              ⚠ Assigned to {c.jobId} ({c.start}–{c.end})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleApprove(app)}
                        style={{ padding: "7px 16px", background: conflicts.length > 0 ? COLORS.orange : COLORS.greenLight, border: `1px solid ${conflicts.length > 0 ? COLORS.orange : COLORS.green}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: conflicts.length > 0 ? COLORS.white : COLORS.green, cursor: "pointer" }}>
                        {conflicts.length > 0 ? "⚠ Approve Anyway" : "✓ Approve"}
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
                style={{ width: 32, height: 32, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 7, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
              <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, minWidth: 160, textAlign: "center" }}>
                {calMonth.toLocaleDateString("en-NZ", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => setCalMonth(new Date(calYear, calMon + 1, 1))}
                style={{ width: 32, height: 32, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 7, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
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
                        <div key={a.id} title={`${a.staffName} — ${lt?.label}`}
                          style={{ fontSize: 10, fontWeight: 700, color: COLORS.white, background: lt?.color || COLORS.textMuted, opacity: isPending ? 0.6 : 1, borderRadius: 4, padding: "2px 5px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "default",
                            border: isPending ? `1px dashed ${COLORS.white}` : "none" }}>
                          {staff?.initials} {isPending ? "⏳" : ""}
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
              All Leave — {calMonth.toLocaleDateString("en-NZ", { month: "long", year: "numeric" })}
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
                  <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{a.start === a.end ? a.start : `${a.start} – ${a.end}`} · {a.days}d</span>
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
                    <div style={{ fontSize: 11, color: "#7F1D1D" }}>{c.start} – {c.end}</div>
                  </div>
                );
              })}
              <div style={{ fontSize: 11, color: "#7F1D1D", marginTop: 4, paddingTop: 8, borderTop: "1px solid rgba(239,68,68,0.2)" }}>
                ⚠ Approving this leave without reassigning personnel may leave these jobs understaffed. Consider updating the Planner.
              </div>
            </div>

            {/* Leave summary */}
            <div style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: COLORS.textSecondary }}>
              Leave: <strong style={{ color: COLORS.textPrimary }}>{conflictModal.app.staffName}</strong> · {ltLabel(conflictModal.app.type)} · {conflictModal.app.start} – {conflictModal.app.end}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConflictModal(null)}
                style={{ flex: 1, padding: "12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>
                Cancel — Revisit Later
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

const PlantInspectionsScreen = () => {
  const INSPECTIONS = [
    { id: "ins-1", eqId: "eq5", date: "2026-03-05", tech: "Craig Tait", faults: ["Mast cylinder leaking — oil loss", "Left outrigger pad worn"], status: "open", priority: "high" },
    { id: "ins-2", eqId: "eq1", date: "2026-03-08", tech: "Dave Rudd", faults: ["Minor hydraulic fitting seep — monitored"], status: "open", priority: "low" },
    { id: "ins-3", eqId: "eq2", date: "2026-03-09", tech: "Tony Walsh", faults: [], status: "pass", priority: null },
    { id: "ins-4", eqId: "eq3", date: "2026-03-09", tech: "Mike Brown", faults: [], status: "pass", priority: null },
    { id: "ins-5", eqId: "eq4", date: "2026-03-07", tech: "Pete Hāpai", faults: ["Drill rod thread wear — 2 rods flagged"], status: "open", priority: "medium" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Plant Inspections</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Pre-start checks, faults & maintenance tracking</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Icon d={icons.plus} size={14} color={COLORS.navy} /> New Inspection
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Inspections This Week", value: INSPECTIONS.length, color: COLORS.teal },
          { label: "Open Faults", value: INSPECTIONS.filter(i => i.status === "open").length, color: COLORS.red },
          { label: "High Priority", value: INSPECTIONS.filter(i => i.priority === "high").length, color: COLORS.orange },
          { label: "All Clear", value: INSPECTIONS.filter(i => i.status === "pass").length, color: COLORS.green },
        ].map(k => (
          <div key={k.label} style={{ background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "14px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, marginTop: 6 }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {INSPECTIONS.map(ins => {
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
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, color: hasFaults ? COLORS.red : COLORS.green, background: hasFaults ? COLORS.redLight : COLORS.greenLight }}>{hasFaults ? `${ins.faults.length} fault${ins.faults.length > 1 ? "s" : ""}` : "✓ Pass"}</span>
                </div>
              </div>
              {hasFaults && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                  {ins.faults.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: COLORS.redLight, borderRadius: 7, fontSize: 12, color: "#7F1D1D" }}>
                      <span>⚠</span> {f}
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button style={{ padding: "6px 14px", background: COLORS.navyLight, border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, color: COLORS.white, cursor: "pointer" }}>Assign to Workshop</button>
                    <button style={{ padding: "6px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, cursor: "pointer" }}>Mark Resolved</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InvoicingScreen = ({ regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Invoicing</h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Progress claims · Field data linked · Client portal</p>
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
        <span style={{ fontSize: 12, color: COLORS.blue, fontWeight: 600, cursor: "pointer" }}>Client Portal →</span>
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
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>Progress claim builder (estimate line items × field days), field reports link, and client portal coming next.</div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// APP — Collapsible sidebar, North/South + Division filters, new hierarchy
// ══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [estimateList, setEstimateList] = useState(ESTIMATES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [regionFilter, setRegionFilter] = useState("all"); // "all" | "North" | "South"
  const [divisionFilter, setDivisionFilter] = useState({ Water: true, Geotech: true });
  const [resourcesSubTab, setResourcesSubTab] = useState("plant"); // plant | inspections | personnel

  const navigate = (target, data = null) => {
    if (target === "jobdetail") { setSelectedJob(data); setScreen("jobdetail"); }
    else if (target === "clientdetail") { setSelectedClient(data); setScreen("clientdetail"); }
    else if (target === "estimatedetail") { setSelectedEstimate(data); setScreen("estimatedetail"); }
    else { setScreen(target); setSelectedJob(null); setSelectedClient(null); setSelectedEstimate(null); }
  };

  const handleSaveEstimate = (formData) => {
    const nextNum = String(Math.max(...estimateList.map(e => parseInt(e.id.split("-")[2]))) + 1).padStart(4, "0");
    const newEst = {
      id: `EST-2026-${nextNum}`, ref: String(23560 + estimateList.length - 2), revision: 1,
      client: formData.client || "Unnamed Client",
      clientCode: (formData.client || "UNK").slice(0, 3).toUpperCase(),
      contact: formData.contact || "", contactMobile: formData.contactMobile || "",
      division: formData.division, region: formData.region,
      title: formData.title || "Untitled Estimate",
      siteAddress: formData.siteAddress || "", status: "draft",
      date: formData.date, validUntil: formData.validUntil,
      preparedBy: "Sean Templeton", scope: formData.scope || "",
      sections: formData.sections.map(s => ({
        title: s.title,
        items: s.items.map(it => ({ description: it.description, qty: it.qty === "" ? null : parseFloat(it.qty), rate: parseFloat(it.rate) || 0, unit: it.unit })),
      })),
      notes: formData.notes,
    };
    setEstimateList(prev => [newEst, ...prev]);
    setSelectedEstimate(newEst);
    setScreen("estimatedetail");
  };

  // Sidebar navigation structure
  const navStructure = [
    { id: "dashboard", label: "Dashboard", icon: icons.dashboard },
    {
      id: "jobs", label: "Jobs", icon: icons.jobs,
      children: [
        { id: "estimates", label: "Estimates", icon: icons.estimates },
        { id: "invoicing", label: "Invoicing", icon: icons.finance },
      ]
    },
    { id: "planner", label: "Planner", icon: icons.calendar },
    { id: "clients", label: "Clients", icon: icons.clients },
    { id: "suppliers", label: "Suppliers", icon: icons.clients },
    {
      id: "resources", label: "Resources", icon: icons.settings,
      children: [
        { id: "resources_plant", label: "Plant", icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
        { id: "resources_personnel", label: "Personnel", icon: icons.user },
      ]
    },
    { id: "timesheets", label: "Timesheets", icon: icons.time },
    { id: "hse", label: "HSE", icon: icons.alert },
    { id: "reports", label: "Reports", icon: icons.reports },
  ];

  const activeSection = (id) => {
    if (screen === "jobdetail" || screen === "newjob" || screen === "newestimate" || screen === "estimatedetail") return id === "jobs" ? true : false;
    if (screen === "clientdetail") return id === "clients";
    if (screen === "resources_plant" || screen === "resources_personnel") return id === "resources";
    return screen === id;
  };

  const SB = sidebarCollapsed;
  const sidebarW = SB ? 56 : 220;

  const NavItem = ({ item, depth = 0 }) => {
    const isActive = activeSection(item.id);
    const isSubActive = screen === item.id
      || (item.id === "resources_plant"     && screen === "resources" && resourcesSubTab === "plant")
      || (item.id === "resources_personnel" && screen === "resources" && resourcesSubTab === "personnel");
    const isChild = depth > 0;
    return (
      <>
        <button
          onClick={() => {
            if (item.id === "resources_plant") { navigate("resources"); setResourcesSubTab("plant"); }
            else if (item.id === "resources_personnel") { navigate("resources"); setResourcesSubTab("personnel"); }
            else navigate(item.id);
          }}
          title={SB ? item.label : undefined}
          style={{
            display: "flex", alignItems: "center", gap: SB ? 0 : 9,
            padding: SB ? "10px 0" : isChild ? "7px 12px 7px 28px" : "9px 12px",
            marginLeft: SB ? 0 : 0,
            borderRadius: 8, border: "none", cursor: "pointer", width: "100%",
            justifyContent: SB ? "center" : "flex-start",
            background: isSubActive ? COLORS.amber + "25" : isChild && isActive ? COLORS.amber + "12" : "transparent",
            color: isSubActive ? COLORS.amber : isChild && isActive ? COLORS.amber + "cc" : "#94A3B8",
            fontWeight: isSubActive ? 700 : 500, fontSize: isChild ? 12 : 13,
            textAlign: "left", transition: "all 0.12s",
            borderLeft: !SB ? (isSubActive ? `3px solid ${COLORS.amber}` : isChild && isActive ? `3px solid ${COLORS.amber}60` : "3px solid transparent") : "none",
          }}>
          <Icon d={item.icon} size={isChild ? 13 : 16} color={isSubActive ? COLORS.amber : isChild && isActive ? COLORS.amber + "cc" : "#64748B"} style={{ flexShrink: 0 }} />
          {!SB && <span>{item.label}</span>}
        </button>
        {!SB && item.children?.map(child => (
          <NavItem key={child.id} item={child} depth={depth + 1} />
        ))}
      </>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: COLORS.bg, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Barlow+Condensed:wght@700;800&display=swap" rel="stylesheet" />

      {/* ── Sidebar ── */}
      <div style={{ width: sidebarW, background: COLORS.navy, display: "flex", flexDirection: "column", flexShrink: 0, borderRight: `1px solid ${COLORS.navyBorder}`, transition: "width 0.2s ease", overflow: "hidden" }}>

        {/* Logo — click to collapse */}
        <div onClick={() => setSidebarCollapsed(c => !c)}
          style={{ padding: SB ? "18px 0" : "18px 16px 14px", borderBottom: `1px solid ${COLORS.navyBorder}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: SB ? "center" : "flex-start", gap: 10, userSelect: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: COLORS.navyLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(255,255,255,0.12)" }}>
            <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
              <polyline points="9,11 24,20 39,11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.2"/>
              <polyline points="9,20 24,29 39,20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
              <polyline points="9,29 24,38 39,29" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85"/>
              <rect x="22.5" y="5" width="3" height="24" rx="1.5" fill="#F59E0B"/>
              <polygon points="24,42 20,29 28,29" fill="#F59E0B"/>
              <rect x="20" y="4" width="8" height="3" rx="1.5" fill="#F59E0B" opacity="0.5"/>
            </svg>
          </div>
          {!SB && (
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 800, color: COLORS.white, letterSpacing: "0.02em", textTransform: "uppercase", lineHeight: 1 }}>
                <span style={{ color: COLORS.amber }}>Sub</span>Strata
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 3 }}>Field Operations</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
          {navStructure.map(item => <NavItem key={item.id} item={item} />)}
        </nav>

        {/* North / South filter */}
        <div style={{ padding: SB ? "10px 4px" : "10px 12px", borderTop: `1px solid ${COLORS.navyBorder}` }}>
          {!SB && <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Region</div>}
          <div style={{ display: "flex", flexDirection: SB ? "column" : "row", gap: 4 }}>
            {[{ id: "all", label: "All", short: "A" }, { id: "North", label: "North", short: "N" }, { id: "South", label: "South", short: "S" }].map(r => (
              <button key={r.id} onClick={() => setRegionFilter(r.id)}
                style={{ flex: SB ? "none" : 1, padding: SB ? "6px 4px" : "5px 4px", borderRadius: 6, border: `1px solid ${regionFilter === r.id ? COLORS.amber : "transparent"}`,
                  background: regionFilter === r.id ? COLORS.amber + "20" : "transparent", cursor: "pointer",
                  fontSize: SB ? 9 : 11, fontWeight: 700, color: regionFilter === r.id ? COLORS.amber : "#475569",
                  textAlign: "center" }}>
                {SB ? r.short : r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Division filters */}
        <div style={{ padding: SB ? "8px 4px" : "8px 12px", borderTop: `1px solid ${COLORS.navyBorder}` }}>
          {!SB && <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Divisions</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[{ id: "Water", color: COLORS.blue, short: "W" }, { id: "Geotech", color: COLORS.teal, short: "G" }].map(div => {
              const on = divisionFilter[div.id];
              return (
                <button key={div.id} onClick={() => setDivisionFilter(f => ({ ...f, [div.id]: !f[div.id] }))}
                  style={{ display: "flex", alignItems: "center", gap: SB ? 0 : 8, padding: SB ? "5px 0" : "5px 8px",
                    justifyContent: SB ? "center" : "flex-start",
                    borderRadius: 6, border: "none", background: on ? div.color + "18" : "transparent", cursor: "pointer" }}>
                  <div style={{ width: SB ? 10 : 8, height: SB ? 10 : 8, borderRadius: "50%", background: on ? div.color : "#334155", flexShrink: 0 }} />
                  {!SB && <span style={{ fontSize: 12, color: on ? div.color : "#475569", fontWeight: on ? 700 : 500 }}>{div.id}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* User */}
        <div style={{ padding: SB ? "10px 0" : "10px 12px", borderTop: `1px solid ${COLORS.navyBorder}`, display: "flex", alignItems: "center", gap: 10, justifyContent: SB ? "center" : "flex-start" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.amber + "30", border: `2px solid ${COLORS.amber}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.amber }}>ST</span>
          </div>
          {!SB && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sean Templeton</div>
              <div style={{ fontSize: 10, color: "#64748B" }}>Lead Geotech · South</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 52, background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0 }}>
          <div style={{ position: "relative", flex: "0 0 280px" }}>
            <Icon d={icons.search} size={14} color={COLORS.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input placeholder="Search jobs, clients, invoices..." style={{ width: "100%", padding: "7px 12px 7px 32px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg, color: COLORS.textPrimary, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Active filters display */}
            {regionFilter !== "all" && (
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: COLORS.amber + "20", border: `1px solid ${COLORS.amber}40`, color: COLORS.amber, fontWeight: 700 }}>{regionFilter}</span>
            )}
            {Object.entries(divisionFilter).filter(([,v]) => v).map(([k]) => (
              <span key={k} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: k === "Water" ? COLORS.blueLight : COLORS.tealLight, border: `1px solid ${k === "Water" ? COLORS.blue : COLORS.teal}40`, color: k === "Water" ? COLORS.blue : COLORS.teal, fontWeight: 700 }}>{k}</span>
            ))}
          </div>
          <button style={{ width: 34, height: 34, borderRadius: 8, background: COLORS.bg, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
            <Icon d={icons.bell} size={16} color={COLORS.textSecondary} />
            <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: COLORS.red, border: `2px solid ${COLORS.white}` }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {screen === "dashboard"         && <DashboardScreen onNavigate={navigate} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "jobs"              && <JobsScreen onNavigate={navigate} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "jobdetail"         && selectedJob && <JobDetailScreen job={selectedJob} onBack={() => navigate("jobs")} />}
          {screen === "timesheets"        && <TimesheetsScreen regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "invoicing"         && <InvoicingScreen regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "finance"           && <InvoicingScreen regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "newjob"            && <NewJobScreen onBack={() => navigate("jobs")} />}
          {screen === "clients"           && <ClientsScreen onNavigate={navigate} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "clientdetail"      && selectedClient && <ClientDetailScreen client={selectedClient} onBack={() => navigate("clients")} onNavigate={navigate} />}
          {screen === "estimates"         && <EstimatesScreen onNavigate={navigate} estimates={estimateList} />}
          {screen === "estimatedetail"    && selectedEstimate && <EstimateDetailScreen estimate={selectedEstimate} onBack={() => navigate("estimates")} onNavigate={navigate} />}
          {screen === "newestimate"       && <NewEstimateScreen onBack={() => navigate("estimates")} onSave={handleSaveEstimate} />}
          {screen === "suppliers"         && <SuppliersScreen onNavigate={navigate} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "resources"         && <ResourcesScreen subTab={resourcesSubTab} setSubTab={setResourcesSubTab} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "planner"           && <PlannerScreen regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "reports"           && <ReportsScreen regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "hse"               && <HSEScreen regionFilter={regionFilter} divisionFilter={divisionFilter} />}
        </div>
      </div>
    </div>
  );
}