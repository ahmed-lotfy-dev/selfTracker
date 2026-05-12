import { NIM_CONFIG } from "../config/nim"
import { searchUserData, SearchResult } from "./vectorSearch"

const CHAT_SYSTEM_PROMPT = `You are an AI fitness and wellness assistant integrated into selfTracker, a personal tracking app.

You analyze the user's tracked data and provide insights, trends, and recommendations.

You have access to the user's data via vector search results which will be provided as context.

Rules:
- Be concise and specific. Use numbers and dates.
- If the user asks about something not in the context, say "I don't have that data yet."
- Never make up data. Only reference what's in the context.
- Be encouraging and supportive.
- Format responses with short paragraphs and bullet points where helpful.`

const ARABIC_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/

function buildSystemPrompt(message: string): string {
  const langInstruction = ARABIC_PATTERN.test(message)
    ? "\n\nIMPORTANT: The user's message is in Arabic. Respond in Arabic."
    : ""
  return CHAT_SYSTEM_PROMPT + langInstruction
}

function formatContext(results: SearchResult[]): string {
  if (results.length === 0) return "No relevant data found."
  return results
    .map((r) => `[${r.resourceType}] ${r.content}`)
    .join("\n")
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
  // 1. Search for relevant context
  const searchResults = await searchUserData(options.userId, options.message, 10)

  // 2. Build messages array
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(options.message) },
    ...options.history,
    {
      role: "user",
      content: `Relevant data:\n${formatContext(searchResults)}\n\nQuestion: ${options.message}`,
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

    onDone(searchResults)
  } catch (err: any) {
    clearTimeout(timeout)
    if (err.name === "AbortError") {
      throw new Error(`Chat request timed out after ${NIM_CONFIG.timeout}ms`)
    }
    throw err
  }
}
