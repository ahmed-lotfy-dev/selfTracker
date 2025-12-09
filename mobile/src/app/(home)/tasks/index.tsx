import React from "react"
import { useQuery } from "@tanstack/react-query"
import { FlatList, RefreshControl, Text, View } from "react-native"
import Header from "@/src/components/Header"
import TaskForm from "@/src/components/Task/TaskForm"
import TaskListItem from "@/src/components/Task/TaskListItem"
import { COLORS } from "@/src/constants/Colors"
import { fetchAllTasks } from "@/src/lib/api/tasksApi"
import { TaskType } from "@/src/types/taskType"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import TaskProgress from "@/src/components/Task/TaskProgress"

export default function TaskScreen() {
  const {
    data: tasks,
    refetch,
    isRefetching,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchAllTasks(),
  })

  if (isLoading || !tasks) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivitySpinner size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center px-4 bg-gray-50">
        <Text className="text-red-500 text-center">
          Error loading tasks. Please try again later.
        </Text>
      </View>
    )
  }

  // Sort: Incomplete first, then completed.
  const sortedTasks = tasks.sort((a: TaskType, b: TaskType) => {
    return Number(a.completed) - Number(b.completed)
  })

  // ListHeader with Progress and Form
  const ListHeader = (
    <View className="px-3 mt-5">
      <Header title="Tasks" />
      <TaskProgress tasks={tasks} />
      <TaskForm />
      <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">Your List</Text>
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item?.id.toString()}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-gray-400 font-medium text-center">
              No tasks yet. Add one to get started!
            </Text>
          </View>
        }
        renderItem={({ item }: { item: TaskType }) => (
          <View className="px-4">
            <TaskListItem task={item} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
