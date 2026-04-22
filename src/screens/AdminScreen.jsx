import React, { useEffect, useMemo, useState } from "react";

import { COLORS } from "../appData.js";

const APP_ROLES = [
  "SuperUser",
  "Administrator",
  "Supervisor",
  "Maintenance",
  "FieldUser",
];

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

export default function AdminScreen({
  currentUser = null,
  staff = [],
  onUpdateUserRole,
  onUpdateUserIdentity,
  onResetUserPassword,
}) {
  const [search, setSearch] = useState("");
  const [savingUserId, setSavingUserId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [emailDrafts, setEmailDrafts] = useState({});
  const [usernameDrafts, setUsernameDrafts] = useState({});

  useEffect(() => {
    setEmailDrafts(
      Object.fromEntries(
        staff.map((person) => [
          person.dbId,
          person.loginEmail ?? person.email ?? "",
        ]),
      ),
    );
    setUsernameDrafts(
      Object.fromEntries(
        staff.map((person) => [
          person.dbId,
          person.username ?? "",
        ]),
      ),
    );
  }, [staff]);

  const visibleStaff = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...staff]
      .filter((person) => {
        if (!term) return true;
        return [
          person.name,
          person.id,
          person.username,
          person.roleTitle ?? person.role,
          person.appRole,
          person.region,
          person.division,
          person.email,
          person.loginEmail,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [search, staff]);

  const summary = useMemo(
    () =>
      APP_ROLES.map((appRole) => ({
        appRole,
        count: staff.filter((person) => person.appRole === appRole).length,
      })),
    [staff],
  );

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

  async function handleEmailSave(userId) {
    setSavingUserId(userId);
    setFeedback(null);

    try {
      await onUpdateUserIdentity(userId, {
        email: emailDrafts[userId] ?? "",
        username: usernameDrafts[userId] ?? "",
      });
      setFeedback({ type: "success", message: "User login details updated." });
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
        password: result.password,
        email: result.email,
      });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSavingUserId(null);
    }
  }

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

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users, emails, titles, divisions, roles..."
          style={{
            width: 360,
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
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
          {feedback.password && (
            <div style={{ marginTop: 8, fontWeight: 600 }}>
              Temporary password for {feedback.email}:
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
                {feedback.password}
              </span>
              {feedback.username && (
                <span style={{ marginLeft: 12, color: COLORS.textSecondary }}>
                  Username: {feedback.username}
                </span>
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
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 0.85fr 0.8fr 2.2fr 1.2fr",
            gap: 0,
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
          <div>User</div>
          <div>Title</div>
          <div>Division</div>
          <div>Region</div>
          <div>Login Access</div>
          <div>Authority</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {visibleStaff.map((person) => {
            const tone = roleTone(person.appRole);
            const isSaving = savingUserId === person.dbId;
            const draftEmail = emailDrafts[person.dbId] ?? "";

            return (
              <div
                key={person.dbId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr 0.85fr 0.8fr 2.2fr 1.2fr",
                  gap: 0,
                  padding: "14px 16px",
                  borderBottom: `1px solid ${COLORS.border}`,
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>
                    {person.name}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                    {person.id}
                  </div>
                </div>

                <div style={{ fontSize: 13, color: COLORS.textPrimary }}>
                  {person.roleTitle || person.role || "Unassigned"}
                </div>

                <div style={{ fontSize: 13, color: person.division ? COLORS.textPrimary : COLORS.textMuted }}>
                  {person.division || "-"}
                </div>

                <div style={{ fontSize: 13, color: person.region ? COLORS.textPrimary : COLORS.textMuted }}>
                  {person.region || "-"}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 12 }}>
                  <input
                    value={usernameDrafts[person.dbId] ?? ""}
                    disabled={isSaving}
                    onChange={(event) =>
                      setUsernameDrafts((current) => ({
                        ...current,
                        [person.dbId]: event.target.value,
                      }))
                    }
                    placeholder="FirstnameLastname"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.border}`,
                      fontSize: 12,
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    value={draftEmail}
                    disabled={isSaving}
                    onChange={(event) =>
                      setEmailDrafts((current) => ({
                        ...current,
                        [person.dbId]: event.target.value,
                      }))
                    }
                    placeholder="user@company.com"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.border}`,
                      fontSize: 12,
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleEmailSave(person.dbId)}
                      disabled={isSaving}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: `1px solid ${COLORS.border}`,
                        background: COLORS.white,
                        color: COLORS.textPrimary,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: isSaving ? "wait" : "pointer",
                      }}
                    >
                      Save Email
                    </button>
                    <button
                      onClick={() => handlePasswordReset(person.dbId)}
                      disabled={isSaving || !draftEmail.trim()}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: COLORS.amber,
                        color: COLORS.navy,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: isSaving ? "wait" : "pointer",
                        opacity: isSaving || !draftEmail.trim() ? 0.6 : 1,
                      }}
                    >
                      New Password
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                    {person.hasAuthAccount ? "Username and password enabled" : "No login account yet"}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: tone.bg,
                      color: tone.color,
                      border: `1px solid ${tone.border}`,
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 94,
                      textAlign: "center",
                    }}
                  >
                    {person.appRole}
                  </span>
                  <select
                    value={person.appRole || "FieldUser"}
                    disabled={isSaving}
                    onChange={(event) => handleRoleChange(person.dbId, event.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.border}`,
                      fontSize: 12,
                      background: COLORS.white,
                    }}
                  >
                    {APP_ROLES.map((appRole) => (
                      <option key={appRole} value={appRole}>
                        {appRole}
                      </option>
                    ))}
                  </select>
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
