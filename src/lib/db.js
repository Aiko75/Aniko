import { Pool } from "pg";

let pool;

function normalizeConnectionString(rawUrl) {
  if (!rawUrl) return rawUrl;
  try {
    const url = new URL(rawUrl);
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch {
    return rawUrl;
  }
}

if (!global.pool) {
  const connectionString = normalizeConnectionString(process.env.DATABASE_URL);
  const ssl =
    process.env.PGSSL === "disable" ? false : { rejectUnauthorized: false };

  global.pool = new Pool({
    connectionString,
    ssl,
  });
}

pool = global.pool;

export default pool;
