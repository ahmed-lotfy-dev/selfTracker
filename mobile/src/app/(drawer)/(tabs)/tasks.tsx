import React, { useMemo } from "react"
import { FlatList, Text, View, ActivityIndicator } from "react-native"
import Animated, { LinearTransition, FadeIn } from "react-native-reanimated"
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
      .orderBy(({ tasks }: any) => tasks.created_at, 'desc')
      .select(({ tasks }: any) => ({
        id: tasks.id,
        userId: tasks.user_id,
        title: tasks.title,
        completed: tasks.completed,
        category: tasks.category,
        createdAt: tasks.created_at,
        updatedAt: tasks.updated_at,
        deletedAt: tasks.deleted_at,
        dueDate: tasks.due_date,
        description: tasks.description,
        projectId: tasks.project_id,
        columnId: tasks.column_id,
        priority: tasks.priority,
        order: tasks.order,
        completedAt: tasks.completed_at,
      }))
  ) ?? { data: [], isLoading: false }

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
    <Animated.View entering={FadeIn.duration(600).springify()}>
      <Header
        title="Tasks"
        rightAction={<DrawerToggleButton />}
      />
      <TaskProgress tasks={tasks as any} />
      <TaskForm />
      <Text className="text-lg font-bold text-text mx-2 my-3">Your List</Text>
    </Animated.View>
  )

  return (
    <View className="flex-1 bg-background px-2">
      <Animated.FlatList
        itemLayoutAnimation={LinearTransition.springify().damping(15)}
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
        renderItem={({ item, index }) => (
          <View className="px-2">
            <TaskListItem task={item as any} index={index} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
