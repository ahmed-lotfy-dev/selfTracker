import React, { useMemo } from "react"
import { Text, View } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import TaskForm from "@/src/components/features/tasks/TaskForm"
import TaskListItem from "@/src/components/features/tasks/TaskListItem"
import { useTasksStore, useActiveTasks, Task } from "@/src/stores/useTasksStore"
import TaskProgress from "@/src/components/features/tasks/TaskProgress"

export default function TaskScreen() {
  const tasks = useActiveTasks()
  const toggleComplete = useTasksStore((s) => s.toggleComplete)

  const sortedTasks = useMemo(() => {
    // Defensive deduplication
    const uniqueTasks = Array.from(new Map(tasks.map(t => [t.id, t])).values())

    return [...uniqueTasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return Number(a.completed) - Number(b.completed)
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [tasks])

  const ListHeader = (
    <Animated.View entering={FadeIn.duration(600).springify()}>
      <Header
        title="Tasks"
        rightAction={<DrawerToggleButton />}
      />
      <TaskProgress tasks={tasks} />
      <TaskForm />
      <Text className="text-lg font-bold text-text mx-2 my-3">Your List</Text>
    </Animated.View>
  )

  return (
    <View className="flex-1 bg-background px-2">
      <Animated.FlatList
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
          <TaskListItem
            task={item}
            index={index}
            onToggle={() => toggleComplete(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
