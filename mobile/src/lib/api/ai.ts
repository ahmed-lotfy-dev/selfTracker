import axiosInstance from './axiosInstance'
import type { AiChatMessage, InsightCard, SearchResult, InsightsResponse } from '@/src/types/aiTypes'
import { API_BASE_URL } from './config'
import * as SecureStore from 'expo-secure-store'

// ── GET /api/ai/insights ──────────────────────────────────────────
export async function fetchInsights(): Promise<InsightCard[]> {
  const response = await axiosInstance.get<InsightsResponse>('/api/ai/insights')
  return response.data.insights
}

// ── GET /api/ai/search ────────────────────────────────────────────
export async function searchData(
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  const response = await axiosInstance.get<{ results: SearchResult[] }>(
    '/api/ai/search',
    { params: { q: query, limit } }
  )
  return response.data.results
}

// ── POST /api/ai/chat (SSE streaming via XMLHttpRequest) ──────────
// Returns an abort function. Works reliably on React Native where
// ReadableStream/EventSource aren't always available.
export function streamChat(
  message: string,
  history: AiChatMessage[],
  onToken: (token: string) => void,
  onDone: (sources: SearchResult[]) => void,
  onError: (error: string) => void
): () => void {
  const xhr = new XMLHttpRequest()
  let lastIndex = 0
  let aborted = false

  xhr.open('POST', `${API_BASE_URL}/api/ai/chat`)
  xhr.setRequestHeader('Content-Type', 'application/json')

  // Attach auth token
  SecureStore.getItemAsync('selftracker.session_token').then((token) => {
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
  })

  xhr.onprogress = () => {
    const newData = xhr.responseText.slice(lastIndex)
    lastIndex = xhr.responseText.length

    parseSseLines(newData, onToken, onDone, onError)
  }

  xhr.onreadystatechange = () => {
    // Handle end of stream
    if (xhr.readyState === XMLHttpRequest.DONE && !aborted) {
      // Flush any remaining data in the buffer
      const remaining = xhr.responseText.slice(lastIndex)
      if (remaining.trim()) {
        parseSseLines(remaining, onToken, onDone, onError)
      }

      // If no done event was fired and status is error
      if (xhr.status !== 200) {
        onError(`Request failed with status ${xhr.status}`)
      }
    }
  }

  xhr.onerror = () => {
    if (!aborted) onError('Network error — check your connection')
  }

  xhr.ontimeout = () => {
    if (!aborted) onError('Request timed out')
  }

  xhr.send(JSON.stringify({ message, history }))

  return () => {
    aborted = true
    xhr.abort()
  }
}

// ── SSE line parser ───────────────────────────────────────────────
function parseSseLines(
  text: string,
  onToken: (token: string) => void,
  onDone: (sources: SearchResult[]) => void,
  onError: (error: string) => void
) {
  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('data: ')) {
      const json = trimmed.slice(6)
      try {
        const parsed = JSON.parse(json)
        if (parsed.token !== undefined) {
          onToken(parsed.token)
        }
        if (parsed.sources !== undefined) {
          onDone(parsed.sources)
        }
        if (parsed.error !== undefined) {
          onError(parsed.error)
        }
      } catch {
        // skip malformed JSON chunks
      }
    }
  }
}
