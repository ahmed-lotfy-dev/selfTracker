import React from "react"
import { View, Text, Pressable, Modal, TextInput, ScrollView } from "react-native"
import { useState } from "react"
import { useThemeColors } from "@/src/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import type { FoodItem, MealType, FoodAnalysisResult } from "@/src/types/nutrition"

type Props = {
  result: FoodAnalysisResult
  mealType: MealType
  onConfirm: (foods: FoodItem[], mealType: MealType) => void
  onClose: () => void
}

export default function FoodResultsSheet({ result, mealType, onConfirm, onClose }: Props) {
  const colors = useThemeColors()
  const [foods, setFoods] = useState<FoodItem[]>(result.foods)
  const [selectedMealType, setSelectedMealType] = useState<MealType>(mealType)

  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0)

  const handleUpdateFood = (index: number, field: keyof FoodItem, value: string | number) => {
    setFoods(prev => prev.map((f, i) =>
      i === index ? { ...f, [field]: value } : f
    ))
  }

  const handleRemoveFood = (index: number) => {
    setFoods(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Modal transparent animationType="slide" visible>
      <View className="flex-1 justify-end">
        <Pressable
          className="flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={onClose}
        />
        <View
          className="rounded-t-3xl p-5 max-h-[80%]"
          style={{ backgroundColor: colors.background }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Detected Foods
            </Text>
            <View className="flex-row items-center">
              <Text className="text-sm mr-2" style={{ color: colors.placeholder }}>
                Confidence: {Math.round(result.confidence * 100)}%
              </Text>
              <Pressable onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={colors.placeholder} />
              </Pressable>
            </View>
          </View>

          <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
            {foods.map((food, index) => (
              <View
                key={index}
                className="p-4 rounded-xl mb-3"
                style={{ backgroundColor: colors.card }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-semibold flex-1" style={{ color: colors.text }}>
                    {food.name}
                  </Text>
                  <Pressable onPress={() => handleRemoveFood(index)}>
                    <Ionicons name="trash-outline" size={22} color={colors.error} />
                  </Pressable>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <TextInput
                      value={String(food.quantity)}
                      onChangeText={(v) => handleUpdateFood(index, "quantity", Number(v) || 0)}
                      keyboardType="numeric"
                      className="w-16 p-2 rounded-lg text-center"
                      style={{
                        backgroundColor: colors.border,
                        color: colors.text
                      }}
                    />
                    <Text className="ml-2" style={{ color: colors.placeholder }}>{food.unit}</Text>
                  </View>
                  <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                    {food.calories} kcal
                  </Text>
                </View>

                <View className="flex-row justify-around mt-3">
                  <Text style={{ color: colors.placeholder }}>P: {food.protein}g</Text>
                  <Text style={{ color: colors.placeholder }}>C: {food.carbs}g</Text>
                  <Text style={{ color: colors.placeholder }}>F: {food.fat}g</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                Total Calories
              </Text>
              <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                {totalCalories} kcal
              </Text>
            </View>

            <Pressable
              onPress={() => onConfirm(foods, selectedMealType)}
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold text-lg">Add to {selectedMealType}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
