import { Hono } from "hono"
import { db } from "../db/index.js"
import { tasks, userGoals, users, weightLogs, workoutLogs } from "../db/schema"
import { and, eq, gte, lte, sql, desc, or } from "drizzle-orm"
import { decode } from "hono/jwt"

import { endOfWeek, startOfWeek, startOfMonth, endOfMonth, set } from "date-fns"
import { clearCache, getCache, setCache } from "../../lib/redis.js"

const userRouter = new Hono()

userRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (user.role !== "admin") {
    return c.json({ message: "Unauthorized" }, 401)
  }
  const userList = await db.query.users.findMany()
  return c.json(userList)
})

userRouter.get("/me/home", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const start = startOfWeek(new Date(), { weekStartsOn: 6 })
  const end = endOfWeek(new Date(), { weekStartsOn: 6 })
  try {
    const cacheKey = `userHomeData:${user.id}`
    const cached = await getCache(cacheKey)
    console.log(cached)
    if (cached) {
      return c.json(cached)
    }

    const [weeklyWorkoutCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, user.id),
          gte(workoutLogs.createdAt, start),
          lte(workoutLogs.createdAt, end)
        )
      )

    const [monthlyWorkoutCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, user.id),
          gte(workoutLogs.createdAt, startOfMonth(new Date())),
          lte(workoutLogs.createdAt, endOfMonth(new Date()))
        )
      )

    const [weeklyCompletedTaskCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(
        and(
          eq(tasks.completed, true),
          eq(tasks.userId, user.id),
          gte(tasks.createdAt, start),
          lte(tasks.createdAt, end)
        )
      )

    const [weeklyPendingTaskCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(
        and(
          eq(tasks.completed, false),
          eq(tasks.userId, user.id),
          gte(tasks.createdAt, start),
          lte(tasks.createdAt, end)
        )
      )

    const [goal] = await db
      .select()
      .from(userGoals)
      .where(
        and(
          eq(userGoals.userId, user.id),
          or(
            eq(userGoals.goalType, "loseWeight"),
            eq(userGoals.goalType, "gainWeight")
          )
        )
      )

    const [latestWeight] = await db
      .select()
      .from(weightLogs)
      .where(eq(weightLogs.userId, user.id))
      .orderBy(desc(weightLogs.createdAt))
      .limit(1)
      .prepare("latestWeight")
      .execute()

    const weightDelta =
      goal?.targetValue && latestWeight?.weight
        ? Number(latestWeight.weight) - Number(goal.targetValue)
        : null

    const responseData = {
      weeklyWorkoutCount: weeklyWorkoutCount.count,
      monthlyWorkoutCount: monthlyWorkoutCount.count,
      weeklyCompletedTaskCount: weeklyCompletedTaskCount.count || 0,
      weeklyPendingTaskCount: weeklyPendingTaskCount.count || 0,
      goalWeight: Number(goal?.targetValue) ?? "goal not set yet",
      userLatestWeight: Number(latestWeight?.weight) ?? "no weight log yet",
      weightDelta,
    }

    await setCache(cacheKey, 3600, responseData)

    return c.json(responseData)
  } catch (error) {
    console.error("Error fetching user home data:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

userRouter.patch("/:id", async (c) => {
  const user = c.get("user" as any)
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  const id = c.req.param("id")
  const body = await c.req.json()

  try {
    await clearCache([`userHomeData:${user.id}`])

    const existedUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!existedUser) {
      return c.json({ message: "User log not found" }, 404)
    }

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

    if (Object.keys(updatedFields).length === 0) {
      return c.json({ message: "No fields to update" }, 400)
    }

    const updatedUser = await db
      .update(users)
      .set(updatedFields)
      .where(eq(users.id, id))

    return c.json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return c.json({ message: "Error updating user" }, 500)
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
  const user = c.get("user" as any)
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  try {
    await clearCache(`userHomeData:${user.id}`)

    const { userId, weight, height, unitSystem, currency, income } =
      await c.req.json()

    if (!userId || !weight || !height || !unitSystem || !currency || !income) {
      return c.json({ message: "All fields are required" }, 400)
    }

    if (!["metric", "imperial"].includes(unitSystem)) {
      return c.json(
        {
          message: "Invalid unit system. Use 'metric' or 'imperial'.",
        },
        400
      )
    }

    const userExists = await db.select().from(users).where(eq(users.id, userId))
    if (!userExists.length) {
      return c.json({ message: "User not found" }, 404)
    }

    const updatedUser = await db
      .update(users)
      .set({ weight, height, unitSystem, currency, income })
      .where(eq(users.id, userId))
      .returning()

    return c.json({
      message: "Onboarding completed successfully",
      user: updatedUser[0],
    })
  } catch (error) {
    console.error("Error during onboarding:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

userRouter.post("/goals", async (c) => {
  const user = c.get("user" as any)
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  try {
    await clearCache(`userHomeData:${user.id}`)
    const { goalType, targetValue, deadline } = await c.req.json()

    if (!goalType || !targetValue) {
      return c.json({ message: "All fields are required" }, 400)
    }

    const validGoalTypes = ["loseWeight", "gainWeight", "bodyFat", "muscleMass"]
    if (!validGoalTypes.includes(goalType)) {
      return c.json(
        {
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
      .where(eq(users.id, user.id))

    if (!userExists.length) {
      return c.json({ message: "User not found" }, 404)
    }

    const [newGoal] = await db
      .insert(userGoals)
      .values({
        userId: user.id,
        goalType,
        targetValue,
        deadline: deadline ? new Date(deadline) : null,
      })
      .returning()

    return c.json(
      {
        message: "Goal created successfully",
        goal: newGoal,
      },
      201
    )
  } catch (error) {
    console.error("Error creating goal:", error)
    return c.json({ message: "Internal server error" }, 500)
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
    return c.json({ message: "User not found" }, 404)
  }

  return c.json({ message: "User deleted successfully" })
})

userRouter.get("/testing", async (c) => {
  const user = c.get("user" as any)

  const userWithWorkoutLogs = await db.query.users.findMany({
    where: eq(users.id, user.id),
    with: {
      workoutLogs: true,
    },
  })
  return c.json({ userWithWorkoutLogs })
})

export default userRouter
