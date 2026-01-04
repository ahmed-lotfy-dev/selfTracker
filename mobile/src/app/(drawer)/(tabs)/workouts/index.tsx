import React, { useState, useMemo, useEffect } from "react"
import { useThemeColors } from "@/src/constants/Colors"
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
} from "react-native"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import CalendarView from "@/src/components/features/workouts/CalendarView"
import AddButton from "@/src/components/Buttons/AddButton"
import { WorkoutLogsList } from "@/src/components/features/workouts/WorkoutLogsList"
import { WorkoutStatsRow } from "@/src/components/features/workouts/WorkoutStatsRow"
import { WorkoutChart } from "@/src/components/features/workouts/WorkoutChart"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"

const VIEW_TYPES = {
  LIST: "list",
  CALENDAR: "calendar",
}

export default function WorkoutScreen() {
  const [currentView, setCurrentView] = useState(VIEW_TYPES.LIST)
  const colors = useThemeColors()
  const workoutLogs = useWorkoutsStore(s => s.workoutLogs)
  const fetchWorkoutLogs = useWorkoutsStore(s => s.fetchWorkoutLogs)

  useEffect(() => {
    fetchWorkoutLogs()
  }, [])

  const stats = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const activeLogs = workoutLogs.filter(w => !w.deletedAt)
    const weeklyWorkouts = activeLogs.filter(w => new Date(w.createdAt) > weekAgo).length
    const monthlyWorkouts = activeLogs.filter(w => new Date(w.createdAt) > monthAgo).length
    const uniqueWorkoutsThisWeek = new Set(
      activeLogs
        .filter(w => new Date(w.createdAt) > weekAgo)
        .map(w => w.workoutName)
    ).size

    return { weeklyWorkouts, monthlyWorkouts, uniqueWorkoutsThisWeek }
  }, [workoutLogs])

  const toggleView = (view: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCurrentView(view)
  }

  const ViewSelector = () => (
    <View className="flex-row mx-2 mb-6 bg-card p-1 rounded-full h-12 border border-border">
      <Pressable
        onPress={() => toggleView(VIEW_TYPES.LIST)}
        className={`flex-1 items-center justify-center rounded-full ${currentView === VIEW_TYPES.LIST ? "bg-primary shadow-sm" : ""
          }`}
      >
        <Text className={`text-sm font-semibold ${currentView === VIEW_TYPES.LIST ? "text-white" : "text-placeholder"}`}>Timeline</Text>
      </Pressable>
      <Pressable
        onPress={() => toggleView(VIEW_TYPES.CALENDAR)}
        className={`flex-1 items-center justify-center rounded-full ${currentView === VIEW_TYPES.CALENDAR ? "bg-primary shadow-sm" : ""
          }`}
      >
        <Text className={`text-sm font-semibold ${currentView === VIEW_TYPES.CALENDAR ? "text-white" : "text-placeholder"}`}>Calendar</Text>
      </Pressable>
    </View>
  )

  const headerContent = (
    <View className="pt-2">
      <View className="mb-2">
        <WorkoutStatsRow
          weeklyWorkouts={stats.weeklyWorkouts}
          monthlyWorkouts={stats.monthlyWorkouts}
          uniqueWorkoutsThisWeek={stats.uniqueWorkoutsThisWeek}
        />
      </View>
      <View className="px-2">
        <WorkoutChart />
      </View>
      <ViewSelector />
    </View>
  )

  const renderContent = () => {
    return (
      <Animated.View
        key={currentView}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        className="flex-1"
      >
        {currentView === VIEW_TYPES.CALENDAR ? (
          <CalendarView headerElement={headerContent} />
        ) : (
          <WorkoutLogsList ListHeaderComponent={headerContent} />
        )}
      </Animated.View>
    )
  }

  return (
    <View className="flex-1 bg-background px-2">
      <Header
        title="Workouts"
        rightAction={<DrawerToggleButton />}
      />
      <View className="flex-1">
        {renderContent()}
      </View>
      <AddButton path="/workouts" />
    </View>
  )
}
