import React, { useState } from "react";

import { COLORS } from "../appData.js";

export default function LoginScreen({
  onLogin,
  submitting = false,
  error = null,
}) {
  const [username, setUsername] = useState("SeanTempleton");
  const [password, setPassword] = useState("SubStrata!2026");

  async function handleSubmit(event) {
    event.preventDefault();
    await onLogin(username, password);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top left, rgba(245,158,11,0.18), transparent 28%), linear-gradient(135deg, #0F1E2E 0%, #172840 55%, #1E3448 100%)",
        padding: 24,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Barlow+Condensed:wght@700;800&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.98)",
          borderRadius: 20,
          padding: "28px 30px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: COLORS.navy,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.amber }}>
              S
            </span>
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 800, color: COLORS.navy, lineHeight: 1 }}>
              <span style={{ color: COLORS.amber }}>Sub</span>Strata
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>
              Operations Login
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-0.03em" }}>
            Sign In
          </h1>
          <p style={{ margin: "8px 0 0", color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.6 }}>
            Your workspace is now session-backed. Sign in to resolve the authenticated app user and load PostgreSQL data.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              style={{
                padding: "11px 13px",
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              style={{
                padding: "11px 13px",
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </label>

          {error && (
            <div
              style={{
                padding: "11px 12px",
                borderRadius: 10,
                background: COLORS.redLight,
                border: `1px solid ${COLORS.red}`,
                color: COLORS.red,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 6,
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: COLORS.amber,
              color: COLORS.navy,
              fontSize: 14,
              fontWeight: 800,
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.8 : 1,
            }}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            marginTop: 18,
            padding: "12px 14px",
            borderRadius: 12,
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            fontSize: 12,
            color: COLORS.textSecondary,
            lineHeight: 1.6,
          }}
        >
          Demo accounts:
          <div><strong>Sean:</strong> `SeanTempleton`</div>
          <div><strong>Tracey:</strong> `TraceyFlatman`</div>
          <div><strong>Tom:</strong> `TomLubbe`</div>
          <div><strong>Greg:</strong> `GregCossar`</div>
          <div><strong>Password:</strong> `SubStrata!2026`</div>
        </div>
      </div>
    </div>
  );
}
