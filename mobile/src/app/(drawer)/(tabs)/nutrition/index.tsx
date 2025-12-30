import React, { useEffect, useMemo } from "react"
import { View, ScrollView } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import AddButton from "@/src/components/Buttons/AddButton"
import { useNutritionStore, getTodaysFoodLogs, getTodaysCalories } from "@/src/stores/useNutritionStore"
import DailyIntakeCard from "@/src/features/nutrition/DailyIntakeCard"
import MealSection from "@/src/features/nutrition/MealSection"
import { getFoodLogs, getNutritionGoals } from "@/src/lib/api/nutritionApi"
import type { FoodLog } from "@/src/types/nutrition"

export default function NutritionScreen() {
  const colors = useThemeColors()
  const foodLogs = useNutritionStore((s) => s.foodLogs)
  const goals = useNutritionStore((s) => s.goals)
  const setFoodLogs = useNutritionStore((s) => s.setFoodLogs)
  const setGoals = useNutritionStore((s) => s.setGoals)

  const todaysLogs = useMemo(() => getTodaysFoodLogs(foodLogs), [foodLogs])
  const totalCalories = useMemo(() => getTodaysCalories(foodLogs), [foodLogs])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [nutritionGoals] = await Promise.all([
          getNutritionGoals()
        ])
        setGoals(nutritionGoals)
      } catch (error) {
        console.error("Failed to load nutrition data:", error)
      }
    }
    loadData()
  }, [])

  const handleOpenGoals = () => {
    // Router is handled via AddButton path pattern
  }

  const goalCalories = goals?.dailyCalories || 2000

  const breakfastLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType === "breakfast"), [todaysLogs])
  const lunchLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType === "lunch"), [todaysLogs])
  const dinnerLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType === "dinner"), [todaysLogs])
  const snackLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType === "snack"), [todaysLogs])

  return (
    <View className="flex-1 bg-background px-2">
      <Header
        title="Nutrition"
        rightAction={<DrawerToggleButton />}
      />

      <ScrollView className="flex-1 px-2" contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <DailyIntakeCard
          consumed={totalCalories}
          goal={goalCalories}
          onPressGoals={handleOpenGoals}
        />

        <MealSection title="Breakfast" mealType="breakfast" logs={breakfastLogs} />
        <MealSection title="Lunch" mealType="lunch" logs={lunchLogs} />
        <MealSection title="Dinner" mealType="dinner" logs={dinnerLogs} />
        <MealSection title="Snacks" mealType="snack" logs={snackLogs} />

      </ScrollView>

      <AddButton path="/nutrition" icon="camera" iconFamily="ionicons" />
    </View>
  )
}


