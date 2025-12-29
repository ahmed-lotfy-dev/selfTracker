import React from "react"
import { View, Text, Pressable } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import type { FoodItem } from "@/src/types/nutrition"

type Props = {
  item: FoodItem
  isLast?: boolean
  onDelete?: () => void
}

export default function FoodItemRow({ item, isLast = false, onDelete }: Props) {
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
      <View className="flex-row items-center">
        <Text className="text-base font-semibold mr-3" style={{ color: colors.primary }}>
          {item.calories}
        </Text>
        {onDelete && (
          <Pressable onPress={onDelete} className="p-1">
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </Pressable>
        )}
      </View>
    </View>
  )
}

