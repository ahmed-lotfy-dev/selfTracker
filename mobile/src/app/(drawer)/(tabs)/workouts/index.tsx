import React, { useState, useMemo } from "react"
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
} from "react-native"
import { useQuery } from "@livestore/react"
import { queryDb } from "@livestore/livestore"
import { tables } from "@/src/livestore/schema"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import CalendarView from "@/src/components/features/workouts/CalendarView"
import AddButton from "@/src/components/Buttons/AddButton"
import { WorkoutLogsList } from "@/src/components/features/workouts/WorkoutLogsList"
import { WorkoutStatsRow } from "@/src/components/features/workouts/WorkoutStatsRow"

const VIEW_TYPES = {
  LIST: "list",
  CALENDAR: "calendar",
}

const allWorkoutLogs$ = queryDb(
  () => tables.workoutLogs.where({ deletedAt: null }),
  { label: 'workoutsScreenLogs' }
)

export default function WorkoutScreen() {
  const [currentView, setCurrentView] = useState(VIEW_TYPES.LIST)
  const workoutLogs = useQuery(allWorkoutLogs$)

  const stats = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const weeklyWorkouts = workoutLogs.filter(
      log => log.createdAt && new Date(log.createdAt) > weekAgo
    ).length

    const monthlyWorkouts = workoutLogs.filter(
      log => log.createdAt && new Date(log.createdAt) > monthAgo
    ).length

    return { weeklyWorkouts, monthlyWorkouts, totalWorkouts: workoutLogs.length }
  }, [workoutLogs])

  const toggleView = (view: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentView(view);
  };

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
    <View>
      <View className="mb-2">
        <WorkoutStatsRow
          weeklyWorkouts={stats.weeklyWorkouts}
          monthlyWorkouts={stats.monthlyWorkouts}
          totalWorkouts={stats.totalWorkouts}
        />
      </View>
      <ViewSelector />
    </View>
  )

  const renderContent = () => {
    if (currentView === VIEW_TYPES.CALENDAR) {
      return <CalendarView headerElement={headerContent} />
    }
    return <WorkoutLogsList headerElement={headerContent} />
  }

  return (
    <View className="flex-1 bg-background px-2">
      <View className="">
        <Header
          title="Workouts"
          rightAction={<DrawerToggleButton />}
        />
      </View>

      <View className="flex-1">
        {renderContent()}
      </View>

      <AddButton path="/workouts" />
    </View>
  )
}
