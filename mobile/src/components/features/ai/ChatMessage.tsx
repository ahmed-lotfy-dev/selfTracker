import React from 'react'
import { View, Text } from 'react-native'

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  isStreaming?: boolean
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <View className={`mb-4 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-2 mt-1">
          <Text className="text-primary text-xs font-bold">AI</Text>
        </View>
      )}

      {/* Bubble */}
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary rounded-tr-md'
            : 'bg-card border border-white/10 rounded-tl-md'
        }`}
      >
        <Text
          className={`text-sm leading-5 ${isUser ? 'text-white' : 'text-text'}`}
        >
          {content}
          {isStreaming && (
            <Text className="text-primary animate-pulse">▊</Text>
          )}
        </Text>
      </View>

      {/* Avatar for user */}
      {isUser && (
        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center ml-2 mt-1">
          <Text className="text-white text-xs font-bold">U</Text>
        </View>
      )}
    </View>
  )
}
