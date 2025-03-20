import type { MiddlewareHandler } from "hono"
import { verify } from "hono/jwt"
import { db } from "../src/db/index.js"
import { users } from "../src/db/schema"
import { eq } from "drizzle-orm"

const JWT_SECRET = process.env.JWT_SECRET!

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization")
  if (!authHeader) {
    return c.json(
      { message: "Unauthorized: No authorization header provided" },
      401
    )
  }

  const token = authHeader.split(" ")[1]
  if (!token) {
    return c.json({ message: "Unauthorized: Invalid token format" }, 401)
  }

  try {
    const payload = await verify(token, process.env.JWT_SECRET!)

    if (!payload || !payload.userId) {
      return c.json({ message: "Unauthorized: Invalid token payload" }, 401)
    }

    const user = await db.query.users.findFirst({
      where: (u) => eq(u.id, payload.userId as string),
      columns: { id: true, email: true, role: true, isVerified: true },
    })
    if (!user) {
      return c.json({ message: "Unauthorized: User not found" }, 401)
    }

    c.set("user", user)

    await next()
  } catch (err) {
    console.error("JWT Verification Error:", err)
    return c.json({ message: "Unauthorized: Invalid or expired token" }, 401)
  }
}
