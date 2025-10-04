// Centralized environment variable handling

export const ENV = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  NODE_ENV: process.env.NODE_ENV || "development",
}

function assertEnv() {
  const missing: string[] = []
  if (!ENV.DATABASE_URL) missing.push("DATABASE_URL")
  if (!ENV.JWT_SECRET) missing.push("JWT_SECRET")
  if (missing.length) {
    // Fail fast in production; warn in dev
    const message = `Missing required env vars: ${missing.join(", ")}`
    if (ENV.NODE_ENV === "production") {
      throw new Error(message)
    } else {
      console.warn("[env] " + message)
    }
  }
}

assertEnv()
