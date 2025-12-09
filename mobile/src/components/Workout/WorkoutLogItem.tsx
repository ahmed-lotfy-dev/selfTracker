import { Text, Pressable, View } from "react-native"
import { useRouter, Link } from "expo-router"
import { deleteWorkout } from "@/src/lib/api/workoutsApi"
import { useDelete } from "@/src/hooks/useDelete"
import { WorkoutLogType } from "@/src/types/workoutLogType"
import { useWorkoutActions } from "@/src/store/useWokoutStore"
import React from "react"
import { format } from "date-fns"
import { MaterialIcons } from "@expo/vector-icons"
import { COLORS } from "@/src/constants/Colors"
import ActivitySpinner from "@/src/components/ActivitySpinner"

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
      { queryKey: ["userHomeData"] },
    ],
  })

  // Format date parts
  const dateObj = new Date(item.createdAt || new Date())
  const day = format(dateObj, "dd")
  const month = format(dateObj, "MMM")

  return (
    <View className="flex-row items-center my-2 px-2">
      {/* Date Column */}
      <View className="items-center w-12 mr-2">
        <Text className="text-xl font-bold text-gray-800">{day}</Text>
        <Text className="text-xs font-semibold text-gray-400 uppercase">{month}</Text>
      </View>

      {/* Content Card */}
      <Link href={`/workouts/${item.id}`} asChild>
        <Pressable 
          className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex-row items-center justify-between"
          style={{ elevation: 1 }}
        >
          <View className="flex-1 mr-3">
            <Text 
                className="text-lg font-bold text-gray-900" 
                numberOfLines={1} 
                ellipsizeMode="tail"
            >
                {item.workoutName}
            </Text>
            {item.notes ? (
                <Text 
                    className="text-xs text-gray-400 mt-1" 
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                {item.notes}
                </Text>
            ) : null}
          </View>

          <View className="flex-row gap-2 items-center">
             {/* Edit Button */}
            <Pressable
              className="w-10 h-10 rounded-full bg-indigo-50 justify-center items-center active:bg-indigo-100"
              onPress={(e: any) => {
                e.stopPropagation()
                setSelectedWorkout(item)
                router.push(`/workouts/edit`)
              }}
            >
               <MaterialIcons name="edit" size={18} color={COLORS.primary || "#6366f1"} />
            </Pressable>

            {/* Delete Button */}
            <Pressable
              className="w-10 h-10 rounded-full bg-red-50 justify-center items-center active:bg-red-100"
              onPress={(e: any) => {
                 e.stopPropagation()
                 triggerDelete()
              }}
              disabled={deleteMutation.isPending}
            >
                {deleteMutation.isPending ? (
                    <ActivitySpinner size="small" color={COLORS.error || "#ef4444"} />
                ) : (
                    <MaterialIcons name="delete-outline" size={20} color={COLORS.error || "#ef4444"} />
                )}
            </Pressable>
          </View>
        </Pressable>
      </Link>
    </View>
  )
}

