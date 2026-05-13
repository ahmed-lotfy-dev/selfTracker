import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { streamChat } from "../services/aiChat"
import { searchUserData, getUserDataCounts } from "../services/vectorSearch"

const aiRouter = new Hono()

// POST /api/ai/chat — streaming chat with RAG
aiRouter.post(
  "/chat",
  zValidator(
    "json",
    z.object({
      message: z.string().min(1),
      history: z
        .array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        )
        .default([]),
    })
  ),
  async (c) => {
    const user = c.get("user" as any)
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const { message, history } = c.req.valid("json")

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChat(
            { message, history, userId: user.id },
            (token) => {
              const data = JSON.stringify({ token })
              controller.enqueue(encoder.encode(`event: token\ndata: ${data}\n\n`))
            },
            (sources) => {
              const data = JSON.stringify({ sources })
              controller.enqueue(encoder.encode(`event: done\ndata: ${data}\n\n`))
              controller.close()
            }
          )
        } catch (err: any) {
          const data = JSON.stringify({ error: err.message || "Chat failed" })
          controller.enqueue(encoder.encode(`event: error\ndata: ${data}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  }
)

// GET /api/ai/insights — pre-built insight cards
aiRouter.get("/insights", async (c) => {
  const user = c.get("user" as any)
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const counts = await getUserDataCounts(user.id)
  const insights: any[] = []

  // Workout consistency
  const workoutCount = counts["workout_log"] || 0
  if (workoutCount < 3) {
    insights.push({
      type: "workout_consistency",
      title: "Workout Consistency",
      summary: "Not enough data to generate insights yet. Keep tracking your workouts and check back soon!",
      hasData: false,
      actionLabel: "Log a Workout",
      actionRoute: "/(drawer)/(tabs)/home/workouts/add",
    })
  } else {
    insights.push({
      type: "workout_consistency",
      title: "Workout Consistency",
      summary: `You have ${workoutCount} workout records. Keep it up!`,
      trend: "up",
      hasData: true,
    })
  }

  // Weight trend
  const weightCount = counts["weight_log"] || 0
  if (weightCount < 3) {
    insights.push({
      type: "weight_trend",
      title: "Weight Trend",
      summary: "Not enough data to analyze weight trends yet.",
      hasData: false,
      actionLabel: "Log Weight",
      actionRoute: "/(drawer)/(tabs)/home/weights/add",
    })
  } else {
    insights.push({
      type: "weight_trend",
      title: "Weight Trend",
      summary: `You have ${weightCount} weight records.`,
      hasData: true,
    })
  }

  // Habit champion
  const habitCount = counts["habit"] || 0
  if (habitCount < 3) {
    insights.push({
      type: "habit_champion",
      title: "Habit Champion",
      summary: "Not enough habit data yet. Keep tracking your habits!",
      hasData: false,
      actionLabel: "Add a Habit",
      actionRoute: "/(drawer)/(tabs)/habits",
    })
  } else {
    insights.push({
      type: "habit_champion",
      title: "Habit Champion",
      summary: `You have ${habitCount} habits tracked.`,
      hasData: true,
    })
  }

  // Nutrition summary
  const foodCount = counts["food_log"] || 0
  if (foodCount < 3) {
    insights.push({
      type: "nutrition_summary",
      title: "Nutrition Summary",
      summary: "Not enough nutrition data yet. Start logging your meals!",
      hasData: false,
      actionLabel: "Log Food",
      actionRoute: "/(drawer)/(tabs)/nutrition/add",
    })
  } else {
    insights.push({
      type: "nutrition_summary",
      title: "Nutrition Summary",
      summary: `You have ${foodCount} food log entries.`,
      hasData: true,
    })
  }

  // Task momentum
  const taskCount = counts["task"] || 0
  if (taskCount < 3) {
    insights.push({
      type: "task_momentum",
      title: "Task Momentum",
      summary: "Not enough task data yet. Start tracking your tasks!",
      hasData: false,
      actionLabel: "Add a Task",
      actionRoute: "/(drawer)/(tabs)/home/tasks",
    })
  } else {
    insights.push({
      type: "task_momentum",
      title: "Task Momentum",
      summary: `You have ${taskCount} tasks tracked.`,
      hasData: true,
    })
  }

  return c.json({ insights })
})

// GET /api/ai/search — direct vector search
aiRouter.get("/search", async (c) => {
  const user = c.get("user" as any)
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const query = c.req.query("q")
  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400)
  }

  const limit = Number(c.req.query("limit")) || 10
  const results = await searchUserData(user.id, query, limit)

  return c.json({ results })
})

export default aiRouter
