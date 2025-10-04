// Augment Express Request with authenticated user
import "express"

export interface AuthUser {
  biller_id: number
  username: string
  full_name: string
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser
  }
}
