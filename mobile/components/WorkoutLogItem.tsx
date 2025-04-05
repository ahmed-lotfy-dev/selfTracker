import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native"
import { Route, useRouter, Link } from "expo-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import DateDisplay from "./DateDisplay"
import { deleteWorkout } from "@/utils/api/workoutsApi"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import Table from "./Table"
import { formatLocalDate, showAlert } from "@/utils/lib"
import { useDelete } from "@/hooks/useDelete"
import DeleteButton from "./DeleteButton"
import {  } from "expo-router"

type WorkoutLogProps = {
  item: {
    logId: string | number
    workoutName: string
    createdAt: string
  }
  path: string
}

export default function WorkoutLogItem({ item, path }: WorkoutLogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const localDate = formatLocalDate(item.createdAt)
  const year = new Date(item.createdAt).getFullYear()
  const month = new Date(item.createdAt).getMonth() + 1

  const { deleteMutation, triggerDelete } = useDelete({
    mutationFn: () => deleteWorkout(String(item.logId)),
    confirmTitle: "Delete Workout",
    confirmMessage: "Are you sure you want to delete this workout?",
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar", year, month] },
    ],
  })
  
  return (
    <View
      className="flex-row justify-between items-center p-4 border-b border-gray-200"
      key={item.logId}
    >
      <Link href={`/workouts/${item.logId}`} asChild>
        <TouchableOpacity className="flex-1">
          <Text className="text-xl font-bold mb-3">{item.workoutName}</Text>
          <Text className="text-sm text-gray-500">
            <DateDisplay date={item.createdAt} />
          </Text>
        </TouchableOpacity>
      </Link>

      <View>
        <DeleteButton
          onDelete={triggerDelete}
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
