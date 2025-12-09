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
import CalendarView from "@/src/components/Workout/CalendarView"
import AddButton from "@/src/components/Buttons/AddButton"
import { WorkoutLogsList } from "@/src/components/Workout/WorkoutLogsList"
import { WorkoutStatsRow } from "@/src/components/Workout/WorkoutStatsRow"

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

  // Enable LayoutAnimation for Android
  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  const toggleView = (view: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentView(view);
  };

  const ViewSelector = () => (
    <View className="flex-row mx-2 mb-6 bg-gray-100 p-1 rounded-full h-12">
      <Pressable
        onPress={() => toggleView(VIEW_TYPES.LIST)}
        className={`flex-1 items-center justify-center rounded-full ${
          currentView === VIEW_TYPES.LIST ? "bg-white shadow-sm" : ""
        }`}
      >
        <Text className={`text-sm font-semibold ${currentView === VIEW_TYPES.LIST ? "text-gray-900" : "text-gray-500"}`}>Timeline</Text>
      </Pressable>
      <Pressable
        onPress={() => toggleView(VIEW_TYPES.CALENDAR)}
        className={`flex-1 items-center justify-center rounded-full ${
          currentView === VIEW_TYPES.CALENDAR ? "bg-white shadow-sm" : ""
        }`}
      >
        <Text className={`text-sm font-semibold ${currentView === VIEW_TYPES.CALENDAR ? "text-gray-900" : "text-gray-500"}`}>Calendar</Text>
      </Pressable>
    </View>
  )

  const headerContent = (
    <View>
      <View className="mb-2">
          <WorkoutStatsRow
            weeklyWorkouts={homeData?.weeklyWorkout || 0}
            monthlyWorkouts={homeData?.monthlyWorkout || 0}
            totalWorkouts={homeData?.totalWorkouts || 0}
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
    <View className="flex-1 bg-gray-50 px-3 pt-3">
      <View className="">
        <Header title="Workouts" />
      </View>
      
      <View className="flex-1">
        {renderContent()}
      </View>

      <AddButton path="/workouts" />
    </View>
  )
}

