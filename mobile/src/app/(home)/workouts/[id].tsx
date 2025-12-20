import { View, Text, Pressable } from "react-native"
import {
  deleteWorkout,
  fetchSingleWorkout,
} from "@/src/lib/api/workoutsApi"
import { useQuery } from "@tanstack/react-query"
import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router"
import { useDelete } from "@/src/hooks/useDelete"
import { useWorkoutActions } from "@/src/store/useWokoutStore"
import React from "react"
import BackButton from "@/src/components/Buttons/BackButton"
import { format } from "date-fns"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { COLORS, useThemeColors } from "@/src/constants/Colors"
import { MaterialIcons } from "@expo/vector-icons"
import { safeParseDate } from "@/src/lib/utils/dateUtils"

export default function WorkoutLog() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { setSelectedWorkout } = useWorkoutActions()
  const colors = useThemeColors()

  const {
    data: workoutLog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["WorkoutsLog", id],
    queryFn: () => fetchSingleWorkout(String(id)),
    enabled: !!id,
  })

  const { deleteMutation, triggerDelete } = useDelete({
    mutationFn: () => deleteWorkout(String(id)),
    confirmTitle: "Delete Workout",
    confirmMessage: "Are you sure you want to delete this workout?",
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar"] },
      { queryKey: ["userHomeData"] },
    ],
    onSuccessCallback: () => {
      router.back()
    },
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivitySpinner size="large" color={colors.primary} />
      </View>
    )
  }

  if (isError || !workoutLog) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-error font-medium">Error loading workout details.</Text>
        <BackButton backTo="/workouts" className="mt-4" />
      </View>
    )
  }

  const formattedDate = format(safeParseDate(workoutLog.createdAt), "EEEE, MMMM dd, yyyy")

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Header Area */}
      <View className="pt-12 px-4 pb-4">
        <BackButton backTo="/workouts" />
      </View>

      <View className="px-6 mt-2">
        {/* Title Section */}
        <Text className="text-4xl font-extrabold text-text leading-tight">
          {workoutLog.workoutName}
        </Text>
        <Text className="text-base text-placeholder font-medium mt-2 mb-8 uppercase tracking-wide">
          {formattedDate}
        </Text>

        {/* Notes Card */}
        <View className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          <Text className="text-xs font-bold text-placeholder tracking-widest mb-4">
            NOTES
          </Text>
          <Text className="text-lg text-text leading-relaxed">
            {workoutLog.notes || "No notes added for this workout."}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-4 mt-10">
          {/* Edit Button */}
          <Pressable
            className="flex-1 bg-primary/10 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-primary/20"
            onPress={() => {
              setSelectedWorkout(workoutLog)
              router.push(`/workouts/edit`)
            }}
          >
            <MaterialIcons name="edit" size={20} color={colors.primary} />
            <Text className="text-primary font-bold text-base">Edit</Text>
          </Pressable>

          {/* Delete Button */}
          <Pressable
            className="flex-1 bg-error/10 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-error/20"
            onPress={triggerDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <ActivitySpinner size="small" color={colors.error} />
            ) : (
              <>
                <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                <Text className="text-error font-bold text-base">Delete</Text>
              </>
            )}
          </Pressable>
        </View>

        {deleteMutation.isError && (
          <Text className="text-red-500 mt-4 text-center">
            {deleteMutation.error?.message || "Could not delete workout."}
          </Text>
        )}
      </View>
    </View>
  )
}


