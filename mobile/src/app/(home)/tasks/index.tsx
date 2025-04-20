import ListItems from "@/src/components/ListItems"
import TaskListItem from "@/src/components/TaskListItem"
import { fetchAllTasks } from "@/src/utils/api/tasksApi"
import { useQuery } from "@tanstack/react-query"
import { TaskType } from "@/src/types/taskType"
import { ActivityIndicator, Text, View } from "react-native"
import TaskForm from "@/src/components/TaskForm"
import { COLORS } from "@/src/constants/Colors"

export default function index() {
  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchAllTasks(),
  })

  if (isLoading) return <ActivityIndicator color={COLORS.primary} />

  if (isError) {
    return (
      <View className="p-4">
        <Text className="text-red-500">
          Error loading tasks. Please try again later.
        </Text>
      </View>
    )
  }

  if (tasks.length === 0) return <Text>No tasks found</Text>

  const handleTaskSubmit = (taskData: {
    title: string
    description?: string
  }) => {
    console.log("Submitting task:", taskData)
    // Call API or update state here
  }

  return (
    <View className="flex-1 justify-center items-center">
      <TaskForm onSubmit={handleTaskSubmit} />
      <ListItems
        items={tasks ?? []}
        renderItem={({ item }: { item: TaskType }) => (
          <TaskListItem task={item} onPress={() => console.log("Pressed")} />
        )}
      />
    </View>
  )
}
