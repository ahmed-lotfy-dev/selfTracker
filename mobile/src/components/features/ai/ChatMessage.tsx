import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withDelay } from 'react-native-reanimated'

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  isStreaming?: boolean
  index?: number
}

export default function ChatMessage({ role, content, isStreaming, index = 0 }: ChatMessageProps) {
  const isUser = role === 'user'
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(10)

  useEffect(() => {
    if (!isStreaming) {
      opacity.value = withDelay(index * 50, withSpring(1, { damping: 20 }))
      translateY.value = withDelay(index * 50, withSpring(0, { damping: 20 }))
    } else {
      opacity.value = 1
      translateY.value = 0
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={animatedStyle} className={`mb-4 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-primary/15 items-center justify-center mr-2 mt-1">
          <Text className="text-primary text-[10px] font-black tracking-wider">AI</Text>
        </View>
      )}

      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary rounded-tr-md'
            : 'bg-card border border-border rounded-tl-md'
        }`}
      >
        <Text className={`text-sm leading-5 ${isUser ? 'text-white' : 'text-text'}`}>
          {content}
          {isStreaming && (
            <Text className="text-primary"> ▊</Text>
          )}
        </Text>
      </View>

      {isUser && (
        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center ml-2 mt-1">
          <Text className="text-white text-[10px] font-black tracking-wider">U</Text>
        </View>
      )}
    </Animated.View>
  )
}
