import React from "react"
import { View, Text } from "react-native"
import { StatsRow } from "./StatsRow"

export const DailyInsightsSection = () => {
  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-black text-text tracking-tight uppercase">Daily Insights</Text>
        <View className="h-[2px] flex-1 bg-primary/10 ml-4 rounded-full" />
      </View>
      <StatsRow />
    </View>
  )
}
