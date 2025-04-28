import React, { useState } from "react"
import { View, Text, Pressable, ActivityIndicator } from "react-native"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWorkoutLogs } from "@/src/utils/api/workoutsApi"
import LogList from "@/src/components/LogList"
import WorkoutLogItem from "@/src/components/Workout/WorkoutLogItem"
import Header from "@/src/components/Header"
import CalendarView from "@/src/components/Workout/CalendarView"
import AddButton from "@/src/components/Buttons/AddButton"
import { COLORS } from "@/src/constants/Colors"

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
    refetch,
    isRefetching,
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

  const logs = data?.pages.flatMap((page) => page.logs || []) ?? []

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

  if (logs.length === 0 && !isLoading) {
    return (
      <View className="flex-1 justify-start items-start">
        <Header title="Weight Logs" />
        <Text className="text-gray-500">No weight logs available.</Text>
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
      return <CalendarView />
    }
    if (currentView === VIEW_TYPES.LIST) {
      return (
        <LogList
          logs={logs}
          renderItem={({ item }) => (
            <WorkoutLogItem item={item} path="/workouts" />
          )}
          refetch={refetch}
          isRefetching={isRefetching}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )
    }
  }

  return (
    <View className="flex-1 px-4">
      <Header title="Workout Logs" />
      <ViewSelector />
      {renderContent()}
      <AddButton path="/workouts" />
    </View>
  )
}
