import React, { useState } from "react";
import { COLORS, statusConfig, JOBS, icons, fmt } from "../appData.js";
import { Icon, StatusBadge, DivisionBadge } from "../components/ui.jsx";
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
                  ) : <span style={{ fontSize: 12, color: COLORS.textMuted }}>â€”</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// â”€â”€ Job Detail Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const JobDetailScreen = ({ job, onBack }) => {
  const [tab, setTab] = useState("overview");
  const notes = [
    { author: "Craig Tait", date: "10 Mar 2026 14:32", type: "general", text: "Completed 3rd drill run today. Down to 42m, groundwater encountered at 38m. Good flow rate. Weather clear." },
    { author: "Sean Templeton", date: "8 Mar 2026 09:15", type: "milestone", text: "Casing order confirmed with supplier â€” delivery expected 12 March." },
    { author: "Craig Tait", date: "5 Mar 2026 17:01", type: "general", text: "Slight delay â€” drill bit replaced after hitting cobble layer at 18m. Now using tri-cone for this formation." },
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
                  <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{job.startDate} â†’ {job.endDate || "TBC"}</span>
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
              ["Project Manager", job.manager || "â€”"],
              ["Site Supervisor", job.supervisor || "Not assigned"],
              ["Client PO Ref", "SDC-PO-2026-114"],
              ["SharePoint Folder", job.id + " â€” " + job.title],
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
              {[{ name: "Rig 3 â€” Schramm T64", type: "Drill Rig" }, { name: "Support Truck â€” 4WD", type: "Support" }].map(eq => (
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

// â”€â”€ Timesheets Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TIMESHEETS MODULE â€” Full rebuild
// Dual-mode: Desktop manager view + Mobile field entry view
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•


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
            <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Bore Installation â€” Station Road Farm" style={fieldStyle} />
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SUPPLIERS MODULE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export {
  JobsScreen,
  JobDetailScreen,
  NewJobScreen,
};
