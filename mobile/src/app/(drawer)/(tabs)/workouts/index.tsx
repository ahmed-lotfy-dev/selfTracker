import React, { useState, useMemo } from "react"
import { useThemeColors } from "@/src/constants/Colors"
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
} from "react-native"
import { safeParseDate } from "@/src/lib/utils/dateUtils"
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

import { useLiveQuery, eq } from "@tanstack/react-db"
import { useCollections } from "@/src/db/collections"

import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

export default function WorkoutScreen() {
  const [currentView, setCurrentView] = useState(VIEW_TYPES.LIST)
  const colors = useThemeColors()

  const collections = useCollections()
  if (!collections) return null

  const { data: workoutLogsData = [] } = useLiveQuery((q: any) =>
    q.from({ logs: collections.workoutLogs })
      .select(({ logs }: any) => ({
        id: logs.id,
        workoutName: logs.workout_name,
        createdAt: logs.created_at,
      }))
  ) ?? { data: [] }

  const workoutLogs = useMemo(() => workoutLogsData || [], [workoutLogsData])

  const stats = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const weeklyWorkouts = workoutLogs.filter(
      log => log.createdAt && safeParseDate(log.createdAt) > weekAgo
    ).length

    const monthlyWorkouts = workoutLogs.filter(
      log => log.createdAt && safeParseDate(log.createdAt) > monthAgo
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
          <WorkoutLogsList headerElement={headerContent} />
        )}
      </Animated.View>
    )
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
