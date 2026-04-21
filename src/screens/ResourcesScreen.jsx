import React, { useMemo, useState } from "react";
import { COLORS, eqStatusCfg, LEAVE_TYPES, icons } from "../appData.js";
import { DivisionBadge, Icon, StatusBadge } from "../components/ui.jsx";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) <= new Date(bEnd) && new Date(aEnd) >= new Date(bStart);
}

function leaveTypeConfig(type) {
  return LEAVE_TYPES.find((item) => item.id === type) ?? {
    id: type,
    label: type,
    color: COLORS.textMuted,
  };
}

function initialsFor(name = "") {
  return name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PlantView({ equipment, inspections, jobs, regionFilter, divisionFilter }) {
  const [plantTab, setPlantTab] = useState("register");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);

  const visibleEquipment = useMemo(
    () =>
      equipment.filter((item) => {
        if (regionFilter !== "all" && item.region !== regionFilter) return false;
        if (item.division && !divisionFilter[item.division]) return false;
        if (typeFilter !== "all" && item.type !== typeFilter) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        return true;
      }),
    [divisionFilter, equipment, regionFilter, statusFilter, typeFilter],
  );

  const visibleInspectionItems = useMemo(
    () =>
      inspections.filter((inspection) => {
        const equipmentItem = equipment.find((item) => item.id === inspection.eqId);
        if (!equipmentItem) return false;
        if (regionFilter !== "all" && equipmentItem.region !== regionFilter) return false;
        if (equipmentItem.division && !divisionFilter[equipmentItem.division]) return false;
        return true;
      }),
    [divisionFilter, equipment, inspections, regionFilter],
  );

  const selectedEquipment =
    equipment.find((item) => item.id === selectedEquipmentId) ?? null;
  const selectedEquipmentInspections = visibleInspectionItems
    .filter((inspection) => inspection.eqId === selectedEquipmentId)
    .sort((left, right) => String(right.date).localeCompare(String(left.date)));

  const stats = [
    { label: "Total Fleet", value: visibleEquipment.length, color: COLORS.textPrimary },
    {
      label: "Deployed",
      value: visibleEquipment.filter((item) => item.status === "deployed").length,
      color: COLORS.blue,
    },
    {
      label: "Available",
      value: visibleEquipment.filter((item) => item.status === "available").length,
      color: COLORS.green,
    },
    {
      label: "Open Faults",
      value: visibleInspectionItems.filter((inspection) => inspection.status === "open").length,
      color:
        visibleInspectionItems.filter((inspection) => inspection.status === "open").length > 0
          ? COLORS.red
          : COLORS.green,
    },
  ];

  const typeIcons = {
    rig: "M12 2L8 6H4v4l-2 2v8h20v-8l-2-2V6h-4L12 2z M8 14h8 M12 6v8",
    vehicle: "M3 13l2-5h14l2 5v5h-2a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H3z M6 8l1-3h10l1 3",
    ancillary: icons.settings,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>
          Plant
        </h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>
          Fleet register, inspections, and deployment status
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: COLORS.white,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              padding: "14px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.textSecondary,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {stat.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, marginTop: 6 }}>
              {stat.value}
            </div>
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
          alignSelf: "flex-start",
        }}
      >
        {[
          { id: "register", label: "Plant Register" },
          { id: "inspections", label: "Inspections" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPlantTab(tab.id)}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: plantTab === tab.id ? COLORS.white : "transparent",
              color: plantTab === tab.id ? COLORS.textPrimary : COLORS.textMuted,
              boxShadow: plantTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {plantTab === "register" && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
              {["all", "rig", "vehicle", "ancillary"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    background: typeFilter === type ? COLORS.white : "transparent",
                    color: typeFilter === type ? COLORS.textPrimary : COLORS.textMuted,
                    boxShadow: typeFilter === type ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    textTransform: "capitalize",
                  }}
                >
                  {type === "all" ? "All Types" : type}
                </button>
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
              }}
            >
              {["all", "available", "deployed", "maintenance", "out_of_service"].map((status) => (
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
                    boxShadow:
                      statusFilter === status ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    textTransform: "capitalize",
                  }}
                >
                  {status === "all" ? "All Status" : eqStatusCfg[status]?.label || status}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {visibleEquipment.map((item) => {
              const status = eqStatusCfg[item.status] ?? {
                label: item.status,
                color: COLORS.textMuted,
                bg: COLORS.bg,
              };
              const linkedJob = item.jobId ? jobs.find((job) => job.id === item.jobId) : null;
              const latestInspection = visibleInspectionItems
                .filter((inspection) => inspection.eqId === item.id)
                .sort((left, right) => String(right.date).localeCompare(String(left.date)))[0];
              const selected = selectedEquipmentId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedEquipmentId(selected ? null : item.id)}
                  style={{
                    background: COLORS.white,
                    borderRadius: 12,
                    border: `2px solid ${selected ? COLORS.amber : COLORS.border}`,
                    padding: "16px 18px",
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background:
                            item.status === "maintenance"
                              ? COLORS.orangeLight
                              : item.type === "rig"
                                ? COLORS.navyLight
                                : COLORS.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          d={typeIcons[item.type] || icons.settings}
                          size={16}
                          color={
                            item.status === "maintenance"
                              ? COLORS.orange
                              : item.type === "rig"
                                ? COLORS.amber
                                : COLORS.textMuted
                          }
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                          {item.category || item.type}
                          {item.year ? ` | ${item.year}` : ""}
                        </div>
                      </div>
                    </div>

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
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.color }} />
                      {status.label}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.region}</span>
                    {item.rego && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: COLORS.textMuted,
                          background: COLORS.bg,
                          border: `1px solid ${COLORS.border}`,
                          padding: "1px 6px",
                          borderRadius: 4,
                          fontFamily: "monospace",
                        }}
                      >
                        {item.rego}
                      </span>
                    )}
                    {item.division && <DivisionBadge div={item.division} />}
                  </div>

                  {linkedJob && (
                    <div
                      style={{
                        padding: "8px 10px",
                        background: COLORS.bg,
                        borderRadius: 7,
                        marginTop: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: COLORS.textMuted,
                            textTransform: "uppercase",
                          }}
                        >
                          Assigned Job
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, marginTop: 2 }}>
                          {linkedJob.id} | {linkedJob.client}
                        </div>
                      </div>
                      <StatusBadge status={linkedJob.status} />
                    </div>
                  )}

                  {latestInspection && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "7px 10px",
                        background: latestInspection.status === "open" ? COLORS.redLight : COLORS.greenLight,
                        borderRadius: 6,
                        fontSize: 11,
                        color: latestInspection.status === "open" ? "#7F1D1D" : "#065F46",
                      }}
                    >
                      Latest inspection: {formatDate(latestInspection.date)} |{" "}
                      {latestInspection.status === "open"
                        ? `${latestInspection.faults.length} open fault${latestInspection.faults.length === 1 ? "" : "s"}`
                        : "passed"}
                    </div>
                  )}

                  {item.notes && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "6px 10px",
                        background: COLORS.orangeLight,
                        borderRadius: 6,
                        fontSize: 11,
                        color: "#92400E",
                      }}
                    >
                      {item.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedEquipment && (
            <div
              style={{
                background: COLORS.white,
                borderRadius: 14,
                border: `2px solid ${COLORS.amber}`,
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(245,158,11,0.12)",
              }}
            >
              <div
                style={{
                  background: COLORS.navy,
                  padding: "14px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.white }}>
                    {selectedEquipment.name}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                    {selectedEquipment.category || selectedEquipment.type}
                    {selectedEquipment.year ? ` | ${selectedEquipment.year}` : ""}
                    {selectedEquipment.region ? ` | ${selectedEquipment.region}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEquipmentId(null)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  Close
                </button>
              </div>

              <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedEquipmentInspections.length === 0 && (
                  <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                    No inspection history recorded yet.
                  </div>
                )}

                {selectedEquipmentInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                      background: COLORS.bg,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>
                          {formatDate(inspection.date)}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                          {inspection.tech || "Unknown inspector"}
                          {inspection.dueDate ? ` | next due ${formatDate(inspection.dueDate)}` : ""}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 8,
                          color:
                            inspection.status === "open"
                              ? COLORS.red
                              : inspection.status === "pass"
                                ? COLORS.green
                                : COLORS.teal,
                          background:
                            inspection.status === "open"
                              ? COLORS.redLight
                              : inspection.status === "pass"
                                ? COLORS.greenLight
                                : COLORS.tealLight,
                          textTransform: "uppercase",
                        }}
                      >
                        {inspection.status}
                      </span>
                    </div>

                    {inspection.faults?.length > 0 && (
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                        {inspection.faults.map((fault, index) => (
                          <div
                            key={index}
                            style={{
                              padding: "6px 10px",
                              background: COLORS.redLight,
                              borderRadius: 8,
                              fontSize: 12,
                              color: "#7F1D1D",
                            }}
                          >
                            {fault}
                          </div>
                        ))}
                      </div>
                    )}

                    {inspection.notes && (
                      <div style={{ marginTop: 8, fontSize: 12, color: COLORS.textSecondary }}>
                        {inspection.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {plantTab === "inspections" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleInspectionItems.length === 0 && (
            <div
              style={{
                background: COLORS.white,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                padding: "20px",
                color: COLORS.textMuted,
              }}
            >
              No inspections available for the current filters.
            </div>
          )}

          {visibleInspectionItems
            .slice()
            .sort((left, right) => String(right.date).localeCompare(String(left.date)))
            .map((inspection) => {
              const equipmentItem = equipment.find((item) => item.id === inspection.eqId);
              const hasFaults = inspection.faults?.length > 0;
              return (
                <div
                  key={inspection.id}
                  style={{
                    background: COLORS.white,
                    borderRadius: 12,
                    border: `1px solid ${hasFaults ? `${COLORS.red}40` : COLORS.border}`,
                    padding: "14px 18px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>
                        {equipmentItem?.name || inspection.eqId}
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                        Inspected {formatDate(inspection.date)}
                        {inspection.tech ? ` by ${inspection.tech}` : ""}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 20,
                        color: hasFaults ? COLORS.red : COLORS.green,
                        background: hasFaults ? COLORS.redLight : COLORS.greenLight,
                        textTransform: "uppercase",
                      }}
                    >
                      {hasFaults
                        ? `${inspection.faults.length} fault${inspection.faults.length === 1 ? "" : "s"}`
                        : "Pass"}
                    </span>
                  </div>

                  {hasFaults && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      {inspection.faults.map((fault, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "7px 10px",
                            background: COLORS.redLight,
                            borderRadius: 8,
                            fontSize: 12,
                            color: "#7F1D1D",
                          }}
                        >
                          {fault}
                        </div>
                      ))}
                    </div>
                  )}

                  {inspection.notes && (
                    <div style={{ marginTop: 8, fontSize: 12, color: COLORS.textSecondary }}>
                      {inspection.notes}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

function PersonnelView({ staff, plannerJobs, leaveApplications, regionFilter, divisionFilter }) {
  const [personnelTab, setPersonnelTab] = useState("staff");
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const visibleStaff = useMemo(
    () =>
      staff.filter((person) => {
        if (regionFilter !== "all" && person.region !== regionFilter) return false;
        if (person.division && !divisionFilter[person.division]) return false;
        return true;
      }),
    [divisionFilter, regionFilter, staff],
  );

  const staffSummaries = useMemo(
    () =>
      visibleStaff.map((person) => {
        const assignments = plannerJobs.filter((plannerJob) =>
          (plannerJob.personnel ?? []).includes(person.name),
        );
        const activeAssignments = assignments.filter(
          (assignment) => new Date(assignment.end) >= new Date(),
        );
        const nextLeave = leaveApplications
          .filter(
            (leave) =>
              leave.userId === person.id &&
              ["pending", "approved"].includes(leave.status) &&
              new Date(leave.end) >= new Date(),
          )
          .sort((left, right) => String(left.start).localeCompare(String(right.start)))[0];

        return {
          ...person,
          assignments,
          activeAssignments,
          nextLeave,
        };
      }),
    [leaveApplications, plannerJobs, visibleStaff],
  );

  const selectedStaff =
    staffSummaries.find((person) => person.id === selectedStaffId) ?? null;
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
  const firstDayOffset = (monthStart.getDay() + 6) % 7;
  const totalCells = Math.ceil((firstDayOffset + monthEnd.getDate()) / 7) * 7;

  const visibleLeave = leaveApplications.filter((leave) => {
    const person = staff.find((staffMember) => staffMember.id === leave.userId);
    if (!person) return false;
    if (regionFilter !== "all" && person.region !== regionFilter) return false;
    if (person.division && !divisionFilter[person.division]) return false;
    return overlaps(
      leave.start,
      leave.end,
      monthStart.toISOString().slice(0, 10),
      monthEnd.toISOString().slice(0, 10),
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>
          Personnel
        </h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>
          Staffing, planner assignments, and leave visibility
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          background: COLORS.bg,
          padding: 4,
          borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
          alignSelf: "flex-start",
        }}
      >
        {[
          { id: "staff", label: "Staff" },
          { id: "leave", label: "Leave Calendar" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPersonnelTab(tab.id)}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: personnelTab === tab.id ? COLORS.white : "transparent",
              color: personnelTab === tab.id ? COLORS.textPrimary : COLORS.textMuted,
              boxShadow: personnelTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {personnelTab === "staff" && (
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: "0 0 360px", display: "flex", flexDirection: "column", gap: 10 }}>
            {staffSummaries.map((person) => (
              <div
                key={person.id}
                onClick={() => setSelectedStaffId(selectedStaffId === person.id ? null : person.id)}
                style={{
                  background: COLORS.white,
                  borderRadius: 12,
                  border: `2px solid ${selectedStaffId === person.id ? COLORS.amber : COLORS.border}`,
                  padding: "14px 16px",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: COLORS.navyLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.amber }}>
                      {person.initials || initialsFor(person.name)}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>
                        {person.name}
                      </span>
                      {person.division && <DivisionBadge div={person.division} />}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>
                      {person.role || "Staff"}
                      {person.region ? ` | ${person.region}` : ""}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                    {person.activeAssignments.length} active assignment{person.activeAssignments.length === 1 ? "" : "s"}
                  </span>
                  {person.nextLeave && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 8,
                        color: person.nextLeave.status === "pending" ? COLORS.blue : COLORS.green,
                        background:
                          person.nextLeave.status === "pending"
                            ? COLORS.blueLight
                            : COLORS.greenLight,
                      }}
                    >
                      {leaveTypeConfig(person.nextLeave.type).label} {person.nextLeave.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }}>
            {!selectedStaff && (
              <div
                style={{
                  minHeight: 300,
                  background: COLORS.white,
                  borderRadius: 12,
                  border: `1px dashed ${COLORS.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.textMuted,
                }}
              >
                Select a staff member to view assignments and leave
              </div>
            )}

            {selectedStaff && (
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
                    padding: "18px 20px",
                    borderBottom: `1px solid ${COLORS.border}`,
                    background: COLORS.bg,
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary }}>
                    {selectedStaff.name}
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
                    {selectedStaff.role || "Staff"}
                    {selectedStaff.email ? ` | ${selectedStaff.email}` : ""}
                    {selectedStaff.phone ? ` | ${selectedStaff.phone}` : ""}
                  </div>
                </div>

                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: COLORS.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 10,
                      }}
                    >
                      Active Planner Assignments
                    </div>
                    {selectedStaff.activeAssignments.length === 0 && (
                      <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                        No active planner assignments.
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {selectedStaff.activeAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          style={{
                            padding: "12px 14px",
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 10,
                            background: COLORS.bg,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>
                                {assignment.jobId || assignment.label || assignment.client}
                              </div>
                              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>
                                {assignment.client || "Internal"} | {assignment.site || "-"}
                              </div>
                            </div>
                            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                              {formatDate(assignment.start)} - {formatDate(assignment.end)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: COLORS.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 10,
                      }}
                    >
                      Leave Requests
                    </div>
                    {leaveApplications.filter((leave) => leave.userId === selectedStaff.id).length === 0 && (
                      <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                        No leave requests recorded.
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {leaveApplications
                        .filter((leave) => leave.userId === selectedStaff.id)
                        .sort((left, right) => String(right.start).localeCompare(String(left.start)))
                        .map((leave) => {
                          const type = leaveTypeConfig(leave.type);
                          const conflictingAssignments = selectedStaff.assignments.filter((assignment) =>
                            overlaps(assignment.start, assignment.end, leave.start, leave.end),
                          );
                          return (
                            <div
                              key={leave.id}
                              style={{
                                padding: "12px 14px",
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: 10,
                                background: COLORS.bg,
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      padding: "2px 8px",
                                      borderRadius: 8,
                                      color: type.color,
                                      background: `${type.color}20`,
                                    }}
                                  >
                                    {type.label}
                                  </span>
                                  <span style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>
                                    {formatDate(leave.start)} - {formatDate(leave.end)}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: "2px 8px",
                                      borderRadius: 8,
                                      color:
                                        leave.status === "approved"
                                          ? COLORS.green
                                          : leave.status === "pending"
                                            ? COLORS.blue
                                            : COLORS.red,
                                      background:
                                        leave.status === "approved"
                                          ? COLORS.greenLight
                                          : leave.status === "pending"
                                            ? COLORS.blueLight
                                            : COLORS.redLight,
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {leave.status}
                                  </span>
                                </div>
                                <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                                  {leave.days} day{leave.days === 1 ? "" : "s"}
                                </span>
                              </div>

                              {leave.notes && (
                                <div style={{ marginTop: 8, fontSize: 12, color: COLORS.textSecondary }}>
                                  {leave.notes}
                                </div>
                              )}

                              {conflictingAssignments.length > 0 && (
                                <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                                  {conflictingAssignments.map((assignment) => (
                                    <span
                                      key={`${leave.id}-${assignment.id}`}
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "2px 8px",
                                        borderRadius: 8,
                                        color: COLORS.red,
                                        background: COLORS.redLight,
                                      }}
                                    >
                                      Conflict: {assignment.jobId || assignment.label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {personnelTab === "leave" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
              style={{
                width: 32,
                height: 32,
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 7,
                cursor: "pointer",
              }}
            >
              {"<"}
            </button>
            <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, minWidth: 180, textAlign: "center" }}>
              {calendarMonth.toLocaleDateString("en-NZ", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
              style={{
                width: 32,
                height: 32,
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 7,
                cursor: "pointer",
              }}
            >
              {">"}
            </button>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${COLORS.border}` }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  style={{
                    padding: "8px 6px",
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: COLORS.textMuted,
                    textTransform: "uppercase",
                    background: COLORS.bg,
                    borderRight: `1px solid ${COLORS.border}`,
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {Array.from({ length: totalCells }, (_, index) => {
                const dayNumber = index - firstDayOffset + 1;
                const inMonth = dayNumber >= 1 && dayNumber <= monthEnd.getDate();
                if (!inMonth) {
                  return (
                    <div
                      key={index}
                      style={{
                        minHeight: 100,
                        background: "#F9FAFB",
                        borderRight: `1px solid ${COLORS.border}`,
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    />
                  );
                }

                const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNumber);
                const dateStr = date.toISOString().slice(0, 10);
                const dayLeave = visibleLeave.filter((leave) => overlaps(leave.start, leave.end, dateStr, dateStr));

                return (
                  <div
                    key={index}
                    style={{
                      minHeight: 100,
                      padding: "4px 5px",
                      borderRight: `1px solid ${COLORS.border}`,
                      borderBottom: `1px solid ${COLORS.border}`,
                      background: date.getDay() === 0 || date.getDay() === 6 ? "#FAFBFC" : COLORS.white,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 4 }}>
                      {dayNumber}
                    </div>
                    {dayLeave.map((leave) => {
                      const person = staff.find((staffMember) => staffMember.id === leave.userId);
                      const type = leaveTypeConfig(leave.type);
                      return (
                        <div
                          key={`${leave.id}-${dateStr}`}
                          title={`${person?.name || leave.userId} | ${type.label}`}
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: COLORS.white,
                            background: type.color,
                            opacity: leave.status === "pending" ? 0.7 : 1,
                            borderRadius: 4,
                            padding: "2px 5px",
                            marginBottom: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {(person?.initials || initialsFor(person?.name)).slice(0, 2)} {leave.status === "pending" ? "pending" : ""}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            {LEAVE_TYPES.map((type) => (
              <div key={type.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: type.color }} />
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{type.label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS.textMuted, opacity: 0.7 }} />
              <span style={{ fontSize: 12, color: COLORS.textSecondary }}>Pending approval</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ResourcesScreen = ({
  equipment = [],
  inspections = [],
  jobs = [],
  staff = [],
  plannerJobs = [],
  leaveApplications = [],
  subTab = "plant",
  regionFilter = "all",
  divisionFilter = { Water: true, Geotech: true },
}) => {
  if (subTab === "personnel") {
    return (
      <PersonnelView
        staff={staff}
        plannerJobs={plannerJobs}
        leaveApplications={leaveApplications}
        regionFilter={regionFilter}
        divisionFilter={divisionFilter}
      />
    );
  }

  return (
    <PlantView
      equipment={equipment}
      inspections={inspections}
      jobs={jobs}
      regionFilter={regionFilter}
      divisionFilter={divisionFilter}
    />
  );
};

export default ResourcesScreen;
