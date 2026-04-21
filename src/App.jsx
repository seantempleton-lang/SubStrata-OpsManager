import React, { useState } from "react";
import { COLORS, icons } from "./appData.js";
import { Icon } from "./components/ui.jsx";
import { useAppData } from "./data/AppDataContext.jsx";
import DashboardScreen from "./screens/DashboardScreen.jsx";
import { JobsScreen, JobDetailScreen, NewJobScreen } from "./screens/JobsModule.jsx";
import TimesheetsScreen from "./screens/TimesheetsScreen.jsx";
import { ClientsScreen, ClientDetailScreen } from "./screens/ClientsModule.jsx";
import { EstimatesScreen, EstimateDetailScreen, NewEstimateScreen } from "./screens/EstimatesModule.jsx";
import SuppliersScreen from "./screens/SuppliersScreen.jsx";
import ResourcesScreen from "./screens/ResourcesScreen.jsx";
import PlannerScreen from "./screens/PlannerScreen.jsx";
import ReportsScreen from "./screens/ReportsScreen.jsx";
import HSEScreen from "./screens/HSEScreen.jsx";
import InvoicingScreen from "./screens/InvoicingScreen.jsx";

export default function App() {
  const {
    loading,
    error,
    refresh,
    currentUser,
    staff,
    clients,
    jobs,
    invoices,
    estimates,
    timesheets,
    suppliers,
    supplierInvoices,
    equipment,
    inspections,
    plannerJobs,
    leaveApplications,
    reporting,
    createJob,
    createEstimate,
  } = useAppData();

  const [screen, setScreen] = useState("dashboard");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedEstimateId, setSelectedEstimateId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [regionFilter, setRegionFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState({ Water: true, Geotech: true });
  const [resourcesSubTab, setResourcesSubTab] = useState("plant");

  const selectedJob = jobs.find((job) => job.dbId === selectedJobId || job.id === selectedJobId) || null;
  const selectedClient = clients.find((client) => client.id === selectedClientId) || null;
  const selectedEstimate = estimates.find((estimate) => estimate.dbId === selectedEstimateId || estimate.id === selectedEstimateId) || null;

  const navigate = (target, data = null) => {
    if (target === "jobdetail") {
      setSelectedJobId(data?.dbId || data?.id || null);
      setScreen("jobdetail");
      return;
    }

    if (target === "clientdetail") {
      setSelectedClientId(data?.id || null);
      setScreen("clientdetail");
      return;
    }

    if (target === "estimatedetail") {
      setSelectedEstimateId(data?.dbId || data?.id || null);
      setScreen("estimatedetail");
      return;
    }

    setScreen(target);
    setSelectedJobId(null);
    setSelectedClientId(null);
    setSelectedEstimateId(null);
  };

  const handleSaveJob = async (formData) => {
    const createdJob = await createJob(formData);
    setSelectedJobId(createdJob?.dbId || createdJob?.id || null);
    setScreen("jobdetail");
  };

  const handleSaveEstimate = async (formData) => {
    const createdEstimate = await createEstimate(formData);
    setSelectedEstimateId(createdEstimate?.dbId || createdEstimate?.id || null);
    setScreen("estimatedetail");
  };

  const navStructure = [
    { id: "dashboard", label: "Dashboard", icon: icons.dashboard },
    {
      id: "jobs",
      label: "Jobs",
      icon: icons.jobs,
      children: [
        { id: "estimates", label: "Estimates", icon: icons.estimates },
        { id: "invoicing", label: "Invoicing", icon: icons.finance },
      ],
    },
    { id: "planner", label: "Planner", icon: icons.calendar },
    { id: "clients", label: "Clients", icon: icons.clients },
    { id: "suppliers", label: "Suppliers", icon: icons.clients },
    {
      id: "resources",
      label: "Resources",
      icon: icons.settings,
      children: [
        { id: "resources_plant", label: "Plant", icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
        { id: "resources_personnel", label: "Personnel", icon: icons.user },
      ],
    },
    { id: "timesheets", label: "Timesheets", icon: icons.time },
    { id: "hse", label: "HSE", icon: icons.alert },
    { id: "reports", label: "Reports", icon: icons.reports },
  ];

  const activeSection = (id) => {
    if (screen === "jobdetail" || screen === "newjob" || screen === "newestimate" || screen === "estimatedetail") return id === "jobs";
    if (screen === "clientdetail") return id === "clients";
    if (screen === "resources_plant" || screen === "resources_personnel") return id === "resources";
    return screen === id;
  };

  const SB = sidebarCollapsed;
  const sidebarW = SB ? 56 : 220;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: COLORS.bg, color: COLORS.textSecondary, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        Loading PostgreSQL workspace...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: COLORS.bg, padding: 24, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <div style={{ maxWidth: 560, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, color: COLORS.textPrimary }}>PostgreSQL bootstrap failed</h1>
          <p style={{ margin: "0 0 12px", color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.6 }}>
            The app has been switched to database-backed runtime data. It now expects the Node API and PostgreSQL to be available before the UI can load.
          </p>
          <p style={{ margin: "0 0 16px", color: COLORS.red, fontSize: 13, fontWeight: 700 }}>{error}</p>
          <button onClick={refresh} style={{ padding: "10px 18px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const NavItem = ({ item, depth = 0 }) => {
    const isActive = activeSection(item.id);
    const isSubActive =
      screen === item.id ||
      (item.id === "resources_plant" && screen === "resources" && resourcesSubTab === "plant") ||
      (item.id === "resources_personnel" && screen === "resources" && resourcesSubTab === "personnel");
    const isChild = depth > 0;

    return (
      <>
        <button
          onClick={() => {
            if (item.id === "resources_plant") {
              navigate("resources");
              setResourcesSubTab("plant");
            } else if (item.id === "resources_personnel") {
              navigate("resources");
              setResourcesSubTab("personnel");
            } else {
              navigate(item.id);
            }
          }}
          title={SB ? item.label : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: SB ? 0 : 9,
            padding: SB ? "10px 0" : isChild ? "7px 12px 7px 28px" : "9px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
            justifyContent: SB ? "center" : "flex-start",
            background: isSubActive ? COLORS.amber + "25" : isChild && isActive ? COLORS.amber + "12" : "transparent",
            color: isSubActive ? COLORS.amber : isChild && isActive ? COLORS.amber + "cc" : "#94A3B8",
            fontWeight: isSubActive ? 700 : 500,
            fontSize: isChild ? 12 : 13,
            textAlign: "left",
            transition: "all 0.12s",
            borderLeft: !SB ? (isSubActive ? `3px solid ${COLORS.amber}` : isChild && isActive ? `3px solid ${COLORS.amber}60` : "3px solid transparent") : "none",
          }}
        >
          <Icon d={item.icon} size={isChild ? 13 : 16} color={isSubActive ? COLORS.amber : isChild && isActive ? COLORS.amber + "cc" : "#64748B"} style={{ flexShrink: 0 }} />
          {!SB && <span>{item.label}</span>}
        </button>
        {!SB && item.children?.map((child) => <NavItem key={child.id} item={child} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: COLORS.bg, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Barlow+Condensed:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ width: sidebarW, background: COLORS.navy, display: "flex", flexDirection: "column", flexShrink: 0, borderRight: `1px solid ${COLORS.navyBorder}`, transition: "width 0.2s ease", overflow: "hidden" }}>
        <div
          onClick={() => setSidebarCollapsed((current) => !current)}
          style={{ padding: SB ? "18px 0" : "18px 16px 14px", borderBottom: `1px solid ${COLORS.navyBorder}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: SB ? "center" : "flex-start", gap: 10, userSelect: "none" }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 8, background: COLORS.navyLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(255,255,255,0.12)" }}>
            <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
              <polyline points="9,11 24,20 39,11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.2" />
              <polyline points="9,20 24,29 39,20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
              <polyline points="9,29 24,38 39,29" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
              <rect x="22.5" y="5" width="3" height="24" rx="1.5" fill="#F59E0B" />
              <polygon points="24,42 20,29 28,29" fill="#F59E0B" />
              <rect x="20" y="4" width="8" height="3" rx="1.5" fill="#F59E0B" opacity="0.5" />
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

        <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
          {navStructure.map((item) => <NavItem key={item.id} item={item} />)}
        </nav>

        <div style={{ padding: SB ? "10px 4px" : "10px 12px", borderTop: `1px solid ${COLORS.navyBorder}` }}>
          {!SB && <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Region</div>}
          <div style={{ display: "flex", flexDirection: SB ? "column" : "row", gap: 4 }}>
            {[{ id: "all", label: "All", short: "A" }, { id: "North", label: "North", short: "N" }, { id: "South", label: "South", short: "S" }].map((region) => (
              <button
                key={region.id}
                onClick={() => setRegionFilter(region.id)}
                style={{
                  flex: SB ? "none" : 1,
                  padding: SB ? "6px 4px" : "5px 4px",
                  borderRadius: 6,
                  border: `1px solid ${regionFilter === region.id ? COLORS.amber : "transparent"}`,
                  background: regionFilter === region.id ? COLORS.amber + "20" : "transparent",
                  cursor: "pointer",
                  fontSize: SB ? 9 : 11,
                  fontWeight: 700,
                  color: regionFilter === region.id ? COLORS.amber : "#475569",
                  textAlign: "center",
                }}
              >
                {SB ? region.short : region.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: SB ? "8px 4px" : "8px 12px", borderTop: `1px solid ${COLORS.navyBorder}` }}>
          {!SB && <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Divisions</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[{ id: "Water", color: COLORS.blue }, { id: "Geotech", color: COLORS.teal }].map((division) => {
              const on = divisionFilter[division.id];
              return (
                <button
                  key={division.id}
                  onClick={() => setDivisionFilter((current) => ({ ...current, [division.id]: !current[division.id] }))}
                  style={{ display: "flex", alignItems: "center", gap: SB ? 0 : 8, padding: SB ? "5px 0" : "5px 8px", justifyContent: SB ? "center" : "flex-start", borderRadius: 6, border: "none", background: on ? division.color + "18" : "transparent", cursor: "pointer" }}
                >
                  <div style={{ width: SB ? 10 : 8, height: SB ? 10 : 8, borderRadius: "50%", background: on ? division.color : "#334155", flexShrink: 0 }} />
                  {!SB && <span style={{ fontSize: 12, color: on ? division.color : "#475569", fontWeight: on ? 700 : 500 }}>{division.id}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: SB ? "10px 0" : "10px 12px", borderTop: `1px solid ${COLORS.navyBorder}`, display: "flex", alignItems: "center", gap: 10, justifyContent: SB ? "center" : "flex-start" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.amber + "30", border: `2px solid ${COLORS.amber}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.amber }}>
              {(currentUser?.initials || "ST").slice(0, 2)}
            </span>
          </div>
          {!SB && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser?.name || "Connected User"}</div>
              <div style={{ fontSize: 10, color: "#64748B" }}>{currentUser?.role || "Database-backed session"}{currentUser?.region ? ` • ${currentUser.region}` : ""}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 52, background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0 }}>
          <div style={{ position: "relative", flex: "0 0 280px" }}>
            <Icon d={icons.search} size={14} color={COLORS.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input placeholder="Search jobs, clients, invoices..." style={{ width: "100%", padding: "7px 12px 7px 32px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg, color: COLORS.textPrimary, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {regionFilter !== "all" && (
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: COLORS.amber + "20", border: `1px solid ${COLORS.amber}40`, color: COLORS.amber, fontWeight: 700 }}>{regionFilter}</span>
            )}
            {Object.entries(divisionFilter).filter(([, visible]) => visible).map(([division]) => (
              <span key={division} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: division === "Water" ? COLORS.blueLight : COLORS.tealLight, border: `1px solid ${division === "Water" ? COLORS.blue : COLORS.teal}40`, color: division === "Water" ? COLORS.blue : COLORS.teal, fontWeight: 700 }}>
                {division}
              </span>
            ))}
          </div>
          <button style={{ width: 34, height: 34, borderRadius: 8, background: COLORS.bg, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
            <Icon d={icons.bell} size={16} color={COLORS.textSecondary} />
            <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: COLORS.red, border: `2px solid ${COLORS.white}` }} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {screen === "dashboard" && <DashboardScreen onNavigate={navigate} jobs={jobs} invoices={invoices} timesheets={timesheets} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "jobs" && <JobsScreen jobs={jobs} timesheets={timesheets} onNavigate={navigate} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "jobdetail" && selectedJob && <JobDetailScreen job={selectedJob} timesheets={timesheets} onBack={() => navigate("jobs")} />}
          {screen === "timesheets" && <TimesheetsScreen staff={staff} timesheets={timesheets} jobs={jobs} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {(screen === "invoicing" || screen === "finance") && <InvoicingScreen jobs={jobs} invoices={invoices} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "newjob" && <NewJobScreen onBack={() => navigate("jobs")} onSave={handleSaveJob} />}
          {screen === "clients" && <ClientsScreen clients={clients} jobs={jobs} invoices={invoices} onNavigate={navigate} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "clientdetail" && selectedClient && <ClientDetailScreen client={selectedClient} jobs={jobs} invoices={invoices} onBack={() => navigate("clients")} onNavigate={navigate} />}
          {screen === "estimates" && <EstimatesScreen onNavigate={navigate} estimates={estimates} />}
          {screen === "estimatedetail" && selectedEstimate && <EstimateDetailScreen estimate={selectedEstimate} onBack={() => navigate("estimates")} onNavigate={navigate} />}
          {screen === "newestimate" && <NewEstimateScreen clients={clients} onBack={() => navigate("estimates")} onSave={handleSaveEstimate} />}
          {screen === "suppliers" && <SuppliersScreen suppliers={suppliers} supplierInvoices={supplierInvoices} currentUserName={currentUser?.name || "Sean Templeton"} onNavigate={navigate} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "resources" && <ResourcesScreen equipment={equipment} inspections={inspections} jobs={jobs} staff={staff} plannerJobs={plannerJobs} leaveApplications={leaveApplications} subTab={resourcesSubTab} setSubTab={setResourcesSubTab} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "planner" && <PlannerScreen jobs={jobs} equipment={equipment} plannerJobs={plannerJobs} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "reports" && <ReportsScreen estimates={estimates} jobs={jobs} equipment={equipment} invoices={invoices} reporting={reporting} regionFilter={regionFilter} divisionFilter={divisionFilter} />}
          {screen === "hse" && <HSEScreen regionFilter={regionFilter} divisionFilter={divisionFilter} />}
        </div>
      </div>
    </div>
  );
}
