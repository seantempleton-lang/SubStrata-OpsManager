import React, { useState, useEffect } from "react";
import {
  COLORS,
  STAFF as STAFF_SEED,
  RATE_TYPES,
  LEAVE_TYPES,
  EXPENSE_TYPES,
  TIMESHEETS as TIMESHEETS_SEED,
  JOBS as JOBS_SEED,
  calcTsHours,
  calcTsOvernights,
  TS_STATUS_CFG,
  DAY_LABELS,
  WEEK_DAYS_FROM_MONDAY,
  fmtDay,
  fmtDayShort,
  icons,
} from "../appData.js";
import { Icon } from "../components/ui.jsx";
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

// â”€â”€ Day type badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MANAGER VIEW ? desktop approval queue
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const ManagerTimesheetsView = ({
  staff = STAFF_SEED,
  timesheets = TIMESHEETS_SEED,
  jobs = JOBS_SEED,
  currentUser = null,
  onViewTimesheet,
  onUpdateTimesheetStatus = async () => null,
  tsVisible = () => true,
}) => {
  const STAFF = staff;
  const TIMESHEETS = timesheets;
  const JOBS = jobs;
  const [filter, setFilter] = useState("pending");
  const [weekFilter, setWeekFilter] = useState("2026-03-09");
  const [activeAction, setActiveAction] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const filtered = TIMESHEETS.filter(ts => tsVisible(ts)).filter(ts => {
    if (filter === "pending") return ["submitted", "supervisor_approved"].includes(ts.status);
    if (filter === "approved") return ts.status === "manager_approved";
    if (filter === "draft") return ts.status === "draft";
    return true;
  });

  const totalHours = filtered.reduce((s, ts) => s + calcTsHours(ts), 0);
  const pendingCount = TIMESHEETS.filter(ts => tsVisible(ts) && ["submitted","supervisor_approved"].includes(ts.status)).length;

  const handleStatusChange = async (timesheetId, action) => {
    setActiveAction(`${timesheetId}:${action}`);
    setActionError("");
    setActionMessage("");

    try {
      await onUpdateTimesheetStatus(timesheetId, action);
      setActionMessage(
        action === "supervisor_approve"
          ? "Supervisor approval saved."
          : action === "manager_approve"
            ? "Final approval saved."
            : "Timesheet returned to the employee.",
      );
    } catch (error) {
      setActionError(error.message || "Unable to update timesheet status.");
    } finally {
      setActiveAction(null);
    }
  };

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

      {(actionMessage || actionError) && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: `1px solid ${actionError ? COLORS.red : COLORS.green}`,
            background: actionError ? COLORS.redLight : COLORS.greenLight,
            color: actionError ? COLORS.red : COLORS.green,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {actionError || actionMessage}
        </div>
      )}

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
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{staff?.role} ? {staff?.region}</div>
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
                    View Full ?
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
                      <button
                        onClick={() => handleStatusChange(ts.id, "supervisor_approve")}
                        disabled={activeAction !== null}
                        style={{ padding: "7px 16px", background: COLORS.greenLight, border: `1px solid ${COLORS.green}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.green, cursor: activeAction !== null ? "wait" : "pointer", opacity: activeAction !== null ? 0.7 : 1 }}
                      >
                        {activeAction === `${ts.id}:supervisor_approve` ? "Saving..." : "Approve (Supervisor)"}
                      </button>
                      <button
                        onClick={() => handleStatusChange(ts.id, "reject")}
                        disabled={activeAction !== null}
                        style={{ padding: "7px 12px", background: COLORS.redLight, border: `1px solid ${COLORS.red}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.red, cursor: activeAction !== null ? "wait" : "pointer", opacity: activeAction !== null ? 0.7 : 1 }}
                      >
                        {activeAction === `${ts.id}:reject` ? "Saving..." : "Return"}
                      </button>
                    </>
                  )}
                  {ts.status === "supervisor_approved" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(ts.id, "manager_approve")}
                        disabled={activeAction !== null}
                        style={{ padding: "7px 16px", background: COLORS.green, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.white, cursor: activeAction !== null ? "wait" : "pointer", opacity: activeAction !== null ? 0.7 : 1 }}
                      >
                        {activeAction === `${ts.id}:manager_approve` ? "Saving..." : "Final Approve"}
                      </button>
                      <button
                        onClick={() => handleStatusChange(ts.id, "reject")}
                        disabled={activeAction !== null}
                        style={{ padding: "7px 12px", background: COLORS.redLight, border: `1px solid ${COLORS.red}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: COLORS.red, cursor: activeAction !== null ? "wait" : "pointer", opacity: activeAction !== null ? 0.7 : 1 }}
                      >
                        {activeAction === `${ts.id}:reject` ? "Saving..." : "Return"}
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TIMESHEET DETAIL ? full view of one week (used by both views)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const TimesheetDetail = ({ ts, jobs = JOBS_SEED, staff = STAFF_SEED, onBack, isMobile }) => {
  const JOBS = jobs;
  const STAFF = staff;
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
        <span style={{ color: COLORS.textMuted }}>?</span>
        <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{ts.user} ? week of {fmtDay(ts.weekStart)}</span>
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
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Week of {fmtDay(weekDays[0])} ? {fmtDay(weekDays[6])}</div>
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
              {/* Day header ? always visible */}
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
                          return job ? <span key={jid} style={{ fontSize: 11, fontWeight: 600, color: job.division === "Water" ? COLORS.blue : COLORS.teal }}>{jid} ? {job.client}</span> : null;
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
                    <span style={{ fontSize: 13, fontWeight: 700, color: lt.color }}>{lt.label}{day.notes ? ` ? ${day.notes}` : ""}</span>
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

              {/* Entry details ? shown when open */}
              {isOpen && day.dayType === "work" && day.entries.map((entry, ei) => {
                const job = JOBS.find(j => j.id === entry.jobId);
                const rt = RATE_TYPES.find(r => r.id === entry.rateType) || RATE_TYPES[0];
                        const eHours = entryHours(entry);
                return (
                  <div key={ei} style={{ padding: "10px 14px 10px 58px", borderTop: `1px solid ${COLORS.border}`, background: ei % 2 === 0 ? COLORS.white : "#FAFBFC" }}>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto auto auto", gap: isMobile ? 6 : 16, alignItems: "start" }}>
                      <div>
                        {job && <div style={{ fontSize: 12, fontWeight: 700, color: job.division === "Water" ? COLORS.blue : COLORS.teal }}>{job.id} ? {job.title.split("?")[0].trim()}</div>}
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
                          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{entry.startTime} ? {entry.endTime} <span style={{ fontWeight: 800, color: COLORS.textPrimary, marginLeft: 4 }}>{eHours}h</span></div>
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
                      {exp.receipt && <span style={{ color: COLORS.green, fontWeight: 600 }}>? Receipt attached</span>}
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MOBILE ENTRY VIEW ? field staff time entry UI
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const MobileTimesheetEntry = ({ jobs = JOBS_SEED, staff = STAFF_SEED, timesheets = TIMESHEETS_SEED, onBack }) => {
  const JOBS = jobs;
  const STAFF = staff;
  const TIMESHEETS = timesheets;
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
          {/* Day selector ? horizontal scroll */}
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
                        : <span style={{ fontSize: 9, color: isActive ? "rgba(255,255,255,0.3)" : COLORS.border, marginTop: 2 }}>?</span>}
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
                    Overnight: {day.overnight ? "Away" : "Home"}
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
                  <div style={{ fontSize: 20, marginBottom: 8, fontWeight: 800 }}>Leave</div>
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
                          <button onClick={() => removeEntry(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: COLORS.red, fontSize: 18, lineHeight: 1 }}>x</button>
                        </div>
                      </div>
                      <div style={{ padding: "14px" }}>
                        {/* Job selector */}
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Job</label>
                          <select value={entry.jobId} onChange={e => updateEntry(entry.id, "jobId", e.target.value)} style={selectSt}>
                            {ACTIVE_JOBS.map(j => <option key={j.id} value={j.id}>{j.id} ? {j.title.split("?")[0].trim()}</option>)}
                          </select>
                        </div>
                        {/* Client display ? auto-populated from job */}
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
                            {entryHours} hour{entryHours !== 1 ? "s" : ""} - rate type assigned by supervisor on approval
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
                                  {s.initials} ? {s.name.split(" ")[0]}
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
              <div style={{ fontSize: 20, marginBottom: 8, fontWeight: 800 }}>Expenses</div>
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
                    style={{ background: COLORS.redLight, border: "none", borderRadius: 8, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: COLORS.red }}>x</button>
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
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>Apply for leave on any day ? go to the Time tab, select a day, then tap Leave</div>
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
          Submit for Approval ?
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN TIMESHEETS SCREEN ? toggles between manager and mobile views
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const TimesheetsScreen = ({
  staff = STAFF_SEED,
  timesheets = TIMESHEETS_SEED,
  jobs = JOBS_SEED,
  currentUser = null,
  onUpdateTimesheetStatus = async () => null,
  regionFilter = "all",
  divisionFilter = { Water: true, Geotech: true },
}) => {
  const STAFF = staff;
  const TIMESHEETS = timesheets;
  const JOBS = jobs;
  // Global filter helper for timesheets ? filter by staff's division/region
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
    return <MobileTimesheetEntry jobs={jobs} staff={staff} timesheets={timesheets} onBack={() => setView("manager")} />;
  }

  if (selectedTs) {
    return <TimesheetDetail ts={selectedTs} jobs={jobs} staff={staff} onBack={() => setSelectedTs(null)} isMobile={false} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Timesheets</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>Week of 9 Mar 2026 ? Two-stage approval</p>
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
      <ManagerTimesheetsView
        staff={staff}
        timesheets={timesheets}
        jobs={jobs}
        currentUser={currentUser}
        onViewTimesheet={(ts) => setSelectedTs(ts)}
        onUpdateTimesheetStatus={onUpdateTimesheetStatus}
        tsVisible={tsVisible}
      />
    </div>
  );
};

export default TimesheetsScreen;
