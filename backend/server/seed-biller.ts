// Seed an initial biller into the database.
// Usage via package.json script: pnpm --filter billing-inventory-backend seed:biller
import "dotenv/config"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL")
  process.exit(1)
}

const username = process.env.SEED_BILLER_USERNAME
const password = process.env.SEED_BILLER_PASSWORD
const fullName = process.env.SEED_BILLER_FULLNAME

if (!username || !password || !fullName) {
  console.error("Please set SEED_BILLER_USERNAME, SEED_BILLER_PASSWORD, SEED_BILLER_FULLNAME environment variables.")
  process.exit(1)
}

async function main() {
  const pool = new Pool({ 
    connectionString: DATABASE_URL
  })
  try {
    const hash = await bcrypt.hash(password, 10)
    const uuid = randomUUID()
    const { rows } = await pool.query(
      `INSERT INTO billers (biller_id ,username, password_hash, full_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING biller_id, username, full_name, created_at`,
      [uuid, username, hash, fullName],
    )
    console.log("[seed] upserted biller:", rows[0])
  } finally {
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
