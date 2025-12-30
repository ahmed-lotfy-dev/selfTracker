import React, { useEffect, useMemo } from "react"
import { View, ScrollView, Text, Pressable } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import Header from "@/src/components/Header"
import { Ionicons } from "@expo/vector-icons"
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

  const [selectedDate, setSelectedDate] = React.useState(new Date())

  // Filter logs for the selected date
  const todaysLogs = useMemo(() => {
    return foodLogs.filter(log => {
      const logDate = new Date(log.loggedAt)
      return logDate.toDateString() === selectedDate.toDateString()
    })
  }, [foodLogs, selectedDate])

  const totalCalories = useMemo(() => {
    return todaysLogs.reduce((sum, log) => sum + log.totalCalories, 0)
  }, [todaysLogs])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [nutritionGoals] = await Promise.all([
          getNutritionGoals()
        ])
        console.log('[Nutrition] Loaded goals:', nutritionGoals)
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

        {/* Date Navigation */}
        <View className="flex-row items-center justify-between py-4 mb-2">
          <Pressable onPress={() => {
            const d = new Date(selectedDate)
            d.setDate(d.getDate() - 1)
            setSelectedDate(d)
          }} className="p-2">
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </Pressable>

          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            {selectedDate.toDateString() === new Date().toDateString() ? "Today" : selectedDate.toDateString()}
          </Text>

          <Pressable onPress={() => {
            const d = new Date(selectedDate)
            d.setDate(d.getDate() + 1)
            setSelectedDate(d)
          }} className="p-2">
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </Pressable>
        </View>

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

      {/* Pass selected date to add screen so it defaults to the view date */}
      <AddButton
        path={`/nutrition/add?date=${selectedDate ? selectedDate.toISOString() : new Date().toISOString()}`}
        icon="camera"
        iconFamily="ionicons"
      />
    </View>
  )
}


