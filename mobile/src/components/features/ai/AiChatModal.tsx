import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import SuggestedPrompts from './SuggestedPrompts'
import { streamChat } from '@/src/lib/api/ai'
import {
  useConversationHistory,
  getConversationSummary,
} from '@/src/hooks/useConversationHistory'
import type { AiChatMessage, SearchResult, Conversation } from '@/src/types/aiTypes'
import * as Haptics from 'expo-haptics'

interface AiChatModalProps {
  visible: boolean
  onClose: () => void
}

export default function AiChatModal({ visible, onClose }: AiChatModalProps) {
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)
  const abortRef = useRef<(() => void) | null>(null)

  const { conversations, save: saveConversation, remove: deleteConversation } =
    useConversationHistory()

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your AI assistant. I can analyze your tracked data — workouts, weight, habits, nutrition, and more. Ask me anything!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)

  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const handleSave = useCallback(
    async (newMessages: AiChatMessage[]) => {
      if (newMessages.length > 1) {
        const saved = await saveConversation(newMessages)
        setCurrentConvId(saved.id)
      }
    },
    [saveConversation]
  )

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }, [messages, streamingContent])

  const abortStream = useCallback(() => {
    abortRef.current?.()
    abortRef.current = null
  }, [])

  const startStream = useCallback(
    async (text: string, currentMessages: AiChatMessage[]) => {
      abortStream()
      setInput('')
      setError(null)
      setShowHistory(false)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const userMessage: AiChatMessage = { role: 'user', content: text }
      const history = [...currentMessages, userMessage]
      setMessages(history)

      setIsLoading(true)
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
          setMessages(newMessages)
          setStreamingContent('')
          setIsLoading(false)
          handleSave(newMessages)
        },
        (errorMsg: string) => {
          setError(errorMsg)
          setIsLoading(false)
          setStreamingContent('')
        }
      )

      abortRef.current = abort
    },
    [handleSave, abortStream]
  )

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isLoading) return
    startStream(text, messagesRef.current)
  }, [input, isLoading, startStream])

  const handleSuggestedPrompt = useCallback(
    (prompt: string) => {
      if (isLoading) return
      startStream(prompt, messagesRef.current)
    },
    [startStream, isLoading]
  )

  const loadConversation = useCallback((conv: Conversation) => {
    abortStream()
    setMessages(conv.messages)
    setCurrentConvId(conv.id)
    setShowHistory(false)
    setError(null)
  }, [abortStream])

  const startNewChat = useCallback(() => {
    abortStream()
    setMessages([
      {
        role: 'assistant',
        content:
          "Hi! I'm your AI assistant. I can analyze your tracked data — workouts, weight, habits, nutrition, and more. Ask me anything!",
      },
    ])
    setCurrentConvId(null)
    setError(null)
    setStreamingContent('')
    setShowHistory(false)
  }, [abortStream])

  useEffect(() => {
    return () => {
      abortStream()
    }
  }, [abortStream])

  useEffect(() => {
    if (visible) {
      setShowHistory(false)
    }
  }, [visible])

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill} className="z-50">
      {/* Solid dark background — blocks the home page from showing through */}
      <View style={StyleSheet.absoluteFill} className="bg-background" />
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 py-3 border-b border-white/10"
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="flex-row items-center gap-2 flex-1">
            <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
              <Text className="text-primary text-xs font-bold">AI</Text>
            </View>
            <Text className="text-text text-lg font-bold">AI Assistant</Text>
            {isLoading && (
              <View className="w-2 h-2 rounded-full bg-primary" />
            )}
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setShowHistory(!showHistory)}
              className={`w-8 h-8 rounded-full items-center justify-center active:opacity-70 ${
                showHistory ? 'bg-primary/30' : 'bg-white/10'
              }`}
            >
              <Text className="text-text text-base">☰</Text>
            </Pressable>

            <Pressable
              onPress={startNewChat}
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center active:opacity-70"
            >
              <Text className="text-text text-base">✎</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                abortRef.current?.()
                onClose()
              }}
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center active:opacity-70"
            >
              <Text className="text-text text-lg">✕</Text>
            </Pressable>
          </View>
        </View>

        {showHistory ? (
          <View className="flex-1 px-4 pt-4">
            <Text className="text-text/60 text-xs font-bold uppercase tracking-widest mb-3">
              Past Conversations
            </Text>

            {conversations.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-text/40 text-sm text-center">
                  No past conversations yet.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
              >
                {conversations.map((conv) => (
                  <Pressable
                    key={conv.id}
                    onPress={() => loadConversation(conv)}
                    className={`flex-row items-center justify-between rounded-xl border p-3 mb-2 active:opacity-70 ${
                      conv.id === currentConvId
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-white/10 bg-card'
                    }`}
                  >
                    <View className="flex-1 mr-2">
                      <Text
                        className="text-text text-sm font-medium"
                        numberOfLines={1}
                      >
                        {getConversationSummary(conv.messages)}
                      </Text>
                      <Text className="text-text/40 text-xs mt-1">
                        {new Date(conv.updatedAt).toLocaleDateString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => deleteConversation(conv.id)}
                      className="p-2"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text className="text-error text-sm">✕</Text>
                    </Pressable>
                  </Pressable>
                ))}
                <View className="h-20" />
              </ScrollView>
            )}
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              className="flex-1 px-4 pt-4"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.length === 1 &&
                messages[0].role === 'assistant' &&
                !isLoading && (
                  <SuggestedPrompts onSelect={handleSuggestedPrompt} />
                )}

              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} index={i} />
              ))}

              {streamingContent && (
                <ChatMessage
                  role="assistant"
                  content={streamingContent}
                  isStreaming
                />
              )}

              {error && (
                <View className="flex-row items-center gap-2 bg-error/10 border border-error/20 rounded-xl px-4 py-3 mb-4">
                  <Text className="text-error text-xs flex-1">{error}</Text>
                  <Pressable
                    onPress={() => {
                      const lastUserMsg = [...messagesRef.current]
                        .reverse()
                        .find((m) => m.role === 'user')
                      if (lastUserMsg) {
                        startStream(lastUserMsg.content, messagesRef.current)
                      }
                    }}
                    className="bg-error/20 rounded-lg px-3 py-1"
                  >
                    <Text className="text-error text-xs font-bold">Retry</Text>
                  </Pressable>
                </View>
              )}

              <View className="h-4" />
            </ScrollView>

            <ChatInput
              value={input}
              onChangeText={(t) => {
                setInput(t)
                if (error) setError(null)
              }}
              onSend={handleSend}
              loading={isLoading}
              disabled={!!streamingContent}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  )
}
