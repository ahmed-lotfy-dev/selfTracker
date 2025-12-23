import React, { useMemo } from "react"
import { FlatList, Text, View } from "react-native"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import TaskForm from "@/src/components/features/tasks/TaskForm"
import TaskListItem from "@/src/components/features/tasks/TaskListItem"
import { useLiveQuery, eq } from "@tanstack/react-db"
import { taskCollection } from "@/src/db/collections"
import TaskProgress from "@/src/components/features/tasks/TaskProgress"


export default function TaskScreen() {
  const { data: tasksData } = useLiveQuery((q) =>
    q.from({ tasks: taskCollection })
      .where(({ tasks }) => eq(tasks.deletedAt, null))
      .select(({ tasks }) => tasks)
  ) as { data: any[] }

  const tasks = useMemo(() => tasksData || [], [tasksData])

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      return Number(a.completed) - Number(b.completed)
    })
  }, [tasks])

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
        keyExtractor={(item) => item?.id.toString()}
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
