import { View, Text } from "react-native"
import {
  deleteWorkout,
  fetchSingleWorkout,
  fetchSingleWorkoutByDate,
} from "@/utils/api/workoutsApi"
import { useQuery } from "@tanstack/react-query"
import { Stack, useLocalSearchParams, usePathname } from "expo-router"
import DateDisplay from "@/components/DateDisplay"
import DeleteButton from "@/components/DeleteButton"
import { useDelete } from "@/hooks/useDelete"

export default function WorkoutLog() {
  const { id } = useLocalSearchParams()
  const isDate = !isNaN(Date.parse(String(id)))

  const {
    data: workoutLog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["WorkoutsLog", id],
    queryFn: () =>
      isDate
        ? fetchSingleWorkoutByDate(String(id))
        : fetchSingleWorkout(String(id)),
    enabled: !!id,
  })

  // This must be declared BEFORE any return statement
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const { deleteMutation, triggerDelete } = useDelete({
    mutationFn: () => deleteWorkout(String(workoutLog?.logId)),
    confirmTitle: "Delete Workout",
    confirmMessage: "Are you sure you want to delete this workout?",
    onSuccessInvalidate: [
      { queryKey: ["workouts"] },
      { queryKey: ["workoutsCalendar", currentMonth, currentYear] },
    ],
  })

  if (isLoading) return <Text>Loading...</Text>
  if (isError) return <Text>Error loading workout</Text>

  const log = workoutLog[0] ?? {}

  return (
    <>
      <Stack.Screen
        options={{
          title: `${log.workoutName}`,
        }}
      />
      <View className="p-5">
        <Text className="text-xl font-bold mb-2">Workout Log</Text>
        <Text className="text-lg">Workout Name: {log.workoutName}</Text>
        <Text className="text-lg">
          Date: <DateDisplay date={log.createdAt} />
        </Text>
        <Text className="text-lg">
          Notes: {log.notes || "No notes available"}
        </Text>
        <DeleteButton onDelete={triggerDelete} className="w-10 mt-5" />
        {deleteMutation.isError && (
          <Text className="text-red-500 mt-2">
            {deleteMutation.error?.message || "Could not delete workout."}
          </Text>
        )}
      </View>
    </>
  )
}
