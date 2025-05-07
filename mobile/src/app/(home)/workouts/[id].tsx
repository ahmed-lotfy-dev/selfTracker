import { View, Text } from "react-native"
import {
  deleteWorkout,
  fetchSingleWorkout,
  fetchSingleWorkoutByDate,
} from "@/src/utils/api/workoutsApi"
import { useQuery } from "@tanstack/react-query"
import {
  Route,
  Stack,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router"
import DateDisplay from "@/src/components/DateDisplay"
import DeleteButton from "@/src/components/Buttons/DeleteButton"
import { useDelete } from "@/src/hooks/useDelete"
import EditButton from "@/src/components/Buttons/EditButton"
import { useWorkoutActions } from "@/src/store/useWokoutStore"
import React from "react"

export default function WorkoutLog() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { setSelectedWorkout } = useWorkoutActions()

  const {
    data: workoutLog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["WorkoutsLog", id],
    queryFn: () => fetchSingleWorkout(String(id)),
    enabled: !!id,
  })

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const { deleteMutation, triggerDelete } = useDelete({
    mutationFn: () => deleteWorkout(String(id)),
    confirmTitle: "Delete Workout",
    confirmMessage: "Are you sure you want to delete this workout?",
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar"] },
    ],
    onSuccessCallback: () => {
      router.push("/workouts")
    },
  })

  if (isLoading) return <Text>Loading...</Text>
  if (isError) return <Text>Error loading workout</Text>

  const log = workoutLog ?? {}
  return (
    <>
      <Stack.Screen
        options={{
          title: `${log.workoutName} - Workout Log`,
        }}
      />
      <View className="p-5">
        <Text className="text-xl font-bold mb-2">Workout Log</Text>
        <Text className="text-lg">Workout Name: {log.workoutName}</Text>
        <Text className="text-lg">
          Date: <DateDisplay date={log.createdAt} isCalendar />
        </Text>
        <Text className="text-lg">
          Notes: {log.notes || "No notes available"}
        </Text>
        <View className="flex-row justify-start gap-3 w-32 mt-3">
          <EditButton
            onPress={() => {
              setSelectedWorkout(workoutLog)
              router.push(`/workouts/edit`)
            }}
          />
          <DeleteButton onPress={triggerDelete} />
          {deleteMutation.isError && (
            <Text className="text-red-500 mt-2">
              {deleteMutation.error?.message || "Could not delete workout."}
            </Text>
          )}
        </View>
      </View>
    </>
  )
}
