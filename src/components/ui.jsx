import React from "react";
import { COLORS, statusConfig } from "../appData.js";
const Icon = ({ d, size = 16, color = "currentColor", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={d} />
  </svg>
);


// Pill / badge
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

// KPI card
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

// Progress bar
const ProgressBar = ({ value, max, color = COLORS.teal }) => {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ height: 6, borderRadius: 4, background: COLORS.border, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.4s ease" }} />
    </div>
  );
};

// Screens


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
export {
  Icon,
  StatusBadge,
  DivisionBadge,
  KpiCard,
  ProgressBar,
  BarChart,
  HBarChart,
  DonutChart,
  StatCard,
  ReportCard,
  DateRangePicker,
};
