import React from "react"
import { View, Text } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"

export const WeightChart = () => {
  const colors = useThemeColors()

  return (
    <View className="p-4 bg-card rounded-xl border border-border items-center justify-center py-12">
      <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>Weight Chart</Text>
      <Text className="text-placeholder text-center px-8">
        Weight tracking will be available once sync is enabled.
      </Text>
    </View>
  )
}
