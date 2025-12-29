import React from "react"
import { View, Text, Pressable } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import Svg, { Circle } from "react-native-svg"

type Props = {
  consumed: number
  goal: number
  onPressGoals?: () => void
}

export default function DailyIntakeCard({ consumed, goal, onPressGoals }: Props) {
  const colors = useThemeColors()

  const percentage = Math.min((consumed / goal) * 100, 100)
  const remaining = Math.max(goal - consumed, 0)

  const size = 140
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getProgressColor = () => {
    if (percentage >= 100) return "#ef4444"
    if (percentage >= 80) return "#f59e0b"
    return colors.primary
  }

  return (
    <View
      className="rounded-2xl p-5 mt-4 mb-4"
      style={{ backgroundColor: colors.card }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          Today's Intake
        </Text>
        <Pressable onPress={onPressGoals} className="flex-row items-center">
          <Text className="text-sm mr-1" style={{ color: colors.primary }}>
            Goals
          </Text>
          <Ionicons name="settings-outline" size={16} color={colors.primary} />
        </Pressable>
      </View>

      <View className="items-center py-4">
        <View className="relative items-center justify-center">
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.border}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={getProgressColor()}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View className="absolute items-center">
            <Text className="text-3xl font-bold" style={{ color: colors.text }}>
              {consumed}
            </Text>
            <Text className="text-xs" style={{ color: colors.placeholder }}>
              of {goal} kcal
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-around mt-2">
        <View className="items-center">
          <Text className="text-2xl font-semibold" style={{ color: colors.text }}>
            {remaining}
          </Text>
          <Text className="text-xs" style={{ color: colors.placeholder }}>
            Remaining
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-semibold" style={{ color: getProgressColor() }}>
            {Math.round(percentage)}%
          </Text>
          <Text className="text-xs" style={{ color: colors.placeholder }}>
            Complete
          </Text>
        </View>
      </View>
    </View>
  )
}
