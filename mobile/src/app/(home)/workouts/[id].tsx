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
import { COLORS } from "@/src/constants/Colors"
import { MaterialIcons } from "@expo/vector-icons"

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
        <View className="flex-1 justify-center items-center bg-gray-50">
            <ActivitySpinner size="large" color={COLORS.primary} />
        </View>
    )
  }

  if (isError || !workoutLog) {
      return (
        <View className="flex-1 justify-center items-center bg-gray-50">
            <Text className="text-red-500 font-medium">Error loading workout details.</Text>
            <BackButton backTo="/workouts" className="mt-4" />
        </View>
      )
  }

  const formattedDate = workoutLog.createdAt 
    ? format(new Date(workoutLog.createdAt), "EEEE, MMMM dd, yyyy") 
    : ""

  return (
    <View className="flex-1 bg-gray-50">
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
        <Text className="text-4xl font-extrabold text-gray-900 leading-tight">
            {workoutLog.workoutName}
        </Text>
        <Text className="text-base text-gray-500 font-medium mt-2 mb-8 uppercase tracking-wide">
            {formattedDate}
        </Text>

        {/* Notes Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <Text className="text-xs font-bold text-gray-400 tracking-widest mb-4">
                NOTES
            </Text>
            <Text className="text-lg text-gray-800 leading-relaxed">
                {workoutLog.notes || "No notes added for this workout."}
            </Text>
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-4 mt-10">
            {/* Edit Button */}
            <Pressable 
                className="flex-1 bg-indigo-50 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-indigo-100"
                onPress={() => {
                    setSelectedWorkout(workoutLog)
                    router.push(`/workouts/edit`)
                }}
            >
                <MaterialIcons name="edit" size={20} color={COLORS.primary} />
                <Text className="text-indigo-700 font-bold text-base">Edit</Text>
            </Pressable>

            {/* Delete Button */}
            <Pressable 
                className="flex-1 bg-red-50 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-red-100"
                onPress={triggerDelete}
                disabled={deleteMutation.isPending}
            >
                {deleteMutation.isPending ? (
                    <ActivitySpinner size="small" color={COLORS.error} />
                ) : (
                    <>
                        <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
                        <Text className="text-red-700 font-bold text-base">Delete</Text>
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


