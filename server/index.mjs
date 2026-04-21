import express from "express";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  createEstimate,
  createJob,
  getBootstrapData,
  updateSupplierInvoiceStatus,
} from "./repository.mjs";
import { closePool } from "./db.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const distDir = path.join(repoRoot, "dist");

const app = express();

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/bootstrap", async (_req, res) => {
  try {
    const data = await getBootstrapData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/jobs", async (req, res) => {
  try {
    const job = await createJob(req.body);
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/estimates", async (req, res) => {
  try {
    const estimate = await createEstimate(req.body);
    res.status(201).json(estimate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/supplier-invoices/:id/status", async (req, res) => {
  try {
    const invoice = await updateSupplierInvoiceStatus(
      req.params.id,
      req.body.status,
      req.body.currentUserName,
    );
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  app.get("*", (req, res, next) => {
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
