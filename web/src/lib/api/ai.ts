import { axiosInstance } from "./config"

export interface AIRequest {
  message: string
  history?: { role: "user" | "assistant"; content: string }[]
}

export interface AIResponse {
  reply: string
  sources?: string[]
}

export async function chatAI(body: AIRequest) {
  const res = await axiosInstance.post<AIResponse>("/api/ai/chat", body)
  return res.data
}
