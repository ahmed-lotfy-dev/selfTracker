import { db } from "../src/db/index.js"
import { eq } from "drizzle-orm"
import { sign } from "jsonwebtoken"
import { refreshTokens, users } from "../src/db/schema"

interface TokenPayload {
  id: string
  userName: string
  email: string
  userId: string
  role: string
  exp: number
}

export async function generateTokens(user: any) {
  const payload: TokenPayload = {
    id: user.id,
    userName: user.name,
    email: user.email,
    userId: user.id,
    role: user.role,
    exp: Math.floor(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
  }
  const accessToken = await sign(payload, process.env.JWT_SECRET!)

  const refreshToken = crypto.randomUUID()

  return { accessToken, refreshToken }
}

export function generateVerificationToken(userId: string) {
  return sign(
    {
      userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    process.env.JWT_SECRET!
  )
}

export async function findUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  })
}

export async function findUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  })
}
