import { WorkoutType } from "@/types/workoutType"
import { fetchAllWorkouts } from "@/utils/api/workoutsApi"
import { FlashList } from "@shopify/flash-list"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import Text from "@/components/Text"
import View from "@/components/View"
import { ActivityIndicator, Pressable } from "react-native"

export default function WorkoutScreen() {
  const router = useRouter()
  const {
    data: workoutLogs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["AllWorkoutsLogs"],
    queryFn: fetchAllWorkouts,
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">
          Failed to load workouts. Please try again.
        </Text>
      </View>
    )
  }

  const logs = workoutLogs?.workouts || []
  if (logs.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No workouts found.</Text>
      </View>
    )
  }

  type workOutTypeWithlogId = WorkoutType & { logId: string }

  const renderWorkoutItem = ({ item }: { item: workOutTypeWithlogId }) => (
    <Pressable
      className="p-4 border-b border-gray-200"
      onPress={() => router.push(`/workouts/${item.logId}`)}
    >
      <Text className="text-lg font-semibold">{item.workoutName}</Text>
    </Pressable>
  )

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Workout Logs</Text>
      <FlashList
        data={logs}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.logId}
        estimatedItemSize={50}
      />
    </View>
  )
}
