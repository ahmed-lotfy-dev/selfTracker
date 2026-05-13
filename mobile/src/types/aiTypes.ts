export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface InsightCard {
  type: string
  title: string
  summary: string
  hasData: boolean
  trend?: 'up' | 'down' | 'stable'
  actionLabel?: string
  actionRoute?: string
}

export interface SearchResult {
  resourceType: string
  resourceId: string
  content: string
  similarity: number
}

export interface InsightsResponse {
  insights: InsightCard[]
}

export interface Conversation {
  id: string
  messages: AiChatMessage[]
  createdAt: number
  updatedAt: number
}
