import React from 'react'
import { View, Text } from 'react-native'
import { PremiumCard } from '@/src/components/ui/PremiumCard'

interface InsufficientDataCardProps {
  title: string
  emoji?: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function InsufficientDataCard({
  title,
  emoji = '📊',
  message,
  actionLabel,
  onAction,
}: InsufficientDataCardProps) {
  return (
    <PremiumCard
      gradientColors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
      containerStyle="opacity-60"
    >
      <View className="items-center py-4">
        <Text className="text-4xl mb-3">{emoji}</Text>
        <Text className="text-text font-bold text-sm mb-1">{title}</Text>
        <Text className="text-text/40 text-xs text-center leading-5">
          {message}
        </Text>
        {actionLabel && onAction && (
          <View className="mt-3">
            <Text
              onPress={onAction}
              className="text-primary text-sm font-bold"
            >
              {actionLabel} →
            </Text>
          </View>
        )}
      </View>
    </PremiumCard>
  )
}
