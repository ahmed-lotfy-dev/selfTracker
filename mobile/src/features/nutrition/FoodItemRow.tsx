import React from "react"
import { View, Text } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import type { FoodItem } from "@/src/types/nutrition"

type Props = {
  item: FoodItem
  isLast?: boolean
}

export default function FoodItemRow({ item, isLast = false }: Props) {
  const colors = useThemeColors()

  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 ${!isLast ? "border-b" : ""}`}
      style={{ borderColor: colors.border }}
    >
      <View className="flex-1">
        <Text className="text-base" style={{ color: colors.text }}>
          {item.name}
        </Text>
        <Text className="text-xs mt-1" style={{ color: colors.placeholder }}>
          {item.quantity} {item.unit} • P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
        </Text>
      </View>
      <Text className="text-base font-semibold ml-2" style={{ color: colors.primary }}>
        {item.calories}
      </Text>
    </View>
  )
}
