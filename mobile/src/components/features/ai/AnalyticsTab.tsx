import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import InsightCard from './InsightCard'
import EmptyState from './EmptyState'
import { AnalyticsTabSkeleton } from './SkeletonLoader'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import { fetchInsights, streamChat } from '@/src/lib/api/ai'
import { saveConversation } from '@/src/hooks/useConversationHistory'
import type { InsightCard as InsightCardType, AiChatMessage, SearchResult } from '@/src/types/aiTypes'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'

export default function AnalyticsTab() {
  const [insights, setInsights] = useState<InsightCardType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inline chat state
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [showChat, setShowChat] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)
  const scrollRef = useRef<ScrollView>(null)

  const loadInsights = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const data = await fetchInsights()
      setInsights(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load insights')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const abortStream = useCallback(() => {
    abortRef.current?.()
    abortRef.current = null
  }, [])

  useEffect(() => {
    loadInsights()
    return () => {
      abortStream()
    }
  }, [])

  const handleAction = useCallback((route: string) => {
    router.navigate(route as any)
  }, [])

  const allEmpty = insights.length > 0 && insights.every((i) => !i.hasData)

  const handleChatSend = useCallback(async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return

    abortStream()
    setChatInput('')
    setShowChat(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const userMessage: AiChatMessage = { role: 'user', content: text }
    const history = [...chatMessages, userMessage]
    setChatMessages(history)

    setChatLoading(true)
    setStreamingContent('')

    let accumulatedContent = ''

    const abort = await streamChat(
      text,
      history,
      (token) => {
        accumulatedContent += token
        setStreamingContent(accumulatedContent)
      },
      (sources: SearchResult[]) => {
        const assistantMessage: AiChatMessage = {
          role: 'assistant',
          content: accumulatedContent,
        }
        const newMessages = [...history, assistantMessage]
        setChatMessages(newMessages)
        saveConversation(newMessages)
        setStreamingContent('')
        setChatLoading(false)
      },
      (errorMsg: string) => {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${errorMsg}` },
        ])
        setChatLoading(false)
        setStreamingContent('')
      }
    )

    abortRef.current = abort
  }, [chatInput, chatLoading, chatMessages, abortStream])

  // Auto-scroll chat
  useEffect(() => {
    if (showChat) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200)
    }
  }, [chatMessages, streamingContent, showChat])

  return (
    <View className="flex-1 bg-background">
      {loading && insights.length === 0 ? (
        <AnalyticsTabSkeleton />
      ) : error && insights.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-error text-4xl mb-4">⚠</Text>
          <Text className="text-text font-bold text-lg mb-2">Failed to load</Text>
          <Text className="text-text/50 text-sm text-center mb-6">{error}</Text>
          <Pressable
            onPress={() => loadInsights()}
            className="bg-primary rounded-xl px-6 py-3"
          >
            <Text className="text-white font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadInsights(true)}
              tintColor="#10B981"
            />
          }
        >
          {/* Insight Cards */}
          {insights.length > 0 && (
            <View className="gap-3 mt-2 mb-6">
              <Text className="text-text/60 text-xs font-bold uppercase tracking-widest mb-1">
                Your Insights
              </Text>
              {insights.map((insight, i) => (
                <InsightCard
                  key={`${insight.type}-${i}`}
                  insight={insight}
                  onAction={handleAction}
                />
              ))}
            </View>
          )}

          {allEmpty && (
            <EmptyState />
          )}

          {/* Inline Chat Section */}
          <View className="mb-4">
            <Text className="text-text/60 text-xs font-bold uppercase tracking-widest mb-3">
              Ask about your data
            </Text>

            {showChat && (
              <View className="mb-4">
                {chatMessages.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {streamingContent && (
                  <ChatMessage
                    role="assistant"
                    content={streamingContent}
                    isStreaming
                  />
                )}
              </View>
            )}
          </View>

          {/* Bottom spacing */}
          <View className="h-24" />
        </ScrollView>
      )}

      {/* Sticky Chat Input at bottom */}
      <View className="border-t border-white/10 bg-background">
        <ChatInput
          value={chatInput}
          onChangeText={setChatInput}
          onSend={handleChatSend}
          loading={chatLoading}
          placeholder="Ask a question..."
        />
      </View>
    </View>
  )
}
