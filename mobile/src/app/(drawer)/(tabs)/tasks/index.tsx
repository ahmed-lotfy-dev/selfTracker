import React, { useMemo } from "react"
import { FlatList, Text, View } from "react-native"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import TaskForm from "@/src/components/features/tasks/TaskForm"
import TaskListItem from "@/src/components/features/tasks/TaskListItem"
import { useQuery } from "@livestore/react"
import { queryDb } from "@livestore/livestore"
import { tables } from "@/src/livestore/schema"
import TaskProgress from "@/src/components/features/tasks/TaskProgress"

const allTasks$ = queryDb(
  () => tables.tasks.where({ deletedAt: null }),
  { label: 'allTasks' }
)

export default function TaskScreen() {
  const tasks = useQuery(allTasks$)

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
