import React, { useState } from "react"
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native"
import { useQuery } from "@tanstack/react-query"
import { fetchUserHomeInfo } from "@/src/lib/api/userApi"
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

export default function WorkoutScreen() {
  const [currentView, setCurrentView] = useState(VIEW_TYPES.LIST)

  const { data: homeData } = useQuery({
    queryKey: ["userHomeData"],
    queryFn: fetchUserHomeInfo,
  })

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
          weeklyWorkouts={homeData?.weeklyWorkout || 0}
          monthlyWorkouts={homeData?.monthlyWorkout || 0}
          totalWorkouts={homeData?.stats?.totalWorkouts || 0}
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

