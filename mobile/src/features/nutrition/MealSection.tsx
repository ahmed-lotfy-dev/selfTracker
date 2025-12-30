import React from "react"
import { View, Text, Pressable } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import type { FoodLog, MealType } from "@/src/types/nutrition"
import { useNutritionStore } from "@/src/stores/useNutritionStore"
import { useAlertStore } from "@/src/features/ui/useAlertStore"
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
  const deleteFoodLog = useNutritionStore(s => s.deleteFoodLog)
  const updateFoodLog = useNutritionStore(s => s.updateFoodLog)
  const showAlert = useAlertStore(s => s.showAlert)

  const totalCalories = logs.reduce((sum, l) => sum + l.totalCalories, 0)

  const handleDeleteItem = (log: FoodLog, itemIndex: number) => {
    const itemToDelete = log.foodItems[itemIndex]
    const newFoodItems = log.foodItems.filter((_, idx) => idx !== itemIndex)

    if (newFoodItems.length === 0) {
      // If no items left, ask to delete the whole log
      showAlert(
        "Remove Meal",
        "This was the last item. Remove the entire meal entry?",
        () => deleteFoodLog(log.id),
        undefined,
        "Remove",
        "Cancel",
        "error"
      )
      return
    }

    // Show confirmation for deleting individual item
    showAlert(
      "Remove Item",
      `Remove ${itemToDelete.name} from this meal?`,
      () => {
        // Recalculate totals
        const updates = {
          foodItems: newFoodItems,
          totalCalories: log.totalCalories - itemToDelete.calories,
          totalProtein: (log.totalProtein || 0) - (itemToDelete.protein || 0),
          totalCarbs: (log.totalCarbs || 0) - (itemToDelete.carbs || 0),
          totalFat: (log.totalFat || 0) - (itemToDelete.fat || 0),
        }
        updateFoodLog(log.id, updates)
      },
      undefined,
      "Remove",
      "Cancel",
      "error"
    )
  }

  const handleDeleteLog = (id: string) => {
    showAlert(
      "Remove Meal Entry",
      "Are you sure you want to remove this entire meal entry?",
      () => deleteFoodLog(id),
      undefined,
      "Remove",
      "Cancel",
      "error"
    )
  }

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
        className="rounded-xl overflow-hidden shadow-sm"
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
            <View key={log.id} className="border-b border-border last:border-0" style={{ borderColor: `${colors.border}40` }}>
              {log.foodItems.map((item, idx) => (
                <FoodItemRow
                  key={`${log.id}-${idx}`}
                  item={item}
                  isLast={idx === log.foodItems.length - 1}
                  onDelete={() => handleDeleteItem(log, idx)}
                />
              ))}
              <Pressable
                onPress={() => handleDeleteLog(log.id)}
                className="py-2 items-center justify-center bg-black/5 dark:bg-white/5 active:bg-red-500/10"
              >
                <Text className="text-[10px] font-bold text-placeholder uppercase tracking-widest">Remove Entire Log</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </View>
  )
}

