import React, { useState } from "react"
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWorkoutLogs } from "@/src/lib/api/workoutsApi"
import WorkoutLogItem from "@/src/components/Workout/WorkoutLogItem"
import Header from "@/src/components/Header"
import CalendarView from "@/src/components/Workout/CalendarView"
import AddButton from "@/src/components/Buttons/AddButton"
import { COLORS } from "@/src/constants/Colors"
import { FlashList } from "@shopify/flash-list"
import { WorkoutLogsList } from "@/src/components/Workout/WorkoutLogsList"

const VIEW_TYPES = {
  LIST: "list",
  CALENDAR: "calendar",
}

export default function WorkoutScreen() {
  const [currentView, setCurrentView] = useState(VIEW_TYPES.LIST)

  const ViewSelector = () => (
    <View className="flex-row my-4 bg-gray-200 rounded-full p-1">
      <Pressable
        onPress={() => setCurrentView(VIEW_TYPES.LIST)}
        className={`flex-1 items-center py-2 rounded-full ${
          currentView === VIEW_TYPES.LIST ? "bg-white shadow-md" : ""
        }`}
      >
        <Text className="text-gray-700">List</Text>
      </Pressable>
      <Pressable
        onPress={() => setCurrentView(VIEW_TYPES.CALENDAR)}
        className={`flex-1 items-center py-2 rounded-full ${
          currentView === VIEW_TYPES.CALENDAR ? "bg-white shadow-md" : ""
        }`}
      >
        <Text className="text-gray-700">Calendar</Text>
      </Pressable>
    </View>
  )

  const renderContent = () => {
    if (currentView === VIEW_TYPES.CALENDAR) {
      return <CalendarView />
    }
    if (currentView === VIEW_TYPES.LIST) {
      return <WorkoutLogsList />
    }
  }

  return (
    <View className="flex-1 px-4 ">
      <ViewSelector />
      {renderContent()}
      <AddButton path="/workouts" />
    </View>
  )
}
