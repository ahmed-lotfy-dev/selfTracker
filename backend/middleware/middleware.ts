import type { MiddlewareHandler } from "hono"
import { verify } from "jsonwebtoken"
import { db } from "../src/db/index.js"
import { users } from "../src/db/schema"
import { eq } from "drizzle-orm"

const JWT_SECRET = process.env.JWT_SECRET!

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: Missing token" }, 401)
    }

    const token = authHeader.split(" ")[1]
    const payload = verify(token, JWT_SECRET)

    if (!payload.id) {
      console.log("🚨 Invalid Token Payload:", payload)
      return c.json({ error: "Unauthorized: Invalid token data" }, 401)
    }

    c.set("user", payload)
    await next()
  } catch (error) {
    console.error("🚨 Auth Middleware Error:", error)
    return c.json({ error: "Invalid or expired token" }, 401)
  }
}
