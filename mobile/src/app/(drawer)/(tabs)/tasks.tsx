import React, { useMemo } from "react"
import { FlatList, Text, View, ActivityIndicator } from "react-native"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import TaskForm from "@/src/components/features/tasks/TaskForm"
import TaskListItem from "@/src/components/features/tasks/TaskListItem"
import { useLiveQuery } from "@tanstack/react-db"
import { taskCollection } from "@/src/db/collections"
import TaskProgress from "@/src/components/features/tasks/TaskProgress"


export default function TaskScreen() {
  // Handle case where collection isn't ready yet
  if (!taskCollection) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-placeholder text-sm">Loading tasks...</Text>
      </View>
    )
  }

  const { data: tasksData, isLoading } = useLiveQuery((q) =>
    q.from({ tasks: taskCollection })
      .select(({ tasks }) => tasks)
  ) as { data: any[], isLoading: boolean }

  const tasks = useMemo(() => tasksData || [], [tasksData])

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      return Number(a.completed) - Number(b.completed)
    })
  }, [tasks])

  // Show loading during initial sync
  if (isLoading) {
    return (
      <View className="flex-1 bg-background px-2">
        <Header
          title="Tasks"
          rightAction={<DrawerToggleButton />}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-4 text-placeholder text-sm">Syncing tasks...</Text>
        </View>
      </View>
    )
  }

  const ListHeader = (
    <View className="">
      <Header
        title="Tasks"
        rightAction={<DrawerToggleButton />}
      />
      <TaskProgress tasks={tasks as any} />
      <TaskForm />
      <Text className="text-lg font-bold text-text mx-2 my-3">Your List</Text>
    </View>
  )

  return (
    <View className="flex-1 bg-background px-2">
      <FlatList
        data={sortedTasks}
        keyExtractor={(item, index) => item?.id?.toString() || `task-${index}`}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-placeholder font-medium text-center">
              No tasks yet. Add one to get started!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-2">
            <TaskListItem task={item as any} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
