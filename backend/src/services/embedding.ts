import { NIM_CONFIG } from "../config/nim"

const NIM_BASE = NIM_CONFIG.baseUrl
const NVIDIA_API_KEY = NIM_CONFIG.apiKey

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), NIM_CONFIG.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (response.status === 429) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt)
          console.warn(`[Embedding] 429 rate limited, retrying in ${delay}ms...`)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "")
        throw new Error(`NIM API error ${response.status}: ${body}`)
      }

      return response
    } catch (err: any) {
      clearTimeout(timeout)
      if (err.name === "AbortError") {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt)
          console.warn(`[Embedding] timeout, retrying in ${delay}ms...`)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
        throw new Error(`NIM request timed out after ${NIM_CONFIG.timeout}ms`)
      }
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.warn(`[Embedding] error, retrying in ${delay}ms: ${err.message}`)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      throw err
    }
  }
  throw new Error("NIM request failed after retries")
}

export async function generateEmbedding(
  text: string,
  inputType: "passage" | "query" = "passage"
): Promise<number[]> {
  const response = await fetchWithRetry(`${NIM_BASE}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NIM_CONFIG.embeddingModel,
      input: text,
      input_type: inputType,
    }),
  })

  const data = await response.json()
  return data.data[0].embedding
}

export async function generateEmbeddingBatch(
  texts: string[],
  inputType: "passage" | "query" = "passage"
): Promise<number[][]> {
  const batches = chunk(texts, 10)
  const results: number[][] = []

  for (const batch of batches) {
    const response = await fetchWithRetry(`${NIM_BASE}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NIM_CONFIG.embeddingModel,
        input: batch,
        input_type: inputType,
      }),
    })

    const data = await response.json()
    const embeddings = data.data.map((d: any) => d.embedding)
    results.push(...embeddings)
  }

  return results
}
