import React from 'react'
import { View, Text, Pressable } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated'

const SUGGESTIONS = [
  'How was my workout consistency this week?',
  'Summarize my weight trend this month',
  'What habits am I doing best at?',
  'Any patterns in my nutrition?',
  'Am I meeting my goals?',
]

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void
}

function PromptChip({ prompt, onSelect }: { prompt: string; onSelect: (p: string) => void }) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={() => onSelect(prompt)}
        onPressIn={() => { scale.value = withSpring(0.95) }}
        onPressOut={() => { scale.value = withSpring(1) }}
        className="bg-card border border-border rounded-xl px-3 py-2 active:opacity-70"
      >
        <Text className="text-text text-xs">{prompt}</Text>
      </Pressable>
    </Animated.View>
  )
}

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <View className="px-4 mb-6">
      <Text className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3">
        Try asking
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {SUGGESTIONS.map((prompt) => (
          <PromptChip key={prompt} prompt={prompt} onSelect={onSelect} />
        ))}
      </View>
    </View>
  )
}
