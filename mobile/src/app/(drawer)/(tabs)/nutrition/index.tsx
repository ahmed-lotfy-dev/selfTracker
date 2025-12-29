import React, { useEffect, useMemo } from "react"
import { View, ScrollView, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useThemeColors } from "@/src/constants/Colors"
import Header from "@/src/components/Header"
import { Ionicons } from "@expo/vector-icons"
import { useNutritionStore, getTodaysFoodLogs, getTodaysCalories } from "@/src/stores/useNutritionStore"
import DailyIntakeCard from "@/src/features/nutrition/DailyIntakeCard"
import MealSection from "@/src/features/nutrition/MealSection"
import { getFoodLogs, getNutritionGoals } from "@/src/lib/api/nutritionApi"
import type { FoodLog } from "@/src/types/nutrition"

export default function NutritionScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const foodLogs = useNutritionStore((s) => s.foodLogs)
  const goals = useNutritionStore((s) => s.goals)
  const setFoodLogs = useNutritionStore((s) => s.setFoodLogs)
  const setGoals = useNutritionStore((s) => s.setGoals)

  const todaysLogs = useMemo(() => getTodaysFoodLogs(foodLogs), [foodLogs])
  const totalCalories = useMemo(() => getTodaysCalories(foodLogs), [foodLogs])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [logs, nutritionGoals] = await Promise.all([
          getFoodLogs(),
          getNutritionGoals()
        ])
        setFoodLogs(logs)
        setGoals(nutritionGoals)
      } catch (error) {
        console.error("Failed to load nutrition data:", error)
      }
    }
    loadData()
  }, [])

  const handleAddFood = () => {
    router.push("/nutrition/log")
  }

  const handleOpenGoals = () => {
    router.push("/nutrition/goals")
  }

  const goalCalories = goals?.dailyCalories || 2000

  const breakfastLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType === "breakfast"), [todaysLogs])
  const lunchLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType === "lunch"), [todaysLogs])
  const dinnerLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType === "dinner"), [todaysLogs])
  const snackLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType === "snack"), [todaysLogs])

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header title="Nutrition" />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <DailyIntakeCard
          consumed={totalCalories}
          goal={goalCalories}
          onPressGoals={handleOpenGoals}
        />

        <MealSection title="Breakfast" mealType="breakfast" logs={breakfastLogs} />
        <MealSection title="Lunch" mealType="lunch" logs={lunchLogs} />
        <MealSection title="Dinner" mealType="dinner" logs={dinnerLogs} />
        <MealSection title="Snacks" mealType="snack" logs={snackLogs} />

        <View className="h-24" />
      </ScrollView>

      <Pressable
        onPress={handleAddFood}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: colors.primary }}
      >
        <Ionicons name="camera" size={28} color="white" />
      </Pressable>
    </View>
  )
}

