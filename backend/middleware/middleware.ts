import type { MiddlewareHandler } from "hono"
import { verify } from "hono/jwt"
import { db } from "../src/db/index.js"
import { users } from "../src/db/schema"
import { eq } from "drizzle-orm"

const JWT_SECRET = process.env.JWT_SECRET!

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization")
  if (!authHeader) {
    return c.json({ message: "Unauthorized!" }, 401)
  }

  const token = authHeader.split(" ")[1]
  if (!token) {
    return c.json({ message: "Invalid token format!" }, 401)
  }

  try {
    const payload = await verify(token, JWT_SECRET)
    if (!payload || !payload.userId) {
      return c.json({ message: "Invalid token!" }, 401)
    }

    const user = await db.query.users.findFirst({
      where: (u) => eq(u.id, payload.userId as string),
      columns: { id: true, email: true, role: true, isVerified: true },
    })

    // if (user!.role !== "admin") {
    //   return c.json({ message: "Access denied: insufficient permissions" }, 403)
    // }

    c.set("user", user)

    await next() 
  } catch (err) {
    return c.json({ message: "Invalid or expired token!" }, 401)
  }
}
