import React from "react"
import { View, Text, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { MealType } from "@/src/types/nutritionType"

interface MealTypeSelectorProps {
  selectedMealType: MealType
  onSelectMealType: (type: MealType) => void
}

export default function MealTypeSelector({ selectedMealType, onSelectMealType }: MealTypeSelectorProps) {
  const colors = useThemeColors()

  const mealTypes: { value: MealType; label: string; icon: string }[] = [
    { value: "breakfast", label: "Breakfast", icon: "sunny-outline" },
    { value: "lunch", label: "Lunch", icon: "restaurant-outline" },
    { value: "dinner", label: "Dinner", icon: "moon-outline" },
    { value: "snack", label: "Snack", icon: "cafe-outline" },
  ]

  return (
    <View>
      <Text className="text-base font-medium mb-3" style={{ color: colors.text }}>
        Select Meal Type
      </Text>
      <View className="flex-row justify-between mb-6">
        {mealTypes.map((meal) => (
          <Pressable
            key={meal.value}
            onPress={() => onSelectMealType(meal.value)}
            className={`items-center p-3 rounded-xl flex-1 mx-1 ${
              selectedMealType === meal.value ? "border-2" : ""
            }`}
            style={{
              backgroundColor: selectedMealType === meal.value ? colors.card : colors.border,
              borderColor: colors.primary,
            }}
          >
            <Ionicons
              name={meal.icon as any}
              size={24}
              color={selectedMealType === meal.value ? colors.primary : colors.text}
            />
            <Text
              className="text-xs mt-1"
              style={{ color: selectedMealType === meal.value ? colors.primary : colors.text }}
            >
              {meal.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
