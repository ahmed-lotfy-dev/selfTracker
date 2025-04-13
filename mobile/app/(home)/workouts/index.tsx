import React, { Suspense, useState } from "react"
import { View, Text, Pressable, ActivityIndicator } from "react-native"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWorkoutLogs } from "@/utils/api/workoutsApi"
import LogList from "@/components/LogList"
import WorkoutLogItem from "@/components/Workout/WorkoutLogItem"
import Header from "@/components/Header"
import CalendarView from "@/components/CalendarView"
import AddButton from "@/components/AddButton"
import { COLORS } from "@/constants/Colors"

const VIEW_TYPES = {
  LIST: "list",
  CALENDAR: "calendar",
}

export default function WorkoutScreen() {
  const [currentView, setCurrentView] = useState(VIEW_TYPES.LIST)
  const limit = 10

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["workoutLogs"],
    queryFn: ({ pageParam }) => fetchAllWorkoutLogs(pageParam, limit),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="p-4">
        <Text className="text-red-500">
          Failed to load workouts. Please try again.
        </Text>
        <Text className="text-red-500">{error.message}</Text>
      </View>
    )
  }

  const logs = data?.pages.flatMap((page) => page.workoutLogs) || []

  if (logs.length === 0 && !isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">No workout logs available.</Text>
      </View>
    )
  }

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
      return (
        <Suspense
          fallback={<ActivityIndicator size="large" color={COLORS.primary} />}
        >
          <CalendarView />
        </Suspense>
      )
    }
    if (currentView === VIEW_TYPES.LIST) {
      return (
        <Suspense
          fallback={<ActivityIndicator size="large" color={COLORS.primary} />}
        >
          <LogList
            logs={logs}
            renderItem={({ item }) => (
              <WorkoutLogItem item={item} path="/workouts" />
            )}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </Suspense>
      )
    }
  }

  return (
    <View className="flex-1 p-4">
      <Header title="Workout Logs" />
      <ViewSelector />
      {renderContent()}
      <AddButton path="/workouts" />
    </View>
  )
}
