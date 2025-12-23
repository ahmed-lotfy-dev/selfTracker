import React, { useMemo } from "react"
import { FlatList, Text, View, ActivityIndicator } from "react-native"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import TaskForm from "@/src/components/features/tasks/TaskForm"
import TaskListItem from "@/src/components/features/tasks/TaskListItem"
import { useCollections } from "@/src/db/collections"
import { useLiveQuery } from "@tanstack/react-db"
import TaskProgress from "@/src/components/features/tasks/TaskProgress"


export default function TaskScreen() {
  const collections = useCollections()

  // Wait for collections to be ready
  if (!collections?.tasks) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-placeholder text-sm">Loading tasks...</Text>
      </View>
    )
  }

  // Explicit field selection (this is what works with TanStack DB + ElectricSQL)
  const { data: tasks = [], isLoading } = useLiveQuery((q: any) =>
    q.from({ tasks: collections.tasks })
      .orderBy(({ tasks }: any) => tasks.createdAt, 'desc')
      .select(({ tasks }: any) => ({
        id: tasks.id,
        userId: tasks.userId,  // Required for updates
        title: tasks.title,
        completed: tasks.completed,
        category: tasks.category,
        createdAt: tasks.createdAt,  // Required for updates
        updatedAt: tasks.updatedAt,
        deletedAt: tasks.deletedAt,
        dueDate: tasks.dueDate,
        description: tasks.description,
        projectId: tasks.projectId,
        columnId: tasks.columnId,
        priority: tasks.priority,
        order: tasks.order,
        completedAt: tasks.completedAt,
      }))
  ) ?? { data: [], isLoading: false }

  // Debug
  React.useEffect(() => {
    console.log('[TASKS] Query update - Total:', tasks.length, 'Loading:', isLoading)
    if (tasks.length > 0) {
      console.log('[TASKS] First task:', tasks[0])
      console.log('[TASKS] Last task:', tasks[tasks.length - 1])
    }
  }, [tasks, isLoading])

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
