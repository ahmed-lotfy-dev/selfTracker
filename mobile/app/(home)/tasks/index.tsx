import ListItems from "@/components/ListItems"
import TaskListItem from "@/components/TaskListItem"
import { fetchAllTasks } from "@/utils/api/tasksApi"
import { useQuery } from "@tanstack/react-query"
import { TaskType } from "@/types/taskType"
import { ActivityIndicator, Text, View } from "react-native"
import TaskForm from "@/components/TaskForm"

export default function index() {
  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchAllTasks(),
  })

  console.log({ tasks })

  if (isLoading) return <ActivityIndicator />

  if (isError) return <Text>Error loading tasks</Text>
  if (tasks.length === 0) return <Text>No tasks found</Text>

  return (
    <View className="flex-1 justify-center items-center">
      <TaskForm onSubmit={function (taskData: { title: string; description?: string }): void {
        throw new Error("Function not implemented.")
      } } />
      <ListItems
        items={tasks ?? []}
        renderItem={({ item }: { item: TaskType }) => (
          <TaskListItem task={item} onPress={() => console.log("Pressed")} />
        )}
      />
    </View>
  )
}
