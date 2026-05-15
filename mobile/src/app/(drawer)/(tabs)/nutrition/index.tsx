import React, { useEffect, useMemo, useState } from "react"
import { View, ScrollView, Text, Pressable, StyleSheet } from "react-native"
import { LinearGradient } from 'expo-linear-gradient'
import { useThemeColors } from "@/src/constants/Colors"
import Header from "@/src/components/Header"
import { Ionicons } from "@expo/vector-icons"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import { AddButton } from "@/src/components/Buttons/AddButton"
import { todayLocal } from "@/src/lib/dateUtils"
import { useNutritionStore } from "@/src/stores/useNutritionStore"
import DailyIntakeCard from "@/src/features/nutrition/DailyIntakeCard"
import MealSection from "@/src/features/nutrition/MealSection"
import { getNutritionGoals } from "@/src/lib/api/nutritionApi"
import type { FoodLog } from "@/src/types/nutritionType"

export default function NutritionScreen() {
  const colors = useThemeColors()
  const foodLogs = useNutritionStore((s) => s.foodLogs)
  const goals = useNutritionStore((s) => s.goals)
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
        const nutritionGoals = await getNutritionGoals()
        setGoals(nutritionGoals)
      } catch (error) {
        console.error("Failed to load nutrition data:", error)
      }
    }
    loadData()
  }, [])

  const handleOpenGoals = () => {
  }

  const goalCalories = goals?.dailyCalories || 2000

  const breakfastLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType?.toLowerCase() === "breakfast"), [todaysLogs])
  const lunchLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType?.toLowerCase() === "lunch"), [todaysLogs])
  const dinnerLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType?.toLowerCase() === "dinner"), [todaysLogs])
  const snackLogs = useMemo(() => todaysLogs.filter((l: FoodLog) => l.mealType?.toLowerCase() === "snack"), [todaysLogs])

  return (
    <View className="flex-1 bg-background px-4">
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <Header
        title="Nutrition"
        rightAction={<DrawerToggleButton />}
      />
      <View className="flex-1 mt-2">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>

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
            logs={todaysLogs}
            onPressGoals={handleOpenGoals}
          />

          <MealSection title="Breakfast" mealType="breakfast" logs={breakfastLogs} />
          <MealSection title="Lunch" mealType="lunch" logs={lunchLogs} />
          <MealSection title="Dinner" mealType="dinner" logs={dinnerLogs} />
          <MealSection title="Snacks" mealType="snack" logs={snackLogs} />

        </ScrollView>
      </View>

      <AddButton
        path={`/nutrition/add?date=${selectedDate ? selectedDate : todayLocal()}`}
        icon="camera"
        iconFamily="ionicons"
      />
    </View>
  )
}
