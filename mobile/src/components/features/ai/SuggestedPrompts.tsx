import React from 'react'
import { View, Text, Pressable } from 'react-native'

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

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <View className="px-4 mb-6">
      <Text className="text-text/60 text-xs font-bold uppercase tracking-widest mb-3">
        Try asking
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {SUGGESTIONS.map((prompt) => (
          <Pressable
            key={prompt}
            onPress={() => onSelect(prompt)}
            className="bg-card border border-white/10 rounded-xl px-3 py-2 active:opacity-70"
          >
            <Text className="text-text text-xs">{prompt}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
