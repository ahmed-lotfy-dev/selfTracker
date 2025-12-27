import React from "react"
import { View, Text } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"

export default function WorkoutLogItem({ log }: { log: any }) {
  const colors = useThemeColors()

  return (
    <View className="p-4 bg-card rounded-xl mb-2 border border-border">
      <Text className="font-medium" style={{ color: colors.text }}>{log?.workoutName || "Workout"}</Text>
      <Text className="text-sm" style={{ color: colors.placeholder }}>{log?.notes || ""}</Text>
    </View>
  )
}
