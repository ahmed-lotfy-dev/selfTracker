import { View, Text, Pressable } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import React, { useMemo } from "react"
import BackButton from "@/src/components/Buttons/BackButton"
import { format } from "date-fns"
import { useThemeColors } from "@/src/constants/Colors"
import { MaterialIcons } from "@expo/vector-icons"
import { safeParseDate } from "@/src/lib/utils/dateUtils"
import { useWorkoutActions } from "@/src/features/workouts/useWorkoutStore"
import { useLiveQuery, eq } from "@tanstack/react-db"
import { workoutLogCollection } from "@/src/db/collections"
import { useAlertStore } from "@/src/features/ui/useAlertStore"

export default function WorkoutLog() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { setSelectedWorkout } = useWorkoutActions()
  const colors = useThemeColors()
  const { showAlert } = useAlertStore()

  const { data: allLogsData } = useLiveQuery((q) =>
    q.from({ logs: workoutLogCollection })
      .where(({ logs }) => eq(logs.deletedAt, null))
      .select(({ logs }) => logs)
  ) as { data: any[] }

  const allLogs = useMemo(() => allLogsData || [], [allLogsData])
  const workoutLog = allLogs.find((log: any) => log.id === id)

  const handleDelete = () => {
    showAlert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      async () => {
        await workoutLogCollection.delete(String(id))
        router.back()
      },
      () => { },
      "Delete",
      "Cancel"
    )
  }

  if (!workoutLog) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-error font-medium">Workout log not found.</Text>
        <BackButton backTo="/workouts" className="mt-4" />
      </View>
    )
  }

  const formattedDate = format(safeParseDate(workoutLog.createdAt), "EEEE, MMMM dd, yyyy")

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="pt-12 px-4 pb-4">
        <BackButton backTo="/workouts" />
      </View>

      <View className="px-6 mt-2">
        <Text className="text-4xl font-extrabold text-text leading-tight">
          {workoutLog.workoutName}
        </Text>
        <Text className="text-base text-placeholder font-medium mt-2 mb-8 uppercase tracking-wide">
          {formattedDate}
        </Text>

        <View className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          <Text className="text-xs font-bold text-placeholder tracking-widest mb-4">
            NOTES
          </Text>
          <Text className="text-lg text-text leading-relaxed">
            {workoutLog.notes || "No notes added for this workout."}
          </Text>
        </View>

        <View className="flex-row items-center gap-4 mt-10">
          <Pressable
            className="flex-1 bg-primary/10 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-primary/20"
            onPress={() => {
              setSelectedWorkout(workoutLog as any)
              router.push(`/workouts/edit`)
            }}
          >
            <MaterialIcons name="edit" size={20} color={colors.primary} />
            <Text className="text-primary font-bold text-base">Edit</Text>
          </Pressable>

          <Pressable
            className="flex-1 bg-error/10 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-error/20"
            onPress={handleDelete}
          >
            <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            <Text className="text-error font-bold text-base">Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
