import { NIM_CONFIG } from "../config/nim"
import { searchUserData } from "./vectorSearch"
import type { SearchResult } from "./vectorSearch"
import { db } from "../db"
import { weightLogs, workoutLogs } from "../db/schema"
import { and, desc, eq, gte, isNull, lte } from "drizzle-orm"
import {
  templateWeightLog,
  templateWorkoutLog,
} from "./embeddingHelper"
import { normalizeQueryText, parseTimeIntent } from "./aiTimeIntent"
import type { TimeWindow } from "./aiTimeIntent"

const DATA_CHAT_SYSTEM_PROMPT = `You are an AI fitness and wellness assistant integrated into selfTracker, a personal tracking app.

You analyze the user's tracked data and provide insights, trends, and recommendations.

You have access to the user's data via vector search results which will be provided as context.

Rules:
- Be concise and specific. Use numbers and dates.
- If the user asks about something not in the context, say "I don't have that data yet."
- Never make up data. Only reference what's in the context.
- Be encouraging and supportive.
- Format responses with short paragraphs and bullet points where helpful.`

const GENERAL_CHAT_SYSTEM_PROMPT = `You are an AI fitness and wellness assistant integrated into selfTracker, a personal tracking app.

You can answer normal health, fitness, nutrition, habit, productivity, and app-related questions conversationally.

Rules:
- Match the user's language.
- Be concise, practical, and specific.
- For medical issues, avoid diagnosis and recommend a qualified professional when appropriate.
- If the user asks about their own tracked data, say you need to check their tracked data instead of inventing numbers.`

const ARABIC_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/
const WEIGHT_PATTERN = /\b(weight|weigh|kg|kilo|fat|loss|lost|cut|bulk|scale)\b|وزن|وزني|اوزاني|كيلو|كجم|خساره|تخسيس/i
const WORKOUT_PATTERN = /\b(workout|training|train|gym|exercise|push|pull|legs?|cardio|walk|session)\b|تمرين|تماريني|جيم|رياضه|كارديو|مشي|بوش|بول|رجل/i
const PERSONAL_DATA_PATTERN = /\b(my|mine|me|i|logged|tracked|records?|history|progress|trend|consistency|data|stats?|summary|did|was|were|in\s+20\d{2})\b|بيانات|بياناتي|وزني|اوزاني|تماريني|سجلي|تقدمي|عملت|كنت|عندي|في\s+20\d{2}|بالنسبه\s+20\d{2}/i

function buildSystemPrompt(message: string, usesUserData: boolean): string {
  const langInstruction = ARABIC_PATTERN.test(message)
    ? "\n\nIMPORTANT: The user's message is in Arabic. Respond in Arabic."
    : ""
  return (usesUserData ? DATA_CHAT_SYSTEM_PROMPT : GENERAL_CHAT_SYSTEM_PROMPT) + langInstruction
}

function formatContext(results: SearchResult[]): string {
  if (results.length === 0) return "No relevant data found."
  return results
    .map((r) => `[${r.resourceType}] ${r.content}`)
    .join("\n")
}

function inferResourceTypes(message: string): Array<"weight_log" | "workout_log"> {
  const normalized = normalizeQueryText(message)
  const types: Array<"weight_log" | "workout_log"> = []
  if (WEIGHT_PATTERN.test(normalized)) types.push("weight_log")
  if (WORKOUT_PATTERN.test(normalized)) types.push("workout_log")
  return types.length > 0 ? types : ["weight_log", "workout_log"]
}

function shouldRetrieveUserData(message: string, conversationContext = message): boolean {
  const normalized = normalizeQueryText(message)
  const normalizedContext = normalizeQueryText(conversationContext)
  const hasTrackedDomain = WEIGHT_PATTERN.test(normalizedContext) || WORKOUT_PATTERN.test(normalizedContext)
  const hasPersonalSignal = PERSONAL_DATA_PATTERN.test(normalized)
  const hasTrackedDomainInCurrentMessage = WEIGHT_PATTERN.test(normalized) || WORKOUT_PATTERN.test(normalized)
  const hasTimeIntent = parseTimeIntent(message) !== null

  return hasTrackedDomain && (hasTrackedDomainInCurrentMessage || hasPersonalSignal || hasTimeIntent)
}

async function fetchRecentRecords(userId: string, limit = 5): Promise<SearchResult[]> {
  const recent: SearchResult[] = []

  try {
    const recentWeights = await db
      .select()
      .from(weightLogs)
      .where(and(eq(weightLogs.userId, userId), isNull(weightLogs.deletedAt)))
      .orderBy(desc(weightLogs.createdAt))
      .limit(limit)

    for (const w of recentWeights) {
      recent.push({
        resourceType: "weight_log",
        resourceId: w.id,
        content: templateWeightLog(w),
        similarity: 1,
      })
    }
  } catch {}

  try {
    const recentWorkouts = await db
      .select()
      .from(workoutLogs)
      .where(and(eq(workoutLogs.userId, userId), isNull(workoutLogs.deletedAt)))
      .orderBy(desc(workoutLogs.createdAt))
      .limit(limit)

    for (const w of recentWorkouts) {
      recent.push({
        resourceType: "workout_log",
        resourceId: w.id,
        content: templateWorkoutLog(w),
        similarity: 1,
      })
    }
  } catch {}

  return recent
}

async function fetchTimeScopedRecords(
  userId: string,
  timeWindow: TimeWindow,
  resourceTypes: Array<"weight_log" | "workout_log">,
  limit = 50
): Promise<SearchResult[]> {
  const records: SearchResult[] = []
  const summaries: SearchResult[] = []

  if (resourceTypes.includes("weight_log")) {
    const scopedWeights = await db
      .select()
      .from(weightLogs)
      .where(
        and(
          eq(weightLogs.userId, userId),
          isNull(weightLogs.deletedAt),
          gte(weightLogs.createdAt, timeWindow.start),
          lte(weightLogs.createdAt, timeWindow.end)
        )
      )
      .orderBy(desc(weightLogs.createdAt))
      .limit(limit)

    if (scopedWeights.length > 0) {
      const chronological = [...scopedWeights].sort(
        (a, b) =>
          (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
      )
      const first = chronological[0]
      const last = chronological[chronological.length - 1]
      const firstWeight = Number(first.weight)
      const lastWeight = Number(last.weight)
      const delta = lastWeight - firstWeight

      summaries.push({
        resourceType: "weight_summary",
        resourceId: `${timeWindow.start.toISOString()}:${timeWindow.end.toISOString()}`,
        content: `Weight summary for this time window: ${scopedWeights.length} weight logs. First logged weight was ${firstWeight.toFixed(2)} kg on ${first.createdAt?.toISOString().slice(0, 10)}. Latest logged weight was ${lastWeight.toFixed(2)} kg on ${last.createdAt?.toISOString().slice(0, 10)}. Net change was ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} kg.`,
        similarity: 1,
      })
    }

    for (const w of scopedWeights) {
      records.push({
        resourceType: "weight_log",
        resourceId: w.id,
        content: templateWeightLog(w),
        similarity: 1,
      })
    }
  }

  if (resourceTypes.includes("workout_log")) {
    const scopedWorkouts = await db
      .select()
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, userId),
          isNull(workoutLogs.deletedAt),
          gte(workoutLogs.createdAt, timeWindow.start),
          lte(workoutLogs.createdAt, timeWindow.end)
        )
      )
      .orderBy(desc(workoutLogs.createdAt))
      .limit(limit)

    if (scopedWorkouts.length > 0) {
      const counts = scopedWorkouts.reduce<Record<string, number>>((acc, log) => {
        const name = log.workoutName || "Workout"
        acc[name] = (acc[name] || 0) + 1
        return acc
      }, {})
      const countText = Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => `${name}: ${count}`)
        .join(", ")

      summaries.push({
        resourceType: "workout_summary",
        resourceId: `${timeWindow.start.toISOString()}:${timeWindow.end.toISOString()}`,
        content: `Workout summary for this time window: ${scopedWorkouts.length} workout sessions. Session counts by workout type: ${countText}.`,
        similarity: 1,
      })
    }

    for (const w of scopedWorkouts) {
      records.push({
        resourceType: "workout_log",
        resourceId: w.id,
        content: templateWorkoutLog(w),
        similarity: 1,
      })
    }
  }

  return [...summaries, ...records]
}

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatOptions {
  message: string
  history: ChatMessage[]
  userId: string
}

export async function streamChat(
  options: ChatOptions,
  onToken: (token: string) => void,
  onDone: (sources: SearchResult[]) => void
): Promise<void> {
  const recentUserContext = options.history
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => message.content)
    .join("\n")
  const conversationContext = `${recentUserContext}\n${options.message}`

  const usesUserData = shouldRetrieveUserData(options.message, conversationContext)
  const inferredTypes = inferResourceTypes(conversationContext)
  const timeWindow = usesUserData
    ? parseTimeIntent(options.message) || parseTimeIntent(recentUserContext)
    : null

  // 1. Search for relevant semantic context.
  // Time-scoped questions rely primarily on SQL-filtered records below because
  // the embeddings table currently has no source_created_at metadata.
  const searchResults = !usesUserData || timeWindow
    ? []
    : await searchUserData(options.userId, options.message, 10)

  // 2. Include deterministic recency context. For "latest/last month" queries,
  // this is the source of truth because it uses structured timestamps.
  const scopedRecords = timeWindow
    ? await fetchTimeScopedRecords(options.userId, timeWindow, inferredTypes)
    : []
  const recentRecords = !usesUserData || timeWindow
    ? []
    : await fetchRecentRecords(options.userId, 5)

  // 3. Merge: deduplicate by resourceType+resourceId, deterministic context first.
  const seen = new Set<string>()
  const merged = [...scopedRecords, ...recentRecords, ...searchResults].filter((r) => {
    const key = `${r.resourceType}:${r.resourceId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const scopeNote = timeWindow
    ? `\nTime scope: The user asked for recent/monthly data. Use only records from ${timeWindow.label}. If no records are provided for that scope, say that no matching data was found in that window.`
    : ""

  // 4. Build messages array
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(options.message, usesUserData) },
    ...(usesUserData
      ? options.history
          .filter((message) => message.role === "user")
          .slice(-3)
          .map((message) => ({
            role: message.role,
            content: message.content,
          }))
      : options.history),
    usesUserData
      ? {
          role: "user",
          content: `Relevant data:${scopeNote}\n${formatContext(merged)}\n\nQuestion: ${options.message}\n\nUse the relevant data above as the source of truth. Do not reuse numbers or dates from earlier assistant messages if they conflict with this context.`,
        }
      : {
          role: "user",
          content: options.message,
        },
  ]

  // 3. Call NIM chat with streaming
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), NIM_CONFIG.timeout)

  try {
    const response = await fetch(`${NIM_CONFIG.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NIM_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NIM_CONFIG.chatModel,
        messages,
        temperature: 0.3,
        max_tokens: 2048,
        stream: true,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      throw new Error(`NIM chat error ${response.status}: ${body}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error("No response body")

    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith("data: ")) continue
        const data = trimmed.slice(6)
        if (data === "[DONE]") continue

        try {
          const parsed = JSON.parse(data)
          const token = parsed.choices?.[0]?.delta?.content
          if (token) onToken(token)
        } catch {
          // skip malformed SSE lines
        }
      }
    }

    onDone(merged)
  } catch (err: any) {
    clearTimeout(timeout)
    if (err.name === "AbortError") {
      throw new Error(`Chat request timed out after ${NIM_CONFIG.timeout}ms`)
    }
    throw err
  }
}
