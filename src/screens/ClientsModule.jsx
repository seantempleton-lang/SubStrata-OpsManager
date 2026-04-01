import React, { useState } from "react";
import { COLORS, CLIENTS, icons } from "../appData.js";
import { Icon, DivisionBadge, StatusBadge } from "../components/ui.jsx";
const ClientsScreen = ({ onNavigate, regionFilter = "all", divisionFilter = { Water: true, Geotech: true } }) => {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");

  const industries = ["all", ...Array.from(new Set(CLIENTS.map(c => c.industry)))];
  const filtered = CLIENTS.filter(c => {
    if (industryFilter !== "all" && c.industry !== industryFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    // Region/division filter ? include client if they have at least one job matching the filter
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
                  { label: "Contract Value", value: totalValue > 0 ? `$${(totalValue / 1000).toFixed(0)}k` : "?" },
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
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>? {primaryContact.role}</span>
                </div>
              )}

              {/* Last activity */}
              {lastActivity && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", background: COLORS.bg, borderRadius: 7 }}>
                  <Icon d={activityIcons[lastActivity.type] || icons.clients} size={12} color={COLORS.textMuted} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: 600 }}>{lastActivity.subject}</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}> ? {lastActivity.date}</span>
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

// â”€â”€ Client Detail Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      {/* â”€â”€ Overview Tab â”€â”€ */}
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
              ["Website", client.website || "?"],
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
                <button onClick={() => setTab("activity")} style={{ fontSize: 12, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all ?</button>
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
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{act.author} ? {act.date}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>Jobs</span>
                <button onClick={() => setTab("jobs")} style={{ fontSize: 12, color: COLORS.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all ?</button>
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

      {/* â”€â”€ Contacts Tab â”€â”€ */}
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
                    { icon: icons.user, label: "Mobile", value: contact.mobile || "?" },
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

      {/* â”€â”€ Jobs Tab â”€â”€ */}
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
                      ) : <span style={{ fontSize: 12, color: COLORS.textMuted }}>?</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* â”€â”€ Activity Tab â”€â”€ */}
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
// â”€â”€ Estimates Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export {
  ClientsScreen,
  ClientDetailScreen,
};
