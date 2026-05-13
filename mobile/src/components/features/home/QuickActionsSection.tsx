import React from "react"
import { View, Text } from "react-native"
import ActionButtons from "./ActionButtons"

export const QuickActionsSection = () => {
  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-black text-text tracking-tight uppercase">Quick Actions</Text>
        <View className="h-[2px] flex-1 bg-primary/10 ml-4 rounded-full" />
      </View>
      <ActionButtons />
    </View>
  )
}
