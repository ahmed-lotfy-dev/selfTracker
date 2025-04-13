import ListItems from "@/components/ListItems"
import TaskListItem from "@/components/TaskListItem"
import { fetchAllTasks } from "@/utils/api/tasksApi"
import { useQuery } from "@tanstack/react-query"
import { TaskType } from "@/types/taskType"
import { ActivityIndicator, Text, View } from "react-native"
import TaskForm from "@/components/TaskForm"
import { COLORS } from "@/constants/Colors"

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
