import { Hono } from "hono"
import { db } from "../db/index.js"
import { emailVerifications, userGoals, users } from "../db/schema"
import { and, eq, gt, is, isNotNull } from "drizzle-orm"
import { authMiddleware } from "../../middleware/middleware.js"
import { sign, verify, decode } from "hono/jwt"
import { sendEmail } from "../../lib/email.js"
import { hash, compare } from "bcryptjs"
import { randomBytes } from "crypto"
import {
  findUserByEmail,
  generateVerificationToken,
} from "../../lib/utility.js"

const userRouter = new Hono()

userRouter.use(authMiddleware)

userRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (user.role !== "admin") {
    return c.json({ message: "Unauthorized" }, 401)
  }
  const userList = await db.query.users.findMany()
  return c.json(userList)
})

userRouter.get("/me", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id as string),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        weight: true,
        height: true,
        unitSystem: true,
        currency: true,
        income: true,
      },
    })

    if (!dbUser) {
      return c.json(
        { success: false, message: "User not found in the database" },
        404
      )
    }

    return c.json({ success: true, user: dbUser })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return c.json({ success: false, message: "Internal server error" }, 500)
  }
})

userRouter.patch("/:id", async (c) => {
  const { id, name, email, role } = await c.req.json()
  try {
    if (!id) {
      throw new Error("User ID is required")
    }

    const updatedUser = await db
      .update(users)
      .set({ name, email, role })
      .where(eq(users.id, id))
      .returning()

    if (!updatedUser.length) {
      return c.json({ message: "User not found" }, 404)
    }
    return c.json({
      success: "true",
      message: "User updated successfully",
      user: updatedUser[0],
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return c.json({ success: "false", message: "Error updating user" }, 500)
  }
})

userRouter.get("/check-verification", async (c) => {
  try {
    const user = c.get("user" as any)
    if (!user) {
      return c.json({ message: "Unauthorized: User not found" }, 401)
    }
    if (!user.isVerified) {
      return c.json(
        { message: "User is not verified,please verify your email" },
        401
      )
    }

    return c.json({
      sucess: "true",
      message: "User is verified",
      isVerified: user.isVerified,
    })
  } catch (err) {
    console.error("JWT Verification Error:", err)
    return c.json({ message: "Unauthorized: Invalid or expired token" }, 401)
  }
})

userRouter.post("/resend-verification", async (c) => {
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
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
  })

  sendEmail(email, newVerificationToken, "activate")
  return c.json({ message: "New verification email sent!" })
})

userRouter.patch("/onboarding", async (c) => {
  try {
    const { userId, weight, height, unitSystem, currency, income } =
      await c.req.json()

    if (!userId || !weight || !height || !unitSystem || !currency || !income) {
      return c.json({ success: false, message: "All fields are required" }, 400)
    }

    if (!["metric", "imperial"].includes(unitSystem)) {
      return c.json(
        {
          success: false,
          message: "Invalid unit system. Use 'metric' or 'imperial'.",
        },
        400
      )
    }

    const userExists = await db.select().from(users).where(eq(users.id, userId))
    if (!userExists.length) {
      return c.json({ success: false, message: "User not found" }, 404)
    }

    const updatedUser = await db
      .update(users)
      .set({ weight, height, unitSystem, currency, income })
      .where(eq(users.id, userId))
      .returning()

    return c.json({
      success: true,
      message: "Onboarding completed successfully",
      user: updatedUser[0],
    })
  } catch (error) {
    console.error("Error during onboarding:", error)
    return c.json({ success: false, message: "Internal server error" }, 500)
  }
})

userRouter.post("/goals", async (c) => {
  try {
    const user = c.get("user" as any)
    const { goalType, targetValue, deadline } = await c.req.json()

    if (!goalType || !targetValue || !deadline) {
      return c.json({ success: false, message: "All fields are required" }, 400)
    }

    const validGoalTypes = ["loseWeight", "gainWeight", "bodyFat", "muscleMass"]
    if (!validGoalTypes.includes(goalType)) {
      return c.json(
        {
          success: false,
          message: `Invalid goal type. Use one of: ${validGoalTypes.join(
            ", "
          )}`,
        },
        400
      )
    }

    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
    if (!userExists.length) {
      return c.json({ success: false, message: "User not found" }, 404)
    }

    const newGoal = await db
      .insert(userGoals)
      .values({
        userId: user.userId,
        goalType,
        targetValue,
        deadline: deadline ? new Date(deadline) : null,
      })
      .returning()

    return c.json(
      {
        success: true,
        message: "Goal created successfully",
        goal: newGoal[0],
      },
      201
    )
  } catch (error) {
    console.error("Error creating goal:", error)
    return c.json({ success: false, message: "Internal server error" }, 500)
  }
})

userRouter.delete("/:id", async (c) => {
  const token = c.req.header("Authorization")
  const decoded = decode(token!)
  if (decoded.payload.role !== "admin") {
    return c.json({ message: "Unauthorized" }, 401)
  }
  const id = c.req.param("id")

  const deletedUser = await db.delete(users).where(eq(users.id, id)).returning()

  if (!deletedUser.length) {
    return c.json({ success: "false", message: "User not found" }, 404)
  }

  return c.json({ success: "true", message: "User deleted successfully" })
})

userRouter.post("/reset-password", async (c) => {
  const { email } = await c.req.json()

  const user = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (!user) {
    return c.json({
      message: "If this email exists, a reset link has been sent.",
    })
  }

  const rawToken = randomBytes(32).toString("hex")
  const hashedToken = await hash(rawToken, 10)

  await db
    .update(users)
    .set({
      resetToken: hashedToken,
      resetTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
    })
    .where(eq(users.id, user.id))

  const resetLink = `${process.env.BASE_URL}/api/users/reset-password/${rawToken}`

  // await sendEmail(user.email, resetLink, "reset")
  console.log(rawToken)
  return c.json({
    message: "If this email exists, a reset link has been sent.",
  })
})

userRouter.post("/reset-password/:token", async (c) => {
  const { token } = c.req.param()
  const { newPassword } = await c.req.json()

  const user = await db.query.users.findFirst({
    where: and(
      isNotNull(users.resetToken),
      isNotNull(users.resetTokenExpiresAt),
      gt(users.resetTokenExpiresAt, new Date()) // Ensure token is not expired
    ),
  })

  console.log("User found:", user)

  if (!user) {
    return c.json({ message: "Invalid or expired token" }, 400)
  }

  const hashedPassword = await hash(newPassword, 10)

  await db
    .update(users)
    .set({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiresAt: null,
    })
    .where(eq(users.id, user.id))

  return c.json({
    success: true,
    message: "Password reset successful",
  })
})

export default userRouter
