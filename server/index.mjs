import express from "express";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  createUserAccount,
  createEstimate,
  createJob,
  getBootstrapData,
  inviteUserLoginAccess,
  resetUserPassword,
  setUserLoginAccess,
  updateTimesheetStatus,
  updateSupplierInvoiceStatus,
  updateUserAuthority,
  updateUserIdentity,
} from "./repository.mjs";
import {
  clearSessionCookie,
  completePasswordSetup,
  getPasswordTokenPreview,
  loginWithPassword,
  requireAuth,
  revokeSession,
  setSessionCookie,
} from "./auth.mjs";
import { closePool } from "./db.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const distDir = path.join(repoRoot, "dist");

const app = express();

app.use(express.json({ limit: "2mb" }));

function getAuditContext(req) {
  const forwardedForHeader = req.headers["x-forwarded-for"];
  const forwardedFor = Array.isArray(forwardedForHeader)
    ? forwardedForHeader[0]
    : forwardedForHeader;
  const ipAddress = String(
    forwardedFor?.split(",")[0] || req.socket?.remoteAddress || req.ip || "",
  ).trim() || null;
  const userAgent = String(req.headers["user-agent"] || "").trim() || null;

  return {
    ipAddress,
    userAgent,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/health.txt", (_req, res) => {
  res.type("text/plain").send("ok");
});

app.get("/api/session", requireAuth, async (req, res) => {
  res.json({
    authenticated: true,
    user: req.auth.user,
    expiresAt: req.auth.expiresAt,
  });
});

app.post("/api/session/login", async (req, res) => {
  try {
    const session = await loginWithPassword(
      req.body.username ?? req.body.email,
      req.body.password,
      getAuditContext(req),
    );
    setSessionCookie(res, session.sessionToken, session.expiresAt);
    res.status(201).json({
      authenticated: true,
      user: session.user,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    res.status(error.statusCode ?? 401).json({ error: error.message });
  }
});

app.post("/api/password-links/validate", async (req, res) => {
  try {
    const result = await getPasswordTokenPreview(req.body?.token, getAuditContext(req));
    res.json(result);
  } catch (error) {
    res.status(error.statusCode ?? 400).json({ error: error.message });
  }
});

app.post("/api/password-links/complete", async (req, res) => {
  try {
    const result = await completePasswordSetup(
      req.body?.token,
      req.body?.password,
      getAuditContext(req),
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode ?? 400).json({ error: error.message });
  }
});

app.delete("/api/session/logout", requireAuth, async (req, res) => {
  await revokeSession(req.auth.sessionId, getAuditContext(req));
  clearSessionCookie(res);
  res.status(204).end();
});

app.get("/api/bootstrap", requireAuth, async (req, res) => {
  try {
    const data = await getBootstrapData(req.auth.user.dbId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/jobs", requireAuth, async (req, res) => {
  try {
    const job = await createJob(req.body, req.auth.user);
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/estimates", requireAuth, async (req, res) => {
  try {
    const estimate = await createEstimate(req.body, req.auth.user);
    res.status(201).json(estimate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/supplier-invoices/:id/status", requireAuth, async (req, res) => {
  try {
    const invoice = await updateSupplierInvoiceStatus(
      req.params.id,
      req.body.status,
      req.auth.user,
    );
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/timesheets/:id/status", requireAuth, async (req, res) => {
  try {
    const timesheet = await updateTimesheetStatus(
      req.params.id,
      req.body.action,
      req.auth.user,
    );
    res.json(timesheet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/users/:id/role", requireAuth, async (req, res) => {
  try {
    const user = await updateUserAuthority(
      req.params.id,
      req.body.appRole,
      req.auth.user,
    );
    res.json(user);
  } catch (error) {
    res.status(error.statusCode ?? 400).json({ error: error.message });
  }
});

app.post("/api/users", requireAuth, async (req, res) => {
  try {
    const result = await createUserAccount(req.body, req.auth.user, getAuditContext(req));
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode ?? 400).json({ error: error.message });
  }
});

app.patch("/api/users/:id", requireAuth, async (req, res) => {
  try {
    const user = await updateUserIdentity(
      req.params.id,
      req.body,
      req.auth.user,
    );
    res.json(user);
  } catch (error) {
    res.status(error.statusCode ?? 400).json({ error: error.message });
  }
});

app.patch("/api/users/:id/login-access", requireAuth, async (req, res) => {
  try {
    const result = await setUserLoginAccess(
      req.params.id,
      req.body.isActive,
      req.auth.user,
      getAuditContext(req),
    );
    res.json(result);
  } catch (error) {
    res.status(error.statusCode ?? 400).json({ error: error.message });
  }
});

app.post("/api/users/:id/login-invite", requireAuth, async (req, res) => {
  try {
    const result = await inviteUserLoginAccess(
      req.params.id,
      req.auth.user,
      getAuditContext(req),
    );
    res.json(result);
  } catch (error) {
    res.status(error.statusCode ?? 400).json({ error: error.message });
  }
});

app.post("/api/users/:id/reset-password", requireAuth, async (req, res) => {
  try {
    const result = await resetUserPassword(
      req.params.id,
      req.auth.user,
      getAuditContext(req),
    );
    res.json(result);
  } catch (error) {
    res.status(error.statusCode ?? 400).json({ error: error.message });
  }
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      next();
      return;
    }

    res.sendFile(path.join(distDir, "index.html"));
  });
}

const port = Number(process.env.PORT || 3000);

const server = app.listen(port, () => {
  console.log(`SubStrata server listening on port ${port}`);
});

async function shutdown() {
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
