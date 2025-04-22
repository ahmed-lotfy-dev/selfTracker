import ListItems from "@/src/components/ListItems"
import TaskListItem from "@/src/components/TaskListItem"
import { fetchAllTasks } from "@/src/utils/api/tasksApi"
import { useQuery } from "@tanstack/react-query"
import { TaskType } from "@/src/types/taskType"
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native"
import TaskForm from "@/src/components/TaskForm"
import { COLORS } from "@/src/constants/Colors"
import AddButton from "@/src/components/AddButton"
import Header from "@/src/components/Header"

export default function index() {
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

  if (isLoading)
    return (
      <ActivityIndicator
        className="flex-1"
        size={"large"}
        color={COLORS.primary}
      />
    )

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500">
          Error loading tasks. Please try again later.
        </Text>
      </View>
    )
  }

  if (tasks.length === 0)
    return (
      <View className="flex-1 justify-start items-center">
        <Header title="Tasks" />
        <Text className="text-lg font-bold">No tasks available</Text>
      </View>
    )

  const handleTaskSubmit = (taskData: {
    title: string
    description?: string
  }) => {
    console.log("Submitting task:", taskData)
    // Call API or update state here
  }

  return (
    <View className="flex-1 justify-center items-center relative">
      <Header title="Tasks" />

      <TaskForm onSubmit={handleTaskSubmit} />
      <FlatList
        data={tasks}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        renderItem={({ item }: { item: TaskType }) => (
          <TaskListItem task={item} onPress={() => console.log("Pressed")} />
        )}
      />
      <AddButton path="/tasks" />
    </View>
  )
}
