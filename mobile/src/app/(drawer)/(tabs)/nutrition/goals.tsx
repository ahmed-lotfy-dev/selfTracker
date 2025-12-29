import React from "react"
import { View, Text, TextInput, Pressable } from "react-native"
import { useState, useEffect } from "react"
import { useRouter } from "expo-router"
import { useThemeColors } from "@/src/constants/Colors"
import Header from "@/src/components/Header"
import { Ionicons } from "@expo/vector-icons"
import { useNutritionStore } from "@/src/stores/useNutritionStore"
import { setNutritionGoals } from "@/src/lib/api/nutritionApi"

export default function GoalsScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const goals = useNutritionStore((s) => s.goals)
  const setStoreGoals = useNutritionStore((s) => s.setGoals)

  const [dailyCalories, setDailyCalories] = useState(String(goals?.dailyCalories || 2000))
  const [proteinGrams, setProteinGrams] = useState(String(goals?.proteinGrams || 150))
  const [carbsGrams, setCarbsGrams] = useState(String(goals?.carbsGrams || 200))
  const [fatGrams, setFatGrams] = useState(String(goals?.fatGrams || 65))
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (goals) {
      setDailyCalories(String(goals.dailyCalories))
      setProteinGrams(String(goals.proteinGrams || 150))
      setCarbsGrams(String(goals.carbsGrams || 200))
      setFatGrams(String(goals.fatGrams || 65))
    }
  }, [goals])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const newGoals = await setNutritionGoals({
        dailyCalories: Number(dailyCalories),
        proteinGrams: Number(proteinGrams),
        carbsGrams: Number(carbsGrams),
        fatGrams: Number(fatGrams),
      })
      setStoreGoals(newGoals)
      router.back()
    } catch (error) {
      console.error("Failed to save goals:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const renderInput = (label: string, value: string, onChange: (v: string) => void, unit: string) => (
    <View className="mb-4">
      <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>{label}</Text>
      <View
        className="flex-row items-center rounded-xl px-4"
        style={{ backgroundColor: colors.card }}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          className="flex-1 py-4 text-lg"
          style={{ color: colors.text }}
          placeholderTextColor={colors.placeholder}
        />
        <Text style={{ color: colors.placeholder }}>{unit}</Text>
      </View>
    </View>
  )

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header
        title="Nutrition Goals"
        leftAction={
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        }
      />

      <View className="flex-1 px-4 py-6">
        {renderInput("Daily Calories", dailyCalories, setDailyCalories, "kcal")}
        {renderInput("Protein", proteinGrams, setProteinGrams, "grams")}
        {renderInput("Carbohydrates", carbsGrams, setCarbsGrams, "grams")}
        {renderInput("Fat", fatGrams, setFatGrams, "grams")}

        <View className="mt-6">
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 }}
          >
            <Text className="text-white font-bold text-lg">
              {isSaving ? "Saving..." : "Save Goals"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
