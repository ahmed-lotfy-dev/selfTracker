import React from 'react'
import { View, Text } from 'react-native'

interface EmptyStateProps {
  emoji?: string
  title?: string
  message?: string
}

export default function EmptyState({
  emoji = '🤔',
  title = 'Not enough data yet',
  message = 'Start tracking your daily activities and come back when you have more data!',
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <Text className="text-6xl mb-6">{emoji}</Text>
      <Text className="text-text font-bold text-lg mb-2 text-center">
        {title}
      </Text>
      <Text className="text-text/50 text-sm text-center leading-6 max-w-xs">
        {message}
      </Text>
    </View>
  )
}
