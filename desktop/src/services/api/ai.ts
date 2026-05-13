import axiosInstance from "@/lib/api/axiosInstance"

export async function chatAI(body: { message: string; history?: { role: "user" | "assistant"; content: string }[] }) {
  const res = await axiosInstance.post("/api/ai/chat", body)
  return res.data
}
