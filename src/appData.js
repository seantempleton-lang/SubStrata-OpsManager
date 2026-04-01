// Shared seed data and pure helpers extracted from App.jsx for easier maintenance.

export const COLORS = {
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

export const statusConfig = {
  enquiry:   { label: "Enquiry",   color: "#6366F1", bg: "#EEF2FF" },
  quoted:    { label: "Quoted",    color: "#F59E0B", bg: "#FEF3C7" },
  approved:  { label: "Approved",  color: "#3B82F6", bg: "#DBEAFE" },
  active:    { label: "Active",    color: "#10B981", bg: "#D1FAE5" },
  on_hold:   { label: "On Hold",   color: "#F97316", bg: "#FFEDD5" },
  complete:  { label: "Complete",  color: "#64748B", bg: "#F1F5F9" },
  cancelled: { label: "Cancelled", color: "#EF4444", bg: "#FEE2E2" },
};

export const JOBS = [
  { id: "100018", title: "Bore Installation â€” Station Road Farm", client: "Irrigation NZ Ltd", clientCode: "INZ", division: "Water", region: "South", status: "active", manager: "Sean Templeton", supervisor: "Craig Tait", contractValue: 42500, invoiced: 21250, startDate: "2026-02-10", endDate: "2026-03-20", type: "water_bore", hoursLogged: 184, site: "Station Road, Leeston" },
  { id: "200042", title: "Ground Investigation â€” Prestons Road", client: "Tonkin + Taylor", clientCode: "TNT", division: "Geotech", region: "South", status: "active", manager: "Lisa Park", supervisor: "Mike Brown", contractValue: 68000, invoiced: 0, startDate: "2026-03-01", endDate: "2026-04-15", type: "geotechnical", hoursLogged: 96, site: "Prestons Road, Christchurch" },
  { id: "100015", title: "Monitoring Bore Network â€” Selwyn District", client: "Selwyn District Council", clientCode: "SDC", division: "Water", region: "South", status: "complete", manager: "Sean Templeton", supervisor: "Craig Tait", contractValue: 115000, invoiced: 115000, startDate: "2025-11-01", endDate: "2026-02-28", type: "monitoring_bore", hoursLogged: 620, site: "Multiple, Selwyn District" },
  { id: "200038", title: "CPT Testing â€” Lincoln University Campus", client: "Lincoln University", clientCode: "LU", division: "Geotech", region: "South", status: "quoted", manager: "Lisa Park", supervisor: null, contractValue: 24000, invoiced: 0, startDate: null, endDate: null, type: "cpt_testing", hoursLogged: 0, site: "Lincoln University, Lincoln" },
  { id: "100021", title: "Irrigation Bore â€” Rakaia Gorge", client: "High Country Farms", clientCode: "HCF", division: "Water", region: "South", status: "approved", manager: "Sean Templeton", supervisor: "Dave Rudd", contractValue: 55000, invoiced: 0, startDate: "2026-03-15", endDate: "2026-05-01", type: "water_bore", hoursLogged: 0, site: "Rakaia Gorge Road, Canterbury" },
  { id: "200029", title: "Slope Stability Investigation â€” State Highway 73", client: "NZTA", clientCode: "NZTA", division: "Geotech", region: "North", status: "active", manager: "Kevin Lam", supervisor: "Pete HÄpai", contractValue: 132000, invoiced: 44000, startDate: "2026-01-20", endDate: "2026-04-30", type: "geotechnical", hoursLogged: 410, site: "SH73, West Auckland" },
  { id: "100009", title: "Rural Water Supply â€” Waipara Valley", client: "North Canterbury Vineyards", clientCode: "NCV", division: "Water", region: "South", status: "on_hold", manager: "Sean Templeton", supervisor: "Craig Tait", contractValue: 38000, invoiced: 9500, startDate: "2026-01-15", endDate: null, type: "water_bore", hoursLogged: 88, site: "Waipara Valley, North Canterbury" },
  { id: "200044", title: "Contamination Assessment â€” Industrial Site", client: "Aurora Energy", clientCode: "AE", division: "Geotech", region: "North", status: "enquiry", manager: null, supervisor: null, contractValue: null, invoiced: 0, startDate: null, endDate: null, type: "environmental", hoursLogged: 0, site: "East Tamaki, Auckland" },
];

// â”€â”€ Timesheet Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const STAFF = [
  { id: "u1", name: "Craig Tait",  initials: "CT", role: "Driller",              supervisor: "Sean Templeton", division: "Water",   region: "South" },
  { id: "u2", name: "Dave Rudd",   initials: "DR", role: "Driller",              supervisor: "Sean Templeton", division: "Water",   region: "South" },
  { id: "u3", name: "Pete HÄpai", initials: "PH", role: "Driller",              supervisor: "Kevin Lam",      division: "Geotech", region: "North" },
  { id: "u4", name: "Mike Brown",  initials: "MB", role: "Geotech Field Tech",   supervisor: "Lisa Park",      division: "Geotech", region: "South" },
  { id: "u5", name: "Sam Ohu",     initials: "SO", role: "Driller's Assistant",  supervisor: "Lisa Park",      division: "Geotech", region: "South" },
  { id: "u6", name: "Tony Walsh",  initials: "TW", role: "Driller's Assistant",  supervisor: "Sean Templeton", division: "Water",   region: "South" },
];

// Rate types
export const RATE_TYPES = [
  { id: "ordinary",  label: "Ordinary",        multiplier: 1.0, color: "#3B82F6" },
  { id: "time_half", label: "Time & a Half",    multiplier: 1.5, color: "#F59E0B" },
  { id: "double",    label: "Double Time",      multiplier: 2.0, color: "#EF4444" },
  { id: "day_off",   label: "Day in Lieu",      multiplier: 0.0, color: "#6366F1" },
];

// Leave types
export const LEAVE_TYPES = [
  { id: "annual",    label: "Annual Leave",     color: "#10B981" },
  { id: "sick",      label: "Sick Leave",       color: "#EF4444" },
  { id: "unpaid",    label: "Unpaid Leave",     color: "#94A3B8" },
  { id: "other",     label: "Other Leave",      color: "#7C3AED" },
  { id: "public",    label: "Public Holiday",   color: "#F97316" },
];

// Expense types
export const EXPENSE_TYPES = [
  { id: "tools",        label: "Tools / Consumables", icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
  { id: "receipt",      label: "Other Receipt",       icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" },
];

// Full rich timesheet data â€” week of 3â€“9 Mar 2026
export const TIMESHEETS = [
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
          { jobId: "100018", hours: 9, rateType: "ordinary",  notes: "Drilling 30â€“42m depth", crewWith: ["Tony Walsh"] },
        ]},
      { date: "2026-03-07", dayType: "work", overnight: true, entries: [
          { jobId: "100018", hours: 10, rateType: "ordinary",  notes: "Overnight â€” remote site", crewWith: ["Tony Walsh"] },
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
          { jobId: "100021", hours: 8, rateType: "time_half",  notes: "Call-out â€” urgent rig issue", crewWith: [] },
        ]},
      { date: "2026-03-04", dayType: "off",   entries: [] },
      { date: "2026-03-03", dayType: "off",   entries: [] },
    ],
    expenses: [],
    totalHours: 40, totalOvernights: 0,
  },
  {
    id: "ts-003", userId: "u3", user: "Pete HÄpai", weekStart: "2026-03-09",
    status: "manager_approved", supervisorApprovedBy: "Kevin Lam", supervisorApprovedAt: "2026-03-10",
    managerApprovedBy: "Kevin Lam", managerApprovedAt: "2026-03-11",
    submittedAt: "2026-03-09 16:00",
    days: [
      { date: "2026-03-09", dayType: "work", overnight: false, entries: [
          { jobId: "200029", hours: 9, rateType: "ordinary",  notes: "CPT testing SH73 Site C", crewWith: ["James TÅ«hoe"] },
        ]},
      { date: "2026-03-08", dayType: "work", overnight: false, entries: [
          { jobId: "200029", hours: 9, rateType: "ordinary",  notes: "", crewWith: ["James TÅ«hoe"] },
        ]},
      { date: "2026-03-07", dayType: "work", overnight: true, entries: [
          { jobId: "200029", hours: 9, rateType: "ordinary",  notes: "Overnight Auckland", crewWith: ["James TÅ«hoe"] },
        ]},
      { date: "2026-03-06", dayType: "work", overnight: true, entries: [
          { jobId: "200029", hours: 9, rateType: "ordinary",  notes: "Overnight Auckland", crewWith: ["James TÅ«hoe"] },
        ]},
      { date: "2026-03-05", dayType: "work", overnight: false, entries: [
          { jobId: "200029", hours: 6, rateType: "ordinary",  notes: "Travel day back to Chch", crewWith: [] },
        ]},
      { date: "2026-03-04", dayType: "off",   entries: [] },
      { date: "2026-03-03", dayType: "off",   entries: [] },
    ],
    expenses: [
      { id: "exp-2", type: "receipt", description: "Accommodation â€” Auckland 2 nights", amount: 310.00, receipt: true },
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
          { jobId: "200042", hours: 6, rateType: "ordinary",  notes: "Left early â€” unwell", crewWith: ["Sam Ohu"] },
          { jobId: "200042", hours: 2, rateType: "ordinary",  notes: "Report write-up from home", crewWith: [] },
        ]},
      { date: "2026-03-06", dayType: "leave", leaveType: "sick", notes: "Sick â€” GP cert attached", entries: [] },
      { date: "2026-03-05", dayType: "work", overnight: false, entries: [
          { jobId: "200042", hours: 4, rateType: "ordinary",  notes: "Half day â€” back from sick", crewWith: ["Sam Ohu"] },
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

export const entryHours = (e) => {
  if (e.startTime && e.endTime) {
    const [sh, sm] = e.startTime.split(":").map(Number);
    const [eh, em] = e.endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? Math.round(diff / 60 * 10) / 10 : 0;
  }
  return e.hours || 0;
};
export const calcTsHours = (ts) => ts.days.reduce((s, d) => s + d.entries.reduce((ds, e) => ds + entryHours(e), 0), 0);
export const calcTsOvernights = (ts) => ts.days.filter(d => d.overnight).length;

export const INVOICES = [
  { id: "INV-2026-0031", job: "100018", client: "Irrigation NZ Ltd", amount: 21250, status: "sent", dueDate: "2026-03-25", issueDate: "2026-02-24" },
  { id: "INV-2026-0028", job: "200029", client: "NZTA", amount: 44000, status: "overdue", dueDate: "2026-03-01", issueDate: "2026-01-31" },
  { id: "INV-2026-0025", job: "100009", client: "North Canterbury Vineyards", amount: 9500, status: "paid", dueDate: "2026-02-28", issueDate: "2026-01-29" },
  { id: "INV-2026-0022", job: "100015", client: "Selwyn District Council", amount: 57500, status: "paid", dueDate: "2026-02-15", issueDate: "2026-01-16" },
];


export const icons = {
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

export const fmt = (n) => n != null ? `$${n.toLocaleString("en-NZ")}` : "â€”";
export const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;

export const TS_STATUS_CFG = {
  draft:              { label: "Draft",               color: "#94A3B8", bg: "#F1F5F9",  step: 0 },
  submitted:          { label: "Submitted",           color: "#3B82F6", bg: "#DBEAFE",  step: 1 },
  supervisor_approved:{ label: "Sup. Approved",       color: "#F59E0B", bg: "#FEF3C7",  step: 2 },
  manager_approved:   { label: "Approved",            color: "#10B981", bg: "#D1FAE5",  step: 3 },
  rejected:           { label: "Rejected",            color: "#EF4444", bg: "#FEE2E2",  step: 0 },
};

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const WEEK_DAYS_FROM_MONDAY = (weekStart) => {
  const monday = new Date(weekStart);
  // weekStart is the Sunday â€” adjust to Monday
  const d = new Date(monday);
  d.setDate(d.getDate() - 6); // weekStart="2026-03-09" is Mon (Mon 9 Mar)
  // Actually our weekStart IS Monday based on data â€” just generate 7 days
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() - (6 - i)); // Mon=0 ... Sun=6
    return day.toISOString().slice(0, 10);
  });
};

export const fmtDay = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
};

export const fmtDayShort = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric" });
};


export const CLIENTS = [
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
      { id: "a1", type: "call", subject: "Progress update â€” Job 100018", date: "2026-03-08", author: "Sean Templeton", notes: "Spoke with Brendon re: bore depth progress. On track for completion by 20 March. He requested a draft completion certificate be sent ahead of final inspection." },
      { id: "a2", type: "email", subject: "Invoice INV-2026-0031 sent", date: "2026-02-24", author: "Sean Templeton", notes: "Invoice for first progress claim emailed to accounts@irrigationnz.co.nz. Brendon CC'd." },
      { id: "a3", type: "meeting", subject: "Site visit â€” Station Road Farm", date: "2026-02-10", author: "Sean Templeton", notes: "Pre-mobilisation site meeting with Brendon and site owner. Access confirmed, rig location agreed, health & safety briefing completed." },
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
      { id: "a4", type: "meeting", subject: "Annual contract review", date: "2026-02-01", author: "Sean Templeton", notes: "Met with Rachel and Grant to review 2025 programme. Council happy with quality of work. Discussed 2026 monitoring bore expansion â€” likely 4â€“6 new bores across Rolleston growth area. Follow up with proposal by end of February." },
      { id: "a5", type: "email", subject: "Final completion docs â€” Job 100015", date: "2026-03-02", author: "Sean Templeton", notes: "Sent final bore completion certificates and drilling logs for all 8 bores. Rachel confirmed receipt." },
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
      { id: "a6", type: "call", subject: "Mobilisation confirmed â€” Job 200042", date: "2026-02-27", author: "Lisa Park", notes: "Confirmed rig mobilisation for 1 March. James will be on site for first two days. Borehole locations sent through â€” 6 BH to 15m, 2 BH to 25m." },
    ],
  },
  {
    id: "c4", code: "NZTA", name: "NZTA", industry: "Government / Infrastructure", region: "National",
    phone: "0800 699 000", email: "procurement@nzta.govt.nz", website: "nzta.govt.nz",
    billingAddress: "50 Victoria Street, Wellington 6011", paymentTerms: 20, creditLimit: 1000000,
    isActive: true, since: "2021-01-20",
    contacts: [
      { id: "co6", name: "Kevin Lam", title: "Mr", role: "Project Manager â€” Infrastructure", email: "k.lam@nzta.govt.nz", phone: "09 444 7200", mobile: "021 765 002", isPrimary: true },
      { id: "co7", name: "Aroha Ngata", title: "Ms", role: "Contracts Administrator", email: "a.ngata@nzta.govt.nz", phone: "09 444 7201", mobile: null, isPrimary: false },
    ],
    activities: [
      { id: "a7", type: "call", subject: "Overdue invoice follow-up â€” INV-2026-0028", date: "2026-03-10", author: "Sean Templeton", notes: "Called Aroha re: overdue invoice. Payment delayed due to internal purchase order issue on their end. She expects it resolved within the week. Will email remittance advice." },
      { id: "a8", type: "meeting", subject: "Contract award â€” SH73 slope investigation", date: "2026-01-10", author: "Kevin Lam", notes: "Contract awarded following competitive tender. Scope: geotechnical investigation of 3 slope failure sites along SH73 west of Auckland. Mobilisation late January." },
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
      { id: "a10", type: "call", subject: "Job 100009 on-hold discussion", date: "2026-02-20", author: "Sean Templeton", notes: "Camille requested we pause drilling pending resource consent decision from ECan. Expect resolution in 4â€“6 weeks. Job status set to On Hold." },
    ],
  },
];


export const ESTIMATES = [
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
          { description: "Day rate CPTu sounding - Pagani TG63-150 or TG73-200 (unlimited metreage including DPSH/DPT, minimum charge Â½ day)", qty: 1, rate: 3550.00, unit: "day" },
          { description: "Expendable push in plug/tip for grouting - if required", qty: null, rate: 72.00, unit: "ea" },
          { description: "Cement powder for grout (min Â½ bag/location) - if required", qty: null, rate: 42.50, unit: "bag" },
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
          { description: "Weighted drill muds for drilling in artesian conditions, per mÂ³, includes mixing and delivery to site - if required", qty: null, rate: 845.00, unit: "mÂ³" },
          { description: "Cement/Concrete (min Â½ bag/location)", qty: 3, rate: 42.50, unit: "bag" },
          { description: "Bentonite (min Â½ bag/location)", qty: 0.5, rate: 47.50, unit: "bag" },
          { description: "Cement powder for grout (min Â½ bag/location)", qty: 4, rate: 42.50, unit: "bag" },
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
    title: "Monitoring Bore Installation â€” Rolleston Growth Area", siteAddress: "Selwyn District, Multiple Locations",
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
          { description: "Pea gravel pack", qty: 2, rate: 285.00, unit: "mÂ³" },
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
    title: "CPT Testing â€” Lincoln University Campus", siteAddress: "Lincoln University, Lincoln",
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
          { description: "Day rate CPTu sounding - Pagani TG63-150 (unlimited metreage, min Â½ day charge)", qty: 1, rate: 3550.00, unit: "day" },
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

export const calcSectionTotal = (section) =>
  section.items.reduce((s, item) => s + (item.qty ? item.qty * item.rate : 0), 0);

export const calcEstimateTotal = (est) =>
  est.sections.reduce((s, sec) => s + calcSectionTotal(sec), 0);

export const fmtRate = (n) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
export const fmtCost = (n) => n > 0 ? `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : "â€”";

export const estimateStatusConfig = {
  draft:       { label: "Draft",       color: "#64748B", bg: "#F1F5F9" },
  sent:        { label: "Sent",        color: "#3B82F6", bg: "#DBEAFE" },
  under_review:{ label: "Under Review",color: "#7C3AED", bg: "#EDE9FE" },
  approved:    { label: "Approved",    color: "#10B981", bg: "#D1FAE5" },
  declined:    { label: "Declined",    color: "#EF4444", bg: "#FEE2E2" },
  superseded:  { label: "Superseded", color: "#94A3B8", bg: "#F8FAFC" },
};


export const SECTION_TEMPLATES = {
  Geotech: [
    { title: "Preliminaries", items: [
      { description: "Mobilisation/Demobilisation/Health & Safety/Daily Travel - Christchurch area", qty: "", rate: "295.00", unit: "ea" },
      { description: "Health and safety additional - (inductions, SSSP, extra PPE, etc)", qty: "", rate: "225.00", unit: "ls" },
      { description: "Standby (hourly, manned)", qty: "", rate: "255.00", unit: "hr" },
    ]},
    { title: "Cone Penetration Testing (CPTu)", items: [
      { description: "Day rate CPTu sounding - Pagani TG63-150 or TG73-200 (unlimited metreage, minimum charge Â½ day)", qty: "", rate: "3550.00", unit: "day" },
      { description: "Expendable push in plug/tip for grouting - if required", qty: "", rate: "72.00", unit: "ea" },
      { description: "Cement powder for grout (min Â½ bag/location) - if required", qty: "", rate: "42.50", unit: "bag" },
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
      { description: "Cement/Concrete (min Â½ bag/location)", qty: "", rate: "42.50", unit: "bag" },
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
      { description: "Pea gravel pack", qty: "", rate: "285.00", unit: "mÂ³" },
      { description: "Bentonite seal", qty: "", rate: "47.50", unit: "bag" },
    ]},
    { title: "Miscellaneous", items: [
      { description: "Bore development - submersible pump", qty: "", rate: "185.00", unit: "hr" },
      { description: "Decontaminate equipment/tidy/reinstate site", qty: "", rate: "133.00", unit: "hr" },
      { description: "Bore completion report (per bore)", qty: "", rate: "385.00", unit: "ea" },
    ]},
  ],
};

export const DEFAULT_NOTES = [
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

export const UNIT_OPTIONS = ["ea", "ls", "hr", "day", "m", "mÂ²", "mÂ³", "bag", "t", "week"];

export const makeItem = () => ({ id: Math.random().toString(36).slice(2), description: "", qty: "", rate: "", unit: "ea" });
export const makeSection = (title = "New Section") => ({ id: Math.random().toString(36).slice(2), title, items: [makeItem()] });

export const SUPPLIERS = [
  {
    id: "s1", code: "GEO-LAB", name: "GNS Science", category: "subcontractor", specialty: "Downhole Seismic / Lab Testing",
    contact: "Dr. Hamish Bowman", email: "h.bowman@gns.cri.nz", phone: "04 570 1444", mobile: "021 334 788",
    address: "1 Fairway Drive, Avalon, Lower Hutt 5010", paymentTerms: 30, isActive: true,
    pos: [
      { id: "PO-2026-0011", job: "200042", jobTitle: "Ground Investigation â€” Prestons Road", description: "Downhole Vs Survey subcontract â€” Prestons Road BH1", amount: 4025.00, status: "approved", date: "2026-03-02" },
      { id: "PO-2026-0008", job: "200029", jobTitle: "Slope Stability Investigation â€” SH73", description: "Seismic CPT subcontract â€” SH73 West Auckland", amount: 6200.00, status: "paid", date: "2026-02-10" },
    ],
  },
  {
    id: "s2", code: "DRILL-SUP", name: "Drilling Supplies NZ", category: "supplier", specialty: "Drilling Consumables & Bits",
    contact: "Barry Finch", email: "sales@drillingsuppliesnz.co.nz", phone: "03 348 5500", mobile: "027 445 6621",
    address: "18 Nga Mahi Road, Sockburn, Christchurch 8042", paymentTerms: 20, isActive: true,
    pos: [
      { id: "PO-2026-0014", job: "100018", jobTitle: "Bore Installation â€” Station Road Farm", description: "Tri-cone drill bits x3, 200m casing supply", amount: 3840.00, status: "approved", date: "2026-03-05" },
      { id: "PO-2026-0009", job: "100021", jobTitle: "Irrigation Bore â€” Rakaia Gorge", description: "Air rotary consumables â€” casing, bits, stabilisers", amount: 5210.00, status: "pending", date: "2026-03-10" },
    ],
  },
  {
    id: "s3", code: "ENV-LAB", name: "Hill Laboratories", category: "subcontractor", specialty: "Environmental / Soil Testing",
    contact: "Claire Sutton", email: "c.sutton@hill-labs.co.nz", phone: "07 858 2000", mobile: null,
    address: "28 Duke Street, Hamilton 3204", paymentTerms: 30, isActive: true,
    pos: [
      { id: "PO-2026-0013", job: "200044", jobTitle: "Contamination Assessment â€” Industrial Site", description: "Soil chemistry analysis â€” 24 samples", amount: 2880.00, status: "pending", date: "2026-03-08" },
    ],
  },
  {
    id: "s4", code: "PUMP-SVC", name: "Pump & Bore Services", category: "subcontractor", specialty: "Bore Development & Pump Testing",
    contact: "Grant McLeod", email: "grant@pumpbore.co.nz", phone: "03 325 3900", mobile: "027 712 3344",
    address: "45 Dunns Crossing Road, Rolleston 7614", paymentTerms: 14, isActive: true,
    pos: [
      { id: "PO-2026-0007", job: "100015", jobTitle: "Monitoring Bore Network â€” Selwyn District", description: "Electric submersible pump testing â€” 8 bores", amount: 4400.00, status: "paid", date: "2026-02-20" },
    ],
  },
  {
    id: "s5", code: "TRAFFIC", name: "Safety & Traffic NZ", category: "supplier", specialty: "Traffic Management",
    contact: "Rob Tane", email: "jobs@safetynz.co.nz", phone: "0800 444 123", mobile: "021 998 001",
    address: "Unit 3, 66 Treffers Road, Christchurch 8042", paymentTerms: 14, isActive: true,
    pos: [
      { id: "PO-2026-0010", job: "200042", jobTitle: "Ground Investigation â€” Prestons Road", description: "TCP traffic management â€” Prestons Rd, 3 days", amount: 1350.00, status: "approved", date: "2026-03-01" },
    ],
  },
];

export const poStatusCfg = {
  pending:  { label: "Pending",  color: "#F59E0B", bg: "#FEF3C7" },
  approved: { label: "Approved", color: "#3B82F6", bg: "#DBEAFE" },
  paid:     { label: "Paid",     color: "#10B981", bg: "#D1FAE5" },
  disputed: { label: "Disputed", color: "#EF4444", bg: "#FEE2E2" },
};

export const catColors = {
  subcontractor: { color: "#7C3AED", bg: "#EDE9FE" },
  supplier:      { color: "#0D9488", bg: "#CCFBF1" },
};

// â”€â”€ Supplier Invoices (Accounts Payable) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const SUPPLIER_INVOICES_INIT = [
  {
    id: "SINV-2026-0009", supplierId: "s1", supplierName: "GNS Science",
    poId: "PO-2026-0011", job: "200042", jobTitle: "Ground Investigation â€” Prestons Road",
    supplierRef: "GNS-INV-4421", description: "Downhole Vs Survey â€” Prestons Road BH1",
    invoiceDate: "2026-03-05", dueDate: "2026-04-04", receivedDate: "2026-03-06",
    poAmount: 4025.00, invoiceAmount: 4025.00,
    status: "pending_review", approvedBy: null, approvedDate: null, paidDate: null,
    notes: "",
  },
  {
    id: "SINV-2026-0008", supplierId: "s5", supplierName: "Safety & Traffic NZ",
    poId: "PO-2026-0010", job: "200042", jobTitle: "Ground Investigation â€” Prestons Road",
    supplierRef: "STN-8812", description: "TCP Traffic Management â€” Prestons Rd, 3 days",
    invoiceDate: "2026-03-04", dueDate: "2026-03-18", receivedDate: "2026-03-05",
    poAmount: 1350.00, invoiceAmount: 1485.00,
    status: "pending_review", approvedBy: null, approvedDate: null, paidDate: null,
    notes: "Invoice $135 over PO â€” supplier charged extra half-day. Awaiting clarification.",
  },
  {
    id: "SINV-2026-0007", supplierId: "s2", supplierName: "Drilling Supplies NZ",
    poId: "PO-2026-0014", job: "100018", jobTitle: "Bore Installation â€” Station Road Farm",
    supplierRef: "DSNZ-11042", description: "Tri-cone drill bits x3, 200m casing supply",
    invoiceDate: "2026-03-06", dueDate: "2026-03-26", receivedDate: "2026-03-07",
    poAmount: 3840.00, invoiceAmount: 3840.00,
    status: "approved", approvedBy: "Sean Templeton", approvedDate: "2026-03-08", paidDate: null,
    notes: "",
  },
  {
    id: "SINV-2026-0006", supplierId: "s3", supplierName: "Hill Laboratories",
    poId: "PO-2026-0013", job: "200044", jobTitle: "Contamination Assessment â€” Industrial Site",
    supplierRef: "HILL-22819", description: "Soil chemistry analysis â€” 24 samples",
    invoiceDate: "2026-03-08", dueDate: "2026-04-07", receivedDate: "2026-03-09",
    poAmount: 2880.00, invoiceAmount: 2760.00,
    status: "pending_review", approvedBy: null, approvedDate: null, paidDate: null,
    notes: "Invoice $120 under PO â€” only 23 samples completed, one location inaccessible.",
  },
  {
    id: "SINV-2026-0005", supplierId: "s1", supplierName: "GNS Science",
    poId: "PO-2026-0008", job: "200029", jobTitle: "Slope Stability Investigation â€” SH73",
    supplierRef: "GNS-INV-4388", description: "Seismic CPT subcontract â€” SH73 West Auckland",
    invoiceDate: "2026-02-12", dueDate: "2026-03-13", receivedDate: "2026-02-13",
    poAmount: 6200.00, invoiceAmount: 6200.00,
    status: "paid", approvedBy: "Sean Templeton", approvedDate: "2026-02-14", paidDate: "2026-03-10",
    notes: "",
  },
  {
    id: "SINV-2026-0004", supplierId: "s4", supplierName: "Pump & Bore Services",
    poId: "PO-2026-0007", job: "100015", jobTitle: "Monitoring Bore Network â€” Selwyn District",
    supplierRef: "PBS-3341", description: "Electric submersible pump testing â€” 8 bores",
    invoiceDate: "2026-02-22", dueDate: "2026-03-08", receivedDate: "2026-02-23",
    poAmount: 4400.00, invoiceAmount: 4400.00,
    status: "paid", approvedBy: "Sean Templeton", approvedDate: "2026-02-24", paidDate: "2026-03-05",
    notes: "",
  },
];

export const sinvStatusCfg = {
  pending_review: { label: "Pending Review", color: "#F59E0B", bg: "#FEF3C7" },
  approved:       { label: "Approved",        color: "#3B82F6", bg: "#DBEAFE" },
  disputed:       { label: "Disputed",        color: "#EF4444", bg: "#FEE2E2" },
  paid:           { label: "Paid",            color: "#10B981", bg: "#D1FAE5" },
};


export const EQUIPMENT = [
  { id: "eq1", name: "Rig 1 â€” Schramm T64W", type: "rig", category: "Rotary Air / Water Well Rig", division: "Water", region: "South", status: "deployed", jobId: "100018", rego: "SB7421", year: 2018, notes: "Major service due April 2026" },
  { id: "eq2", name: "Rig 2 â€” Schramm T130XD", type: "rig", category: "Rotary Air / Water Well Rig", division: "Water", region: "South", status: "available", jobId: null, rego: "CH4812", year: 2021, notes: "" },
  { id: "eq3", name: "Rig 3 â€” Geoprobe 7822DT", type: "rig", category: "Sonic / Geotechnical Rig", division: "Geotech", region: "South", status: "deployed", jobId: "200042", rego: "CH9034", year: 2020, notes: "" },
  { id: "eq4", name: "Rig 4 â€” Pagani TG73-200", type: "rig", category: "CPT / SCPT Rig", division: "Geotech", region: "North", status: "deployed", jobId: "200029", rego: "AK2291", year: 2022, notes: "" },
  { id: "eq5", name: "Rig 5 â€” Dando Terrier", type: "rig", category: "Rotary / Percussion Rig", division: "Water", region: "South", status: "maintenance", jobId: null, rego: "SB1104", year: 2015, notes: "Mast cylinder replacement in progress â€” est. return 25 March" },
  { id: "eq6", name: "Support Truck 1 â€” Isuzu NPR", type: "vehicle", category: "Support Vehicle", division: "Water", region: "South", status: "deployed", jobId: "100018", rego: "SB6612", year: 2019, notes: "" },
  { id: "eq7", name: "Support Truck 2 â€” Toyota Hilux 4WD", type: "vehicle", category: "Support Vehicle", division: "Geotech", region: "South", status: "deployed", jobId: "200042", rego: "CH3341", year: 2023, notes: "" },
  { id: "eq8", name: "Support Truck 3 â€” Ford Ranger 4WD", type: "vehicle", category: "Support Vehicle", division: "Water", region: "South", status: "available", jobId: null, rego: "CH7890", year: 2022, notes: "" },
  { id: "eq9", name: "Generator 1 â€” Hatz 20kVA", type: "ancillary", category: "Generator", division: null, region: "South", status: "deployed", jobId: "200042", rego: null, year: 2020, notes: "" },
  { id: "eq10", name: "Generator 2 â€” Kubota 15kVA", type: "ancillary", category: "Generator", division: null, region: "South", status: "available", jobId: null, rego: null, year: 2019, notes: "" },
  { id: "eq11", name: "Submersible Pump 1 â€” Grundfos MP1", type: "ancillary", category: "Pump", division: null, region: "South", status: "deployed", jobId: "100018", rego: null, year: 2021, notes: "" },
  { id: "eq12", name: "Air Compressor â€” Sullair 375", type: "ancillary", category: "Compressor", division: null, region: "South", status: "available", jobId: null, rego: null, year: 2018, notes: "" },
];

export const eqStatusCfg = {
  available:   { label: "Available",   color: "#10B981", bg: "#D1FAE5" },
  deployed:    { label: "Deployed",    color: "#3B82F6", bg: "#DBEAFE" },
  maintenance: { label: "Maintenance", color: "#F97316", bg: "#FFEDD5" },
  retired:     { label: "Retired",     color: "#94A3B8", bg: "#F1F5F9" },
};

export const INSPECTIONS_DATA = [
  // Rig 1 â€” Schramm T64W (eq1) history
  { id: "ins-101", eqId: "eq1", date: "2026-03-08", tech: "Dave Rudd",   faults: ["Minor hydraulic fitting seep â€” monitored"], status: "open",     priority: "low",    notes: "Watching â€” no active oil loss, re-check next pre-start" },
  { id: "ins-102", eqId: "eq1", date: "2026-03-01", tech: "Craig Tait",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-103", eqId: "eq1", date: "2026-02-22", tech: "Craig Tait",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-104", eqId: "eq1", date: "2026-02-15", tech: "Dave Rudd",   faults: ["Drill string vibration â€” rod 4 flagged for replacement"], status: "resolved", priority: "medium", notes: "Rod replaced 2026-02-17" },

  // Rig 2 â€” Schramm T130XD (eq2) history
  { id: "ins-201", eqId: "eq2", date: "2026-03-09", tech: "Tony Walsh",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-202", eqId: "eq2", date: "2026-03-02", tech: "Tony Walsh",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-203", eqId: "eq2", date: "2026-02-23", tech: "Dave Rudd",   faults: ["Coolant level low â€” topped up on-site"], status: "resolved", priority: "low", notes: "Topped up, no recurrence" },

  // Rig 3 â€” Geoprobe 7822DT (eq3) history
  { id: "ins-301", eqId: "eq3", date: "2026-03-09", tech: "Mike Brown",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-302", eqId: "eq3", date: "2026-03-02", tech: "Sam Ohu",     faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-303", eqId: "eq3", date: "2026-02-23", tech: "Mike Brown",  faults: ["Probe rod thread wear â€” 3 rods borderline"], status: "resolved", priority: "medium", notes: "Rods replaced 2026-02-25, stock ordered" },
  { id: "ins-304", eqId: "eq3", date: "2026-02-16", tech: "Sam Ohu",     faults: [], status: "pass", priority: null, notes: "" },

  // Rig 4 â€” Pagani TG73-200 (eq4) history
  { id: "ins-401", eqId: "eq4", date: "2026-03-07", tech: "Pete HÄpai", faults: ["Drill rod thread wear â€” 2 rods flagged"], status: "open", priority: "medium", notes: "Flagged for replacement on return to yard" },
  { id: "ins-402", eqId: "eq4", date: "2026-02-28", tech: "Pete HÄpai", faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-403", eqId: "eq4", date: "2026-02-21", tech: "Pete HÄpai", faults: ["CPT cone calibration drift â€” +2.3% on ref load"], status: "resolved", priority: "medium", notes: "Recalibrated by GNS 2026-02-24" },

  // Rig 5 â€” Dando Terrier (eq5) history
  { id: "ins-501", eqId: "eq5", date: "2026-03-05", tech: "Craig Tait",  faults: ["Mast cylinder leaking â€” oil loss", "Left outrigger pad worn"], status: "open", priority: "high", notes: "Rig stood down. Workshop booked 2026-03-10" },
  { id: "ins-502", eqId: "eq5", date: "2026-02-26", tech: "Craig Tait",  faults: ["Mast cylinder â€” early seep detected"], status: "resolved", priority: "low", notes: "Monitored â€” escalated to fault on 2026-03-05 inspection" },
  { id: "ins-503", eqId: "eq5", date: "2026-02-19", tech: "Tony Walsh",  faults: [], status: "pass", priority: null, notes: "" },
  { id: "ins-504", eqId: "eq5", date: "2026-02-12", tech: "Craig Tait",  faults: [], status: "pass", priority: null, notes: "" },
];

export const PLANNER_JOBS = [
  { rigId: "eq1", jobId: "100018", client: "Irrigation NZ Ltd", site: "Station Road, Leeston", start: "2026-02-10", end: "2026-03-20", color: COLORS.blue, personnel: ["Craig Tait", "Dave Rudd"] },
  { rigId: "eq2", jobId: "100021", client: "High Country Farms", site: "Rakaia Gorge Road", start: "2026-03-15", end: "2026-05-01", color: COLORS.blue, personnel: ["Dave Rudd", "Tony Walsh"] },
  { rigId: "eq3", jobId: "200042", client: "Tonkin + Taylor", site: "Prestons Road, Chch", start: "2026-03-01", end: "2026-04-15", color: COLORS.teal, personnel: ["Mike Brown", "Sam Ohu"] },
  { rigId: "eq4", jobId: "200029", client: "NZTA", site: "SH73, West Auckland", start: "2026-01-20", end: "2026-04-30", color: COLORS.teal, personnel: ["Pete HÄpai", "James TÅ«hoe"] },
  { rigId: "eq5", jobId: null, client: null, site: null, start: "2026-03-01", end: "2026-03-25", color: COLORS.orange, isDowntime: true, label: "Maintenance â€” Mast Cylinder", personnel: [] },
  { rigId: "eq1", jobId: "100015", client: "Selwyn District Council", site: "Multiple, Selwyn", start: "2025-11-01", end: "2026-02-28", color: "#94A3B8", personnel: ["Craig Tait", "Dave Rudd"] },
  { rigId: "eq3", jobId: "200038", client: "Lincoln University", site: "Lincoln University", start: "2026-04-20", end: "2026-05-10", color: COLORS.teal, personnel: ["Mike Brown", "Sam Ohu"] },
  { rigId: "eq2", jobId: "100009", client: "North Canterbury Vineyards", site: "Waipara Valley", start: "2026-01-15", end: "2026-02-15", color: "#94A3B8", personnel: ["Tony Walsh", "Craig Tait"] },
];

export const RIGS = EQUIPMENT.filter(e => e.type === "rig");

export const addDays = (dateStr, days) => {
  const d = new Date(dateStr); d.setDate(d.getDate() + days); return d;
};
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
export const toDateStr = (d) => d.toISOString().slice(0, 10);

export const JOB_COSTS = {
  "100018": { subcontractorCosts: 0,    labourCosts: 18400, otherCosts: 3200 },
  "200042": { subcontractorCosts: 5375, labourCosts: 9600,  otherCosts: 1800 },
  "100015": { subcontractorCosts: 4400, labourCosts: 52000, otherCosts: 9100 },
  "200038": { subcontractorCosts: 0,    labourCosts: 0,     otherCosts: 0    },
  "100021": { subcontractorCosts: 0,    labourCosts: 0,     otherCosts: 0    },
  "200029": { subcontractorCosts: 6200, labourCosts: 39400, otherCosts: 6800 },
  "100009": { subcontractorCosts: 0,    labourCosts: 8800,  otherCosts: 1400 },
  "200044": { subcontractorCosts: 0,    labourCosts: 0,     otherCosts: 0    },
};

export const TIMESHEET_DETAIL = [
  { week: "2026-02-09", user: "Craig Tait",  job: "100018", hours: 45, role: "Driller" },
  { week: "2026-02-09", user: "Dave Rudd",   job: "100018", hours: 40, role: "Offsider" },
  { week: "2026-02-09", user: "Mike Brown",  job: "200042", hours: 38, role: "Driller" },
  { week: "2026-02-09", user: "Pete HÄpai", job: "200029", hours: 44, role: "Driller" },
  { week: "2026-02-16", user: "Craig Tait",  job: "100018", hours: 44, role: "Driller" },
  { week: "2026-02-16", user: "Dave Rudd",   job: "100018", hours: 40, role: "Offsider" },
  { week: "2026-02-16", user: "Mike Brown",  job: "200042", hours: 40, role: "Driller" },
  { week: "2026-02-16", user: "Pete HÄpai", job: "200029", hours: 44, role: "Driller" },
  { week: "2026-02-23", user: "Craig Tait",  job: "100018", hours: 46, role: "Driller" },
  { week: "2026-02-23", user: "Dave Rudd",   job: "100021", hours: 40, role: "Driller" },
  { week: "2026-02-23", user: "Mike Brown",  job: "200042", hours: 18, role: "Driller" },
  { week: "2026-02-23", user: "Pete HÄpai", job: "200029", hours: 45, role: "Driller" },
  { week: "2026-03-02", user: "Craig Tait",  job: "100018", hours: 45, role: "Driller" },
  { week: "2026-03-02", user: "Dave Rudd",   job: "100021", hours: 40, role: "Driller" },
  { week: "2026-03-02", user: "Mike Brown",  job: "200042", hours: 40, role: "Driller" },
  { week: "2026-03-02", user: "Pete HÄpai", job: "200029", hours: 44, role: "Driller" },
  { week: "2026-03-09", user: "Craig Tait",  job: "100018", hours: 45, role: "Driller" },
  { week: "2026-03-09", user: "Dave Rudd",   job: "100021", hours: 40, role: "Driller" },
  { week: "2026-03-09", user: "Mike Brown",  job: "200042", hours: 28, role: "Driller" },
  { week: "2026-03-09", user: "Pete HÄpai", job: "200029", hours: 42, role: "Driller" },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LEAVE DATA â€” pending and approved applications
export const LEAVE_APPS = [
  { id: "la-1", userId: "u1", staffName: "Craig Tait",  type: "annual",  start: "2026-03-30", end: "2026-04-03", days: 5, status: "pending",  notes: "Pre-approved by email", submittedAt: "2026-03-09" },
  { id: "la-2", userId: "u3", staffName: "Pete HÄpai", type: "annual",  start: "2026-04-14", end: "2026-04-17", days: 4, status: "pending",  notes: "School holidays", submittedAt: "2026-03-07" },
  { id: "la-3", userId: "u2", staffName: "Dave Rudd",   type: "sick",    start: "2026-03-06", end: "2026-03-06", days: 1, status: "approved", notes: "GP cert attached", approvedBy: "Sean Templeton", approvedAt: "2026-03-07" },
  { id: "la-4", userId: "u4", staffName: "Mike Brown",  type: "sick",    start: "2026-03-06", end: "2026-03-06", days: 1, status: "approved", notes: "Self-certified", approvedBy: "Lisa Park", approvedAt: "2026-03-07" },
  { id: "la-5", userId: "u5", staffName: "Sam Ohu",     type: "annual",  start: "2026-04-22", end: "2026-04-24", days: 3, status: "pending",  notes: "Easter travel", submittedAt: "2026-03-10" },
  { id: "la-6", userId: "u1", staffName: "Craig Tait",  type: "annual",  start: "2026-05-05", end: "2026-05-09", days: 5, status: "pending",  notes: "", submittedAt: "2026-03-10" },
];

