import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AiChatMessage, Conversation } from '@/src/types/aiTypes'

const CONVERSATIONS_KEY = 'ai_conversations'
const MAX_CONVERSATIONS = 50

// ── Load all saved conversations ───────────────────────────────────
export async function loadConversations(): Promise<Conversation[]> {
  try {
    const raw = await AsyncStorage.getItem(CONVERSATIONS_KEY)
    if (!raw) return []
    const conversations: Conversation[] = JSON.parse(raw)
    return conversations.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

// ── Save a conversation ────────────────────────────────────────────
export async function saveConversation(
  messages: AiChatMessage[]
): Promise<Conversation> {
  const conversations = await loadConversations()
  const now = Date.now()

  const existing = conversations.find(
    (c) =>
      c.messages.length === messages.length &&
      c.messages[c.messages.length - 1]?.content ===
        messages[messages.length - 1]?.content
  )

  let conversation: Conversation

  if (existing) {
    // Update existing
    conversation = { ...existing, messages, updatedAt: now }
    const idx = conversations.findIndex((c) => c.id === existing.id)
    conversations[idx] = conversation
  } else {
    // Create new
    conversation = {
      id: `conv_${now}_${Math.random().toString(36).slice(2, 8)}`,
      messages,
      createdAt: now,
      updatedAt: now,
    }
    conversations.unshift(conversation)
  }

  // Trim old conversations
  const trimmed = conversations.slice(0, MAX_CONVERSATIONS)
  await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(trimmed))

  return conversation
}

// ── Delete a conversation ──────────────────────────────────────────
export async function deleteConversation(id: string): Promise<void> {
  const conversations = await loadConversations()
  const filtered = conversations.filter((c) => c.id !== id)
  await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filtered))
}

// ── Clear all conversations ────────────────────────────────────────
export async function clearConversations(): Promise<void> {
  await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify([]))
}

// ── Hook: use conversation history in components ──────────────────
export function useConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await loadConversations()
    setConversations(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [])

  const save = useCallback(
    async (messages: AiChatMessage[]) => {
      const saved = await saveConversation(messages)
      await refresh()
      return saved
    },
    [refresh]
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteConversation(id)
      await refresh()
    },
    [refresh]
  )

  const clear = useCallback(async () => {
    await clearConversations()
    await refresh()
  }, [refresh])

  return { conversations, loading, save, remove, clear, refresh }
}

// ── Get a summary of a conversation for the history list ──────────
export function getConversationSummary(messages: AiChatMessage[]): string {
  if (messages.length === 0) return 'Empty conversation'
  const firstUserMsg = messages.find((m) => m.role === 'user')
  if (firstUserMsg) {
    return firstUserMsg.content.length > 60
      ? firstUserMsg.content.slice(0, 60) + '...'
      : firstUserMsg.content
  }
  return 'Chat started'
}
