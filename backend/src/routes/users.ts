import { Hono } from "hono"
import { db } from "../db/index.js"
import { userGoals, users } from "../db/schema"
import { and, eq, gt, is, isNotNull } from "drizzle-orm"
import { sign, verify, decode } from "hono/jwt"
import { sendEmail } from "../../lib/email.js"
import { hash, compare } from "bcryptjs"
import { randomBytes } from "crypto"
import {
  findUserByEmail,
  generateVerificationToken,
} from "../../lib/utility.js"

const userRouter = new Hono()

userRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (user.role !== "admin") {
    return c.json({ message: "Unauthorized" }, 401)
  }
  const userList = await db.query.users.findMany()
  return c.json(userList)
})

userRouter.patch("/:id", async (c) => {
  const id = c.req.param("id")
  const body = await c.req.json()
  console.log({ id, body })
  try {
    const existedUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!existedUser) {
      return c.json({ success: false, message: "User log not found" }, 404)
    }

    console.log({ body })

    const updatedFields: Record<string, any> = {}

    if ("email" in body) updatedFields.email = body.email
    if ("name" in body) updatedFields.name = body.name
    if ("role" in body) updatedFields.role = body.role
    if ("image" in body) updatedFields.image = body.image
    if ("emailVerified" in body)
      updatedFields.emailVerified = body.emailVerified
    if ("gender" in body) updatedFields.gender = body.gender
    if ("weight" in body) updatedFields.weight = body.weight
    if ("height" in body) updatedFields.height = body.height
    if ("unitSystem" in body) updatedFields.unitSystem = body.unitSystem
    if ("income" in body) updatedFields.income = body.income
    if ("currency" in body) updatedFields.currency = body.currency
    if ("createdAt" in body) updatedFields.createdAt = new Date(body.createdAt)
    if ("updatedAt" in body) updatedFields.updatedAt = new Date(body.updatedAt)

    console.log({ updatedFields })

    if (Object.keys(updatedFields).length === 0) {
      return c.json({ success: false, message: "No fields to update" }, 400)
    }

    const updatedUser = await db
      .update(users)
      .set(updatedFields)
      .where(eq(users.id, id))

    return c.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return c.json({ success: false, message: "Error updating user" }, 500)
  }
})

userRouter.post("/check-verification", async (c) => {
  try {
    const { id } = await c.req.json()

    const existedUser = await db.query.users.findFirst({
      where: eq(users.id, id), // ← This might be an issue too
    })

    if (!existedUser) {
      return c.json({ message: "Unauthorized: User not found" }, 401)
    }

    if (!existedUser.emailVerified) {
      return c.json(
        { message: "User is not verified, please verify your email" },
        401
      )
    }

    return c.json({
      message: "User is verified",
      isVerified: existedUser.emailVerified,
    })
  } catch (err) {
    console.error("Email Verification Error:", err)
    return c.json({ message: "Server error during verification check" }, 500)
  }
})

// userRouter.post("/resend-verification", async (c) => {
//   const { email } = await c.req.json()
//   if (!email) return c.json({ message: "Email is required!" }, 400)

//   const user = await findUserByEmail(email)
//   if (!user) return c.json({ message: "User not found!" }, 404)

//   if (user.isVerified)
//     return c.json({ message: "Email is already verified!" }, 400)

//   await db
//     .delete(emailVerifications)
//     .where(eq(emailVerifications.userId, user.id))

//   const newVerificationToken = await generateVerificationToken(user.id)
//   await db.insert(emailVerifications).values({
//     token: newVerificationToken,
//     userId: user.id,
//     expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
//   })

//   sendEmail(email, newVerificationToken, "activate")
//   return c.json({ message: "New verification email sent!" })
// })

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
      .from(user)
      .where(eq(user.id, user.userId))
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

export default userRouter
