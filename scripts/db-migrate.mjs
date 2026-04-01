import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import pg from "pg";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const migrationsDir = path.join(repoRoot, "db");
const command = process.argv[2] ?? "up";

const HELP_TEXT = `
Usage:
  npm run db:migrate
  npm run db:migrate:status
  npm run db:migrate:help

Direct:
  node scripts/db-migrate.mjs up
  node scripts/db-migrate.mjs status

Environment:
  DATABASE_URL must point to your PostgreSQL database.
`;

function isMigrationFile(name) {
  return /^\d+_.+\.sql$/i.test(name);
}

async function getMigrationFiles() {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && isMigrationFile(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function checksumFor(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function ensureMigrationsTable(client) {
  await client.query(`
    create table if not exists schema_migrations (
      id bigserial primary key,
      filename text not null unique,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `);
}

async function readMigration(filename) {
  const fullPath = path.join(migrationsDir, filename);
  const sql = await fs.readFile(fullPath, "utf8");
  return {
    filename,
    sql,
    checksum: checksumFor(sql),
  };
}

async function getAppliedMigrations(client) {
  const result = await client.query(
    "select filename, checksum, applied_at from schema_migrations order by filename asc",
  );
  return new Map(result.rows.map((row) => [row.filename, row]));
}

async function printStatus(client) {
  const files = await getMigrationFiles();
  const applied = await getAppliedMigrations(client);

  if (files.length === 0) {
    console.log("No migration files found in db/.");
    return;
  }

  for (const filename of files) {
    const migration = await readMigration(filename);
    const appliedRow = applied.get(filename);

    if (!appliedRow) {
      console.log(`[pending] ${filename}`);
      continue;
    }

    if (appliedRow.checksum !== migration.checksum) {
      console.log(`[changed] ${filename}`);
      continue;
    }

    console.log(`[applied] ${filename} at ${appliedRow.applied_at.toISOString()}`);
  }
}

async function applyMigrations(client) {
  const files = await getMigrationFiles();
  const applied = await getAppliedMigrations(client);

  if (files.length === 0) {
    console.log("No migration files found in db/.");
    return;
  }

  for (const filename of files) {
    const migration = await readMigration(filename);
    const appliedRow = applied.get(filename);

    if (appliedRow && appliedRow.checksum === migration.checksum) {
      console.log(`Skipping ${filename} (already applied).`);
      continue;
    }

    if (appliedRow && appliedRow.checksum !== migration.checksum) {
      throw new Error(
        `Migration ${filename} has changed since it was applied. Create a new migration instead of editing old ones.`,
      );
    }

    console.log(`Applying ${filename}...`);
    await client.query("begin");

    try {
      await client.query(migration.sql);
      await client.query(
        "insert into schema_migrations (filename, checksum) values ($1, $2)",
        [migration.filename, migration.checksum],
      );
      await client.query("commit");
      console.log(`Applied ${filename}.`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }

  console.log("Migration run complete.");
}

async function main() {
  if (command === "--help" || command === "-h" || command === "help") {
    console.log(HELP_TEXT.trim());
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const client = new Client({
    connectionString,
    ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
  });

  await client.connect();

  try {
    await ensureMigrationsTable(client);

    if (command === "status") {
      await printStatus(client);
      return;
    }

    if (command === "up") {
      await applyMigrations(client);
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
