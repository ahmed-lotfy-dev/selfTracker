import { Text, TouchableOpacity, View } from "react-native"
import { useRouter, Link } from "expo-router"
import DateDisplay from "../DateDisplay"
import { deleteWorkout } from "@/src/utils/api/workoutsApi"
import { useDelete } from "@/src/hooks/useDelete"
import DeleteButton from "../Buttons/DeleteButton"
import EditButton from "../Buttons/EditButton"
import { WorkoutLogType } from "@/src/types/workoutLogType"
import { useWorkoutActions } from "@/src/store/useWokoutStore"

type WorkoutLogProps = {
  item: WorkoutLogType
  path: string
}

export default function WorkoutLogItem({ item, path }: WorkoutLogProps) {
  const router = useRouter()
  const { setSelectedWorkout } = useWorkoutActions()

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
    <View className="flex-row justify-between items-center p-4 border shadow-md border-[#64748b] rounded-lg mb-3 mt-5">
      <View className="flex-row">
        <Link href={`/workouts/${item.id}`} asChild>
          <TouchableOpacity className="flex-1">
            <Text className="text-xl font-bold mb-3">{item.workoutName}</Text>
            <Text className="text-sm text-gray-500">
              <DateDisplay date={item.createdAt} />
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="flex-row gap-5">
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
