import React, { useEffect, useMemo, useState } from "react";

import { COLORS } from "../appData.js";

const APP_ROLES = [
  "SuperUser",
  "Administrator",
  "Supervisor",
  "Maintenance",
  "FieldUser",
];

const DIVISIONS = ["Water", "Geotech", "Operations", "Finance", "HSE"];
const REGIONS = ["North", "South"];

function formatDateTime(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString();
}

function roleTone(appRole) {
  switch (appRole) {
    case "SuperUser":
      return { bg: "#FEF3C7", color: "#92400E", border: "#F59E0B" };
    case "Administrator":
      return { bg: "#DBEAFE", color: "#1D4ED8", border: "#60A5FA" };
    case "Supervisor":
      return { bg: "#DCFCE7", color: "#166534", border: "#4ADE80" };
    case "Maintenance":
      return { bg: "#F3E8FF", color: "#7E22CE", border: "#C084FC" };
    default:
      return { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1" };
  }
}

function getLoginState(person) {
  if (person.lockedUntil) return "locked";
  if (person.pendingPasswordPurpose === "invite") return "pending";
  if (person.pendingPasswordPurpose === "reset") return "pending";
  if (person.hasAuthAccount) return person.loginAccountActive ? "enabled" : "disabled";
  return "none";
}

function getLoginLabel(person) {
  switch (getLoginState(person)) {
    case "locked":
      return "Locked";
    case "pending":
      return person.pendingPasswordPurpose === "reset" ? "Reset Pending" : "Invite Pending";
    case "enabled":
      return "Enabled";
    case "disabled":
      return "Disabled";
    default:
      return "No Login";
  }
}

export default function AdminScreen({
  currentUser = null,
  staff = [],
  regionFilter = "all",
  divisionFilter = {},
  onCreateUser,
  onDeleteUser,
  onUpdateUserRole,
  onUpdateUserIdentity,
  onSetUserLoginAccess,
  onInviteUserLogin,
  onResetUserPassword,
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loginFilter, setLoginFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [savingUserId, setSavingUserId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [userDrafts, setUserDrafts] = useState({});
  const [newUser, setNewUser] = useState({
    employeeCode: "",
    fullName: "",
    initials: "",
    roleTitle: "",
    appRole: "FieldUser",
    division: "",
    region: "",
    email: "",
    phone: "",
    username: "",
    enableLogin: true,
  });

  useEffect(() => {
    setUserDrafts(
      Object.fromEntries(
        staff.map((person) => [
          person.dbId,
          {
            employeeCode: person.id ?? "",
            fullName: person.name ?? "",
            initials: person.initials ?? "",
            roleTitle: person.roleTitle ?? person.role ?? "",
            division: person.division ?? "",
            region: person.region ?? "",
            email: person.loginEmail ?? person.email ?? "",
            phone: person.phone ?? "",
            username: person.username ?? "",
          },
        ]),
      ),
    );
  }, [staff]);

  const visibleStaff = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...staff]
      .filter((person) => {
        const draft = userDrafts[person.dbId] ?? {};
        const divisionVisible = person.division ? divisionFilter[person.division] !== false : true;
        const regionVisible = regionFilter === "all" || person.region === regionFilter || !person.region;
        const roleVisible = roleFilter === "all" || person.appRole === roleFilter;
        const loginVisible = loginFilter === "all" || getLoginState(person) === loginFilter;
        const searchVisible =
          !term ||
          [
            draft.fullName ?? person.name,
            draft.employeeCode ?? person.id,
            draft.username ?? person.username,
            draft.roleTitle ?? person.roleTitle ?? person.role,
            person.appRole,
            draft.region ?? person.region,
            draft.division ?? person.division,
            draft.email ?? person.email,
            person.loginEmail,
            draft.phone ?? person.phone,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term));

        return divisionVisible && regionVisible && roleVisible && loginVisible && searchVisible;
      })
      .sort((left, right) => {
        const getValue = (person) => {
          const draft = userDrafts[person.dbId] ?? {};
          switch (sortConfig.key) {
            case "employeeCode":
              return draft.employeeCode ?? person.id ?? "";
            case "name":
              return draft.fullName ?? person.name ?? "";
            case "initials":
              return draft.initials ?? person.initials ?? "";
            case "roleTitle":
              return draft.roleTitle ?? person.roleTitle ?? person.role ?? "";
            case "username":
              return draft.username ?? person.username ?? "";
            case "email":
              return draft.email ?? person.email ?? person.loginEmail ?? "";
            case "phone":
              return draft.phone ?? person.phone ?? "";
            case "division":
              return draft.division ?? person.division ?? "";
            case "region":
              return draft.region ?? person.region ?? "";
            case "appRole":
              return person.appRole ?? "";
            case "login":
              return getLoginLabel(person);
            default:
              return person.name ?? "";
          }
        };

        const leftValue = String(getValue(left)).toLowerCase();
        const rightValue = String(getValue(right)).toLowerCase();
        const comparison = leftValue.localeCompare(rightValue, undefined, {
          numeric: true,
          sensitivity: "base",
        });

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
  }, [divisionFilter, loginFilter, regionFilter, roleFilter, search, sortConfig, staff, userDrafts]);

  const summary = useMemo(
    () =>
      APP_ROLES.map((appRole) => ({
        appRole,
        count: visibleStaff.filter((person) => person.appRole === appRole).length,
      })),
    [visibleStaff],
  );

  async function handleCreateUser() {
    setSavingUserId("new-user");
    setFeedback(null);

    try {
      const result = await onCreateUser(newUser);
      setFeedback({
        type: "success",
        message: result.message,
        setupLink: result.setupLink,
        email: result.email,
        username: result.username,
        tokenExpiresAt: result.tokenExpiresAt,
      });
      setNewUser({
        employeeCode: "",
        fullName: "",
        initials: "",
        roleTitle: "",
        appRole: "FieldUser",
        division: "",
        region: "",
        email: "",
        phone: "",
        username: "",
        enableLogin: true,
      });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleRoleChange(userId, appRole) {
    setSavingUserId(userId);
    setFeedback(null);

    try {
      await onUpdateUserRole(userId, appRole);
      setFeedback({ type: "success", message: "User authority updated." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSavingUserId(null);
    }
  }

  function updateUserDraft(userId, field, value) {
    setUserDrafts((current) => ({
      ...current,
      [userId]: {
        ...(current[userId] ?? {}),
        [field]: value,
      },
    }));
  }

  async function handleUserDetailsSave(userId) {
    setSavingUserId(userId);
    setFeedback(null);

    try {
      await onUpdateUserIdentity(userId, userDrafts[userId] ?? {});
      setFeedback({ type: "success", message: "User details updated." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleDeleteUser(person) {
    const confirmed = window.confirm(
      `Delete ${person.name}? This will deactivate the user and revoke login access, but historical jobs and timesheets will remain linked.`,
    );

    if (!confirmed) return;

    setSavingUserId(person.dbId);
    setFeedback(null);

    try {
      const result = await onDeleteUser(person.dbId);
      setFeedback({ type: "success", message: result.message });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSavingUserId(null);
    }
  }

  async function handlePasswordReset(userId) {
    setSavingUserId(userId);
    setFeedback(null);

    try {
      const result = await onResetUserPassword(userId);
      setFeedback({
        type: "success",
        message: result.message,
        setupLink: result.setupLink,
        email: result.email,
        username: result.username,
        tokenExpiresAt: result.tokenExpiresAt,
      });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleInviteUser(userId) {
    setSavingUserId(userId);
    setFeedback(null);

    try {
      const result = await onInviteUserLogin(userId);
      setFeedback({
        type: "success",
        message: result.message,
        setupLink: result.setupLink,
        email: result.email,
        username: result.username,
        tokenExpiresAt: result.tokenExpiresAt,
      });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleLoginAccessToggle(userId, isActive) {
    setSavingUserId(userId);
    setFeedback(null);

    try {
      const result = await onSetUserLoginAccess(userId, isActive);
      setFeedback({ type: "success", message: result.message });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSavingUserId(null);
    }
  }

  function handleSort(key) {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  function renderSortableHeader(key, label) {
    const active = sortConfig.key === key;
    const marker = active ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

    return (
      <button
        type="button"
        onClick={() => handleSort(key)}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          color: active ? COLORS.amber : COLORS.textSecondary,
          font: "inherit",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          cursor: "pointer",
          textAlign: "left",
          whiteSpace: "nowrap",
        }}
      >
        {label}{marker}
      </button>
    );
  }

  const userTableColumns = "90px 170px 70px 150px 150px 220px 125px 120px 95px 145px 120px 300px";
  const compactInputStyle = {
    width: "100%",
    padding: "7px 8px",
    borderRadius: 7,
    border: `1px solid ${COLORS.border}`,
    fontSize: 12,
    boxSizing: "border-box",
    background: COLORS.white,
  };
  const compactSelectStyle = {
    ...compactInputStyle,
    padding: "7px 8px",
  };
  const compactButtonStyle = {
    padding: "7px 9px",
    borderRadius: 7,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.white,
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>
          Admin
        </h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 14 }}>
          Manage authority roles, login emails, and password resets for authenticated app users.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {summary.map((item) => {
          const tone = roleTone(item.appRole);
          return (
            <div
              key={item.appRole}
              style={{
                background: COLORS.white,
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                padding: "14px 16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {item.appRole}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: tone.color, marginTop: 6 }}>
                {item.count}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          background: COLORS.white,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          padding: 18,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Signed In Authority
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textPrimary, marginTop: 4 }}>
            {currentUser?.name || "Unknown User"}
          </div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>
            {(currentUser?.appRole || "FieldUser")} | {(currentUser?.roleTitle || currentUser?.role || "No title")}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end", maxWidth: 820 }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users, emails, titles..."
            style={{
              width: 280,
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              fontSize: 13,
              background: COLORS.white,
            }}
          >
            <option value="all">All roles</option>
            {APP_ROLES.map((appRole) => (
              <option key={appRole} value={appRole}>
                {appRole}
              </option>
            ))}
          </select>
          <select
            value={loginFilter}
            onChange={(event) => setLoginFilter(event.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              fontSize: 13,
              background: COLORS.white,
            }}
          >
            <option value="all">All logins</option>
            <option value="enabled">Enabled</option>
            <option value="pending">Pending</option>
            <option value="disabled">Disabled</option>
            <option value="locked">Locked</option>
            <option value="none">No login</option>
          </select>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.textMuted, textTransform: "uppercase" }}>
              Global:
            </span>
            <span style={{ fontSize: 11, padding: "4px 8px", borderRadius: 999, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontWeight: 700 }}>
              {regionFilter === "all" ? "All regions" : regionFilter}
            </span>
            {Object.entries(divisionFilter).map(([division, visible]) => (
              <span
                key={division}
                style={{
                  fontSize: 11,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: visible ? COLORS.bg : "#FEF2F2",
                  border: `1px solid ${visible ? COLORS.border : COLORS.red}`,
                  color: visible ? COLORS.textSecondary : COLORS.red,
                  fontWeight: 700,
                }}
              >
                {visible ? division : `${division} hidden`}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: COLORS.white,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          padding: 18,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          display: "grid",
          gap: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>
            New user registration
          </div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
            Create a new SubStrata user, assign their authority, and optionally generate login access immediately.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {[
            ["employeeCode", "Employee code", "EMP-011"],
            ["fullName", "Full name", "Jordan Smith"],
            ["initials", "Initials", "JS"],
            ["roleTitle", "Role title", "Driller"],
            ["email", "Email", "user@drilling.co.nz"],
            ["phone", "Phone", "021 000 0000"],
            ["username", "Username", "JordanSmith"],
          ].map(([key, label, placeholder]) => (
            <label key={key} style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>{label}</span>
              <input
                value={newUser[key]}
                onChange={(event) =>
                  setNewUser((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </label>
          ))}

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>Division</span>
            <select
              value={newUser.division}
              onChange={(event) =>
                setNewUser((current) => ({
                  ...current,
                  division: event.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                background: COLORS.white,
              }}
            >
              <option value="">Unassigned</option>
              {["Water", "Geotech", "Operations", "Finance", "HSE"].map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>Region</span>
            <select
              value={newUser.region}
              onChange={(event) =>
                setNewUser((current) => ({
                  ...current,
                  region: event.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                background: COLORS.white,
              }}
            >
              <option value="">Unassigned</option>
              {["North", "South"].map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>Authority</span>
            <select
              value={newUser.appRole}
              onChange={(event) =>
                setNewUser((current) => ({
                  ...current,
                  appRole: event.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                background: COLORS.white,
              }}
            >
              {APP_ROLES.map((appRole) => (
                <option key={appRole} value={appRole}>
                  {appRole}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: COLORS.textPrimary }}>
          <input
            type="checkbox"
            checked={newUser.enableLogin}
            onChange={(event) =>
              setNewUser((current) => ({
                ...current,
                enableLogin: event.target.checked,
              }))
            }
          />
          Generate app login access now
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleCreateUser}
            disabled={savingUserId === "new-user"}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: COLORS.amber,
              color: COLORS.navy,
              fontSize: 13,
              fontWeight: 800,
              cursor: savingUserId === "new-user" ? "wait" : "pointer",
              opacity: savingUserId === "new-user" ? 0.7 : 1,
            }}
          >
            {savingUserId === "new-user" ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: `1px solid ${feedback.type === "error" ? COLORS.red : COLORS.green}`,
            background: feedback.type === "error" ? COLORS.redLight : "#ECFDF5",
            color: feedback.type === "error" ? COLORS.red : COLORS.green,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <div>{feedback.message}</div>
          {feedback.setupLink && (
            <div style={{ marginTop: 8, fontWeight: 600 }}>
              Password setup link for {feedback.email}:
              <span
                style={{
                  display: "inline-block",
                  marginLeft: 8,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.textPrimary,
                  fontFamily: "Consolas, 'Courier New', monospace",
                }}
              >
                {feedback.setupLink}
              </span>
              {feedback.username && (
                <span style={{ marginLeft: 12, color: COLORS.textSecondary }}>
                  Username: {feedback.username}
                </span>
              )}
              {feedback.tokenExpiresAt && (
                <div style={{ marginTop: 6, color: COLORS.textSecondary, fontWeight: 500 }}>
                  Expires: {new Date(feedback.tokenExpiresAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          background: COLORS.white,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: userTableColumns,
            gap: 10,
            minWidth: 1880,
            padding: "12px 16px",
            background: COLORS.bg,
            borderBottom: `1px solid ${COLORS.border}`,
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <div>{renderSortableHeader("employeeCode", "Code")}</div>
          <div>{renderSortableHeader("name", "Name")}</div>
          <div>{renderSortableHeader("initials", "Init")}</div>
          <div>{renderSortableHeader("roleTitle", "Title")}</div>
          <div>{renderSortableHeader("username", "Username")}</div>
          <div>{renderSortableHeader("email", "Email")}</div>
          <div>{renderSortableHeader("phone", "Phone")}</div>
          <div>{renderSortableHeader("division", "Division")}</div>
          <div>{renderSortableHeader("region", "Region")}</div>
          <div>{renderSortableHeader("appRole", "Authority")}</div>
          <div>{renderSortableHeader("login", "Login")}</div>
          <div>Actions</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {visibleStaff.map((person) => {
            const tone = roleTone(person.appRole);
            const isSaving = savingUserId === person.dbId;
            const draft = userDrafts[person.dbId] ?? {};
            const draftEmail = draft.email ?? "";
            const draftUsername = draft.username ?? "";
            const hasPendingInvite = person.pendingPasswordPurpose === "invite";
            const hasPendingReset = person.pendingPasswordPurpose === "reset";
            const pendingPasswordExpiry = formatDateTime(person.pendingPasswordExpiresAt);
            const lastLoginAt = formatDateTime(person.lastLoginAt);
            const lockedUntil = formatDateTime(person.lockedUntil);
            const loginStatusLines = [];

            if (hasPendingInvite) {
              loginStatusLines.push(
                pendingPasswordExpiry
                  ? `Invite pending until ${pendingPasswordExpiry}`
                  : "Invite pending",
              );
            } else if (hasPendingReset) {
              loginStatusLines.push(
                pendingPasswordExpiry
                  ? `Reset link pending until ${pendingPasswordExpiry}`
                  : "Reset link pending",
              );
            } else if (person.hasAuthAccount) {
              loginStatusLines.push(
                person.loginAccountActive ? "Login enabled" : "Login account exists but is disabled",
              );
            } else {
              loginStatusLines.push("No login account yet");
            }

            if (lastLoginAt) {
              loginStatusLines.push(`Last login ${lastLoginAt}`);
            } else if (person.hasAuthAccount && !hasPendingInvite) {
              loginStatusLines.push("No completed login yet");
            }

            if (lockedUntil) {
              loginStatusLines.push(`Locked until ${lockedUntil}`);
            } else if (person.failedLoginCount > 0) {
              loginStatusLines.push(`Recent failed sign-ins: ${person.failedLoginCount}`);
            }

            return (
              <div
                key={person.dbId}
                style={{
                  display: "grid",
                  gridTemplateColumns: userTableColumns,
                  gap: 10,
                  minWidth: 1880,
                  padding: "10px 16px",
                  borderBottom: `1px solid ${COLORS.border}`,
                  alignItems: "center",
                }}
              >
                <div>
                  <input
                    value={draft.employeeCode ?? ""}
                    disabled={isSaving}
                    onChange={(event) => updateUserDraft(person.dbId, "employeeCode", event.target.value)}
                    placeholder="Employee code"
                    style={compactInputStyle}
                  />
                </div>
                <div>
                  <input
                    value={draft.fullName ?? ""}
                    disabled={isSaving}
                    onChange={(event) => updateUserDraft(person.dbId, "fullName", event.target.value)}
                    placeholder="Full name"
                    style={compactInputStyle}
                  />
                </div>
                <div>
                  <input
                    value={draft.initials ?? ""}
                    disabled={isSaving}
                    onChange={(event) => updateUserDraft(person.dbId, "initials", event.target.value)}
                    placeholder="Initials"
                    style={compactInputStyle}
                  />
                </div>
                <div>
                  <input
                    value={draft.roleTitle ?? ""}
                    disabled={isSaving}
                    onChange={(event) => updateUserDraft(person.dbId, "roleTitle", event.target.value)}
                    placeholder="Role title"
                    style={compactInputStyle}
                  />
                </div>

                <div>
                  <input
                    value={draftUsername}
                    disabled={isSaving}
                    onChange={(event) => updateUserDraft(person.dbId, "username", event.target.value)}
                    placeholder="FirstnameLastname"
                    style={compactInputStyle}
                  />
                </div>
                <div>
                  <input
                    value={draftEmail}
                    disabled={isSaving}
                    onChange={(event) => updateUserDraft(person.dbId, "email", event.target.value)}
                    placeholder="user@company.com"
                    style={compactInputStyle}
                  />
                </div>
                <div>
                  <input
                    value={draft.phone ?? ""}
                    disabled={isSaving}
                    onChange={(event) => updateUserDraft(person.dbId, "phone", event.target.value)}
                    placeholder="Phone"
                    style={compactInputStyle}
                  />
                </div>
                <div>
                  <select
                    value={draft.division ?? ""}
                    disabled={isSaving}
                    onChange={(event) => updateUserDraft(person.dbId, "division", event.target.value)}
                    style={compactSelectStyle}
                  >
                    <option value="">Division</option>
                    {DIVISIONS.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={draft.region ?? ""}
                    disabled={isSaving}
                    onChange={(event) => updateUserDraft(person.dbId, "region", event.target.value)}
                    style={compactSelectStyle}
                  >
                    <option value="">Region</option>
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      padding: "4px 7px",
                      borderRadius: 999,
                      background: tone.bg,
                      color: tone.color,
                      border: `1px solid ${tone.border}`,
                      fontSize: 10,
                      fontWeight: 800,
                      minWidth: 84,
                      textAlign: "center",
                    }}
                  >
                    {person.appRole}
                  </span>
                  <select
                    value={person.appRole || "FieldUser"}
                    disabled={isSaving}
                    onChange={(event) => handleRoleChange(person.dbId, event.target.value)}
                    style={{ ...compactSelectStyle, minWidth: 0 }}
                  >
                    {APP_ROLES.map((appRole) => (
                      <option key={appRole} value={appRole}>
                        {appRole}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div
                    title={loginStatusLines.join("\n")}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 999,
                      background:
                        getLoginState(person) === "enabled"
                          ? "#ECFDF5"
                          : getLoginState(person) === "locked"
                            ? "#FEF2F2"
                            : COLORS.bg,
                      color:
                        getLoginState(person) === "enabled"
                          ? COLORS.green
                          : getLoginState(person) === "locked"
                            ? COLORS.red
                            : COLORS.textSecondary,
                      border: `1px solid ${COLORS.border}`,
                      fontSize: 11,
                      fontWeight: 800,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getLoginLabel(person)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleUserDetailsSave(person.dbId)}
                      disabled={isSaving}
                      style={{ ...compactButtonStyle, cursor: isSaving ? "wait" : "pointer" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleInviteUser(person.dbId)}
                      disabled={isSaving || !draftEmail.trim() || !draftUsername.trim() || person.hasAuthAccount}
                      style={{
                        ...compactButtonStyle,
                        border: "none",
                        background: "#0F766E",
                        color: COLORS.white,
                        cursor: isSaving ? "wait" : "pointer",
                        opacity:
                          isSaving || !draftEmail.trim() || !draftUsername.trim() || person.hasAuthAccount
                            ? 0.6
                            : 1,
                      }}
                    >
                      {hasPendingInvite ? "Reissue Invite" : "Send Invite"}
                    </button>
                    <button
                      onClick={() => handlePasswordReset(person.dbId)}
                      disabled={isSaving || !draftEmail.trim() || !person.hasAuthAccount}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: COLORS.amber,
                        color: COLORS.navy,
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: isSaving ? "wait" : "pointer",
                        opacity: isSaving || !draftEmail.trim() || !person.hasAuthAccount ? 0.6 : 1,
                      }}
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handleLoginAccessToggle(person.dbId, !person.loginAccountActive)}
                      disabled={isSaving || !person.hasAuthAccount}
                      style={{
                        ...compactButtonStyle,
                        border: `1px solid ${COLORS.border}`,
                        background: person.loginAccountActive ? "#FEF2F2" : "#ECFDF5",
                        color: person.loginAccountActive ? COLORS.red : COLORS.green,
                        cursor: isSaving ? "wait" : "pointer",
                        opacity: isSaving || !person.hasAuthAccount ? 0.6 : 1,
                      }}
                    >
                      {person.loginAccountActive ? "Disable Login" : "Enable Login"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(person)}
                      disabled={isSaving || currentUser?.dbId === person.dbId}
                      style={{
                        ...compactButtonStyle,
                        border: "none",
                        background: COLORS.red,
                        color: COLORS.white,
                        cursor: isSaving ? "wait" : "pointer",
                        opacity: isSaving || currentUser?.dbId === person.dbId ? 0.55 : 1,
                      }}
                    >
                      Delete
                    </button>
                </div>
              </div>
            );
          })}

          {visibleStaff.length === 0 && (
            <div style={{ padding: 24, fontSize: 14, color: COLORS.textSecondary }}>
              No users matched the current search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
