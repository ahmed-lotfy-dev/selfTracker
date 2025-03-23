import { fetchSingleWorkout } from "@/utils/api/workoutsApi"
import { useQuery } from "@tanstack/react-query"
import { usePathname } from "expo-router"
import Text from "@/components/Text"
import View from "@/components/View"

export default function WorkoutLog() {
  const id = usePathname().split("/").pop()
  console.log(id)

  const {
    data: workoutLog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["WorkoutsLog", id],
    queryFn: () => (id ? fetchSingleWorkout(id) : Promise.reject("Invalid ID")),
    enabled: !!id,
  })

  console.log(workoutLog)
  if (isLoading) return <Text>Loading...</Text>
  if (isError) return <Text>Error loading workout</Text>

  const log = workoutLog?.singleWorkout?.[0] ?? {}

  return (
    <View className="p-5">
      <Text className="text-xl font-bold mb-2">Workout Log</Text>
      <Text className="text-lg">Workout Name: {log.workoutName}</Text>
      <Text className="text-lg">Date: {log.date}</Text>
      <Text className="text-lg">Notes: {log.notes || "No notes available"}</Text>
    </View>
  )
}
