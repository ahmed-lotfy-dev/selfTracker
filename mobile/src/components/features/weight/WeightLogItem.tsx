import React from "react"
import { View, Text } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"

export default function WeightLogItem({ log }: { log: any }) {
  const colors = useThemeColors()

  return (
    <View className="p-4 bg-card rounded-xl mb-2 border border-border">
      <Text className="font-bold text-lg" style={{ color: colors.text }}>{log?.weight || "0"} kg</Text>
      <Text className="text-sm" style={{ color: colors.placeholder }}>{log?.notes || ""}</Text>
    </View>
  )
}
