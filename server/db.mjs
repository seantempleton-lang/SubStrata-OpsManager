import pg from "pg";

const { Pool } = pg;
// PostgreSQL DATE is a calendar value, not an instant in the API host timezone.
pg.types.setTypeParser(1082, value => value);

const ssl =
  process.env.PGSSLMODE === "require"
    ? { rejectUnauthorized: false }
    : undefined;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function closePool() {
  await pool.end();
}
