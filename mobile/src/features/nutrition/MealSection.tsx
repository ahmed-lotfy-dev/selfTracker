import React from "react"
import { View, Text, Pressable } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import type { FoodLog, MealType } from "@/src/types/nutritionType"
import { useNutritionStore } from "@/src/stores/useNutritionStore"
import { useAlertStore } from "@/src/features/ui/useAlertStore"
import FoodItemRow from "./FoodItemRow"
import { PremiumCard } from "@/src/components/ui/PremiumCard"

type Props = {
  title: string
  mealType: MealType
  logs: FoodLog[]
}

const normalizeItems = (items: any): any[] => {
  let processedItems = items
  
  // Handle stringified items (double stringification defense)
  if (typeof items === 'string') {
    try {
      processedItems = JSON.parse(items)
      if (typeof processedItems === 'string') {
        processedItems = JSON.parse(processedItems)
      }
    } catch (e) {
      return []
    }
  }

  if (!Array.isArray(processedItems)) return []
  
  return processedItems.map(item => ({
    ...item,
    name: item.name ?? 'Unknown Item',
    quantity: item.quantity ?? item.amount ?? 1,
    unit: item.unit ?? 'u',
    calories: item.calories ?? item.kcal ?? 0,
    protein: item.protein ?? 0,
    carbs: item.carbs ?? 0,
    fat: item.fat ?? 0
  }))
}

const mealIcons: Record<MealType, string> = {
  breakfast: "sunny",
  lunch: "restaurant",
  dinner: "moon",
  snack: "cafe",
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

    showAlert(
      "Remove Item",
      `Remove ${itemToDelete.name} from this meal?`,
      () => {
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
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3 px-1">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
            <Ionicons
              name={mealIcons[mealType] as any}
              size={16}
              color={colors.primary}
            />
          </View>
          <Text className="text-sm font-black text-white/90 uppercase tracking-widest ml-3">
            {title}
          </Text>
        </View>
        <View className="bg-white/5 px-2 py-1 rounded-md">
          <Text className="text-[10px] font-black text-white/40 uppercase tracking-tighter">
            {totalCalories} kcal
          </Text>
        </View>
      </View>

      <PremiumCard
        gradientColors={['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.01)']}
        containerStyle="p-0 border-white/5"
      >
        {logs.length === 0 ? (
          <View className="py-8 items-center">
            <Ionicons
              name="add-circle-outline"
              size={24}
              color="rgba(255,255,255,0.1)"
            />
            <Text className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">
              No items logged
            </Text>
          </View>
        ) : (
          logs.map((log) => {
            const items = normalizeItems(log.foodItems)
            return (
              <View key={log.id} className="border-b border-white/5 last:border-0">
                {items.map((item, idx) => (
                  <FoodItemRow
                    key={`${log.id}-${idx}`}
                    item={item}
                    isLast={idx === items.length - 1}
                    onDelete={() => handleDeleteItem(log, idx)}
                  />
                ))}
                <Pressable
                  onPress={() => handleDeleteLog(log.id)}
                  className="py-3 items-center justify-center bg-red-500/5 active:bg-red-500/10"
                >
                  <Text className="text-[9px] font-black text-white uppercase tracking-widest">
                    Remove Meal Log - {items.length} items
                  </Text>
                </Pressable>
              </View>
            )
          })
        )}
      </PremiumCard>
    </View>
  )
}
