import { Hono } from "hono"
import { decode, verify } from "hono/jwt"

import { db } from "../db/index.js"
import { eq } from "drizzle-orm"
import {
  emailVerifications,
  refreshTokens,
  users,
  type User,
} from "../db/schema"
import arcjet, { validateEmail } from "@arcjet/node"
import { sendEmail } from "../../lib/email.js"
import { hash, compare } from "bcryptjs"

import {
  findUserByEmail,
  findUserById,
  generateTokens,
  generateVerificationToken,
} from "../../lib/utility.js"
import { authMiddleware } from "../../middleware/middleware.js"

const authRouter = new Hono()

// const aj = arcjet({
//   key: process.env.ARCJET_KEY!,
//   rules: [
//     validateEmail({
//       mode: "LIVE",
//       deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
//     }),
//   ],
// })

authRouter.post("/register", async (c) => {
  const { name, email, password, role } = await c.req.json()
  try {
    // const headers = Object.fromEntries(c.req.raw.headers.entries())
    // const decision = await aj.protect(headers, { email })
    // if (decision.isDenied()) {
    //   return c.json({ message: "Disposable email not allowed!" }, 400)
    // }

    const isUserExist = await findUserByEmail(email)
    if (isUserExist) {
      return c.json({ message: "Email already exists!" }, 400)
    }

    const hashedPassword = await hash(password, 10)
    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      })
      .returning({ id: users.id })

    const verificationToken = await generateVerificationToken(user.id)
    await db.insert(emailVerifications).values({
      token: verificationToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
    })

    const { accessToken, refreshToken } = await generateTokens(user)

    // sendEmail(email, verificationToken, "activate")
    return c.json({
      success: true,
      accessToken,
      refreshToken,
      message: "User registered successfully. Verify your email!",
    })
  } catch (err) {
    return c.json(
      { message: err instanceof Error ? err.message : "Something went wrong!" },
      500
    )
  }
})

authRouter.get("/verify-email", async (c) => {
  const token = c.req.query("token")
  if (!token) return c.json({ message: "Invalid verification link!" }, 400)

  try {
    const decoded = decode(token)
    const verification = await db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.token, token),
    })
    if (!verification || verification.expiresAt < new Date()) {
      return c.json({ message: "Invalid or expired verification link!" }, 400)
    }

    await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, decoded.payload.userId as string))
    await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.id, verification.id))

    return c.json({ message: "Email verified successfully!" })
  } catch {
    return c.json({ message: "Invalid or expired verification link!" }, 400)
  }
})

authRouter.post("/login", async (c) => {
  const { email, password } = await c.req.json()
  const user = await findUserByEmail(email)
  if (!user) {
    return c.json({ message: "User Not Found!" }, 401)
  }

  const isPasswordValid = await compare(password, user.password)
  if (!isPasswordValid) {
    return c.json({ message: "Invalid credentials!" }, 401)
  }
  if (!user.isVerified) {
    return c.json(
      { message: "Please verify your email before logging in!" },
      403
    )
  }

  const { accessToken, refreshToken } = await generateTokens(user)

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
  })

  return c.json({
    message: "Login successful!",
    accessToken,
    refreshToken,
  })
})

authRouter.post("/refresh-token", async (c) => {
  try {
    const authHeader = c.req.header("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ message: "Refresh token required!" }, 401)
    }

    const refreshToken = authHeader.split(" ")[1]
    if (!refreshToken) return c.json({ message: "Invalid token format!" }, 401)

    const storedToken = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, refreshToken),
    })

    console.log({ storedToken, refreshToken })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return c.json({ message: "Invalid or expired refresh token!" }, 401)
    }

    const user = await findUserById(storedToken.userId!)
    if (!user) return c.json({ message: "User not found!" }, 404)

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user
    )

    await db.transaction(async (trx) => {
      await trx
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, storedToken.userId!))

      await trx.insert(refreshTokens).values({
        userId: storedToken.userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
    })

    return c.json({ accessToken, refreshToken: newRefreshToken })
  } catch (error) {
    console.error("Error refreshing token:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

authRouter.post("/resend-verification", async (c) => {
  const { email } = await c.req.json()
  if (!email) return c.json({ message: "Email is required!" }, 400)

  const user = await findUserByEmail(email)
  if (!user) return c.json({ message: "User not found!" }, 404)

  if (user.isVerified)
    return c.json({ message: "Email is already verified!" }, 400)

  await db
    .delete(emailVerifications)
    .where(eq(emailVerifications.userId, user.id))

  const newVerificationToken = await generateVerificationToken(user.id)
  await db.insert(emailVerifications).values({
    token: newVerificationToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  })

  sendEmail(email, newVerificationToken, "activate")
  return c.json({ message: "New verification email sent!" })
})

authRouter.post("/logout", async (c) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Authorization header is required!" }, 401)
  }

  const refreshToken = authHeader.split(" ")[1]
  if (!refreshToken) {
    return c.json({ message: "Invalid token format!" }, 401)
  }

  try {
    const existingToken = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken))
      .execute()

    if (existingToken.length === 0) {
      return c.json({ message: "Token not found or already deleted!" }, 404)
    }

    const deletedToken = await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken))
      .returning()

    if (deletedToken.length === 0) {
      return c.json({ message: "Failed to delete token!" }, 500)
    }

    return c.json({ message: "Logout successful!" })
  } catch (error) {
    console.error("Error during logout:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default authRouter
