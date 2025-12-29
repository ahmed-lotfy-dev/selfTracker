import React from "react"
import { View, Text } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import type { FoodLog, MealType } from "@/src/types/nutrition"
import FoodItemRow from "./FoodItemRow"

type Props = {
  title: string
  mealType: MealType
  logs: FoodLog[]
}

const mealIcons: Record<MealType, string> = {
  breakfast: "sunny-outline",
  lunch: "restaurant-outline",
  dinner: "moon-outline",
  snack: "cafe-outline",
}

export default function MealSection({ title, mealType, logs }: Props) {
  const colors = useThemeColors()

  const totalCalories = logs.reduce((sum, l) => sum + l.totalCalories, 0)

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Ionicons
            name={mealIcons[mealType] as any}
            size={20}
            color={colors.primary}
          />
          <Text
            className="text-base font-semibold ml-2"
            style={{ color: colors.text }}
          >
            {title}
          </Text>
        </View>
        <Text className="text-sm" style={{ color: colors.placeholder }}>
          {totalCalories} kcal
        </Text>
      </View>

      <View
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: colors.card }}
      >
        {logs.length === 0 ? (
          <View className="py-6 items-center">
            <Ionicons
              name="add-circle-outline"
              size={32}
              color={colors.border}
            />
            <Text
              className="text-sm mt-2"
              style={{ color: colors.placeholder }}
            >
              No items logged
            </Text>
          </View>
        ) : (
          logs.map((log) => (
            log.foodItems.map((item, idx) => (
              <FoodItemRow
                key={`${log.id}-${idx}`}
                item={item}
                isLast={idx === log.foodItems.length - 1}
              />
            ))
          ))
        )}
      </View>
    </View>
  )
}
