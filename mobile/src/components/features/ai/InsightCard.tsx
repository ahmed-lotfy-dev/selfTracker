import React from 'react'
import { View, Text } from 'react-native'
import { PremiumCard } from '@/src/components/ui/PremiumCard'
import type { InsightCard as InsightCardType } from '@/src/types/aiTypes'

interface InsightCardProps {
  insight: InsightCardType
  onAction?: (route: string) => void
}

const TREND_ICONS: Record<string, string> = {
  up: '📈',
  down: '📉',
  stable: '➡️',
}

const TYPE_ICONS: Record<string, string> = {
  workout_consistency: '💪',
  weight_trend: '⚖️',
  habit_champion: '🔥',
  nutrition_summary: '🥗',
  task_momentum: '✅',
}

export default function InsightCard({ insight, onAction }: InsightCardProps) {
  const icon = TYPE_ICONS[insight.type] || '📊'

  return (
    <PremiumCard
      gradientColors={
        insight.hasData
          ? ['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.03)']
          : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']
      }
      containerStyle={insight.hasData ? '' : 'opacity-50'}
    >
      <View className="flex-row items-start gap-3">
        <Text className="text-2xl">{icon}</Text>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-text font-bold text-sm">{insight.title}</Text>
            {insight.trend && (
              <Text>{TREND_ICONS[insight.trend] || ''}</Text>
            )}
          </View>
          <Text
            className={`text-sm leading-5 ${
              insight.hasData ? 'text-text/70' : 'text-text/40'
            }`}
          >
            {insight.summary}
          </Text>

          {!insight.hasData && insight.actionLabel && onAction && (
            <View className="mt-3">
              <Text
                onPress={() => onAction(insight.actionRoute!)}
                className="text-primary text-sm font-bold"
              >
                {insight.actionLabel} →
              </Text>
            </View>
          )}
        </View>
      </View>
    </PremiumCard>
  )
}
