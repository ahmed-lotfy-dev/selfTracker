import { Text, Pressable, View } from "react-native"
import { useRouter, Link } from "expo-router"
import { deleteWorkout } from "@/src/lib/api/workoutsApi"
import { useDelete } from "@/src/hooks/useDelete"
import { WorkoutLogType } from "@/src/types/workoutLogType"
import { useWorkoutActions } from "@/src/store/useWokoutStore"
import React from "react"
import { format } from "date-fns"
import { MaterialIcons } from "@expo/vector-icons"
import { COLORS, useThemeColors } from "@/src/constants/Colors"
import ActivitySpinner from "@/src/components/ActivitySpinner"

import { safeParseDate } from "@/src/lib/utils/dateUtils"

type WorkoutLogProps = {
  item: WorkoutLogType
  path: string
}

export default function WorkoutLogItem({ item, path }: WorkoutLogProps) {
  const router = useRouter()
  const { setSelectedWorkout } = useWorkoutActions()
  const themeColors = useThemeColors()

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

  // Format date parts safely
  const dateObj = safeParseDate(item.createdAt)
  const day = format(dateObj, "dd")
  const month = format(dateObj, "MMM")

  return (
    <View className="flex-row items-center my-2 px-2">
      {/* Date Column */}
      <View className="items-center w-12 mr-2">
        <Text className="text-xl font-bold text-text">{day}</Text>
        <Text className="text-xs font-semibold text-placeholder uppercase">{month}</Text>
      </View>

      {/* Content Card */}
      <Link href={`/workouts/${item.id}`} asChild>
        <Pressable
          className="flex-1 bg-card p-3 rounded-2xl shadow-sm border border-border flex-row items-center justify-between"
          style={{ elevation: 1 }}
        >
          <View className="flex-1 mr-3">
            <Text
              className="text-lg font-bold text-text"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.workoutName}
            </Text>
            {item.notes ? (
              <Text
                className="text-xs text-placeholder mt-1"
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
              className="w-10 h-10 rounded-full bg-primary/10 justify-center items-center active:bg-primary/20"
              onPress={(e: any) => {
                e.stopPropagation()
                setSelectedWorkout(item)
                router.push(`/workouts/edit`)
              }}
            >
              <MaterialIcons name="edit" size={18} color={themeColors.primary} />
            </Pressable>

            {/* Delete Button */}
            <Pressable
              className="w-10 h-10 rounded-full bg-error/10 justify-center items-center active:bg-error/20"
              onPress={(e: any) => {
                e.stopPropagation()
                triggerDelete()
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <ActivitySpinner size="small" color={themeColors.error} />
              ) : (
                <MaterialIcons name="delete-outline" size={20} color={themeColors.error} />
              )}
            </Pressable>
          </View>
        </Pressable>
      </Link>
    </View>
  )
}
