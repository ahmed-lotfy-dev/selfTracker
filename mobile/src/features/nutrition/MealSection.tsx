import React from "react"
import { View, Text, Pressable } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import type { FoodLog, MealType } from "@/src/types/nutritionType"
import { useNutritionStore } from "@/src/stores/useNutritionStore"
import { useAlertStore } from "@/src/features/ui/useAlertStore"
import FoodItemRow from "./FoodItemRow"

type Props = {
  title: string
  mealType: MealType
  logs: FoodLog[]
}

const normalizeItems = (items: any): any[] => {
  let processedItems = items
  if (typeof processedItems === 'string') {
    try { processedItems = JSON.parse(processedItems) } catch { return [] }
  }
  if (!Array.isArray(processedItems)) return []
  return processedItems.map(item => ({
    ...item,
    name: item.name ?? 'Unknown Item',
    quantity: item.quantity ?? 1,
    unit: item.unit ?? 'u',
    calories: item.calories ?? 0,
    protein: item.protein ?? 0,
    carbs: item.carbs ?? 0,
    fat: item.fat ?? 0,
  }))
}

const MEAL_META: Record<MealType, { icon: string; color: string; bg: string }> = {
  breakfast: { icon: "sunny", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  lunch:     { icon: "restaurant", color: "#34d399", bg: "rgba(52,211,153,0.15)" },
  dinner:    { icon: "moon", color: "#818cf8", bg: "rgba(129,140,248,0.15)" },
  snack:     { icon: "cafe", color: "#f472b6", bg: "rgba(244,114,182,0.15)" },
}

export default function MealSection({ title, mealType, logs }: Props) {
  const colors = useThemeColors()
  const deleteFoodLog = useNutritionStore(s => s.deleteFoodLog)
  const updateFoodLog = useNutritionStore(s => s.updateFoodLog)
  const showAlert = useAlertStore(s => s.showAlert)

  const meta = MEAL_META[mealType]
  const totalCalories = logs.reduce((sum, l) => sum + l.totalCalories, 0)
  const hasLogs = logs.length > 0

  const handleDeleteItem = (log: FoodLog, itemIndex: number) => {
    const itemToDelete = log.foodItems[itemIndex]
    const newFoodItems = log.foodItems.filter((_, idx) => idx !== itemIndex)
    if (newFoodItems.length === 0) {
      showAlert("Remove Meal", "This was the last item. Remove the entire meal entry?",
        () => deleteFoodLog(log.id), undefined, "Remove", "Cancel", "error")
      return
    }
    showAlert("Remove Item", `Remove ${itemToDelete.name} from this meal?`,
      () => updateFoodLog(log.id, {
        foodItems: newFoodItems,
        totalCalories: log.totalCalories - itemToDelete.calories,
        totalProtein: (log.totalProtein || 0) - (itemToDelete.protein || 0),
        totalCarbs: (log.totalCarbs || 0) - (itemToDelete.carbs || 0),
        totalFat: (log.totalFat || 0) - (itemToDelete.fat || 0),
      }), undefined, "Remove", "Cancel", "error")
  }

  const handleDeleteLog = (id: string) => {
    showAlert("Remove Meal Entry", "Are you sure you want to remove this entire meal entry?",
      () => deleteFoodLog(id), undefined, "Remove", "Cancel", "error")
  }

  return (
    <View className="mb-5">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <View className="flex-row items-center gap-3">
          <View
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: meta.bg }}
          >
            <Ionicons name={meta.icon as any} size={17} color={meta.color} />
          </View>
          <Text
            className="text-sm font-black uppercase tracking-[2px]"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {title}
          </Text>
        </View>

        {hasLogs && (
          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: meta.bg }}
          >
            <Text
              className="text-[10px] font-black uppercase tracking-tighter"
              style={{ color: meta.color }}
            >
              {totalCalories} kcal
            </Text>
          </View>
        )}
      </View>

      {/* Card Body */}
      <View
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.03)" }}
      >
        {!hasLogs ? (
          <View className="py-7 items-center gap-2">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: meta.bg }}
            >
              <Ionicons name="add" size={20} color={meta.color} />
            </View>
            <Text className="text-[10px] font-bold text-white/20 uppercase tracking-[2px]">
              Nothing logged yet
            </Text>
          </View>
        ) : (
          logs.map((log, logIdx) => {
            const items = normalizeItems(log.foodItems)
            const isLastLog = logIdx === logs.length - 1
            return (
              <View
                key={log.id}
                className={!isLastLog ? "border-b" : ""}
                style={!isLastLog ? { borderColor: "rgba(255,255,255,0.05)" } : undefined}
              >
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
                  className="py-2.5 mx-4 mb-3 items-center rounded-xl"
                  style={{ backgroundColor: "rgba(239,68,68,0.06)" }}
                >
                  <Text className="text-[9px] font-black text-red-400/60 uppercase tracking-widest">
                    Remove log · {items.length} item{items.length !== 1 ? "s" : ""}
                  </Text>
                </Pressable>
              </View>
            )
          })
        )}
      </View>
    </View>
  )
}