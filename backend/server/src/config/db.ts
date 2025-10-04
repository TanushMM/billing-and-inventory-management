import { Pool } from "pg"
import { ENV } from "./env.js"

// const sslEnabled = process.env.PGSSLMODE === "require" || /neon\.tech|render\.com|herokuapp\.com/.test(ENV.DATABASE_URL)

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  // ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

export async function healthcheckDB() {
  const res = await pool.query("select 1 as ok")
  return res.rows[0]?.ok === 1
}
