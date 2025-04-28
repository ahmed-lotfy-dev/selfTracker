import { useQuery } from "@tanstack/react-query"
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native"
import Header from "@/src/components/Header"
import TaskForm from "@/src/components/Task/TaskForm"
import TaskListItem from "@/src/components/Task/TaskListItem"
import AddButton from "@/src/components/Buttons/AddButton"
import { COLORS } from "@/src/constants/Colors"
import { fetchAllTasks } from "@/src/utils/api/tasksApi"
import { TaskType } from "@/src/types/taskType"

export default function TaskScreen() {
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

  if (isLoading) {
    return (
      <ActivityIndicator
        className="flex-1"
        size="large"
        color={COLORS.primary}
      />
    )
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-red-500 text-center">
          Error loading tasks. Please try again later.
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 justify-start items-center px-10">
      <Header title="Tasks" />
      <TaskForm />

      {tasks && tasks.length === 0 ? (
        <View className="mt-4 items-center">
          <Text className="text-gray-700 font-medium">
            No tasks available, add one!
          </Text>
        </View>
      ) : (
        <View className="flex-1 ">
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
            renderItem={({ item }: { item: TaskType }) => (
              <TaskListItem task={item} />
            )}
          />
        </View>
      )}
    </View>
  )
}
