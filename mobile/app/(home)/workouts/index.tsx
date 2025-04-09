import React, { useState } from "react"
import { View, Text, Pressable, ActivityIndicator } from "react-native"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWorkoutLogs } from "@/utils/api/workoutsApi"
import LogList from "@/components/LogList"
import WorkoutLogItem from "@/components/Workout/WorkoutLogItem"
import Header from "@/components/Header"
import Table from "@/components/Table"
import CalendarView from "@/components/CalendarView"
import AddButton from "@/components/AddButton"
import { COLORS } from "@/constants/Colors"

export default function WorkoutScreen() {
  const [view, setView] = useState("list")
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
  console.log({ data })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View>
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

  return (
    <View className="flex-1 p-4 justify-center">
      <Header title="Workout Logs" />

      <View className="flex-row my-4 bg-gray-300 rounded-full p-1">
        <Pressable
          onPress={() => setView("list")}
          className={`flex-1 items-center py-2 rounded-full ${
            view === "list" ? "bg-white shadow-md" : ""
          }`}
        >
          <Text className="text-gray-700">List</Text>
        </Pressable>
        <Pressable
          onPress={() => setView("calendar")}
          className={`flex-1 items-center py-2 rounded-full ${
            view === "calendar" ? "bg-white shadow-md" : ""
          }`}
        >
          <Text className="text-gray-700">Calendar</Text>
        </Pressable>
      </View>
      {view === "calendar" && <CalendarView />}
      {view === "list" && (
        <LogList
          logs={logs}
          renderItem={({ item }) => (
            <WorkoutLogItem item={item} path="/workouts" />
          )}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}

      <AddButton path="/workouts" />
    </View>
  )
}
