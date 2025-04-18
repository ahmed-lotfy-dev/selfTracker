import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
} from "react-native"
import { Route, useRouter, Link } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import DateDisplay from "../DateDisplay"
import { deleteWorkout } from "@/utils/api/workoutsApi"
import { useDelete } from "@/hooks/useDelete"
import DeleteButton from "../DeleteButton"
import EditButton from "../EditButton"
import { WorkoutType } from "@/types/workoutType"
import { useWorkoutActions } from "@/store/useWokoutStore"

type WorkoutLogProps = {
  item: WorkoutType
  path: string
}

export default function WorkoutLogItem({ item, path }: WorkoutLogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setSelectedWorkout } = useWorkoutActions()
  const year = new Date(item.createdAt).getFullYear()
  const month = new Date(item.createdAt).getMonth() + 1

  const { deleteMutation, triggerDelete } = useDelete({
    mutationFn: () => deleteWorkout(String(item.id)),
    confirmTitle: "Delete Workout",
    confirmMessage: "Are you sure you want to delete this workout?",
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar"] },
    ],
  })

  return (
    <View className="flex-1 flex-row items-center p-4 border shadow-md border-[#64748b] rounded-lg mb-3">
      <View className="flex-1 flex-row">
        <Link href={`/workouts/${item.id}`} asChild>
          <TouchableOpacity className="flex-1">
            <Text className="text-xl font-bold mb-3">{item.workoutName}</Text>
            <Text className="text-sm text-gray-500">
              <DateDisplay date={item.createdAt} />
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="flex-1 flex-row gap-5">
        <EditButton
          onPress={() => {
            setSelectedWorkout(item)
            router.push(`/workouts/edit`)
          }}
        />
        <DeleteButton
          onPress={triggerDelete}
          isLoading={deleteMutation.isPending}
        />
        {deleteMutation.isError && (
          <Text className="text-red-500 mt-2">
            {deleteMutation.error?.message || "Could not delete workout."}
          </Text>
        )}
      </View>
    </View>
  )
}
