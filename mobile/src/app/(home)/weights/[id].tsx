import { View, Text, Pressable } from "react-native"
import { deleteWeight, fetchSingleWeightLog } from "@/src/lib/api/weightsApi"
import { useQuery } from "@tanstack/react-query"
import { Route, Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useDelete } from "@/src/hooks/useDelete"
import { useWorkoutActions } from "@/src/store/useWokoutStore"
import React from "react"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { COLORS } from "@/src/constants/Colors"
import BackButton from "@/src/components/Buttons/BackButton"
import { format } from "date-fns"
import { MaterialIcons } from "@expo/vector-icons"

export default function WeightLog() {
  const router = useRouter()
  const { id } = useLocalSearchParams() as { id: string }
  const { setSelectedWorkout } = useWorkoutActions()

  const {
    data: weightLog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["WeightLog", id],
    queryFn: () =>
      id ? fetchSingleWeightLog(id) : Promise.reject("Invalid ID"),
    enabled: !!id,
  })

  const { deleteMutation, triggerDelete } = useDelete({
    mutationFn: () => deleteWeight(String(weightLog?.id)),
    confirmTitle: "Delete Weight",
    confirmMessage: "Are you sure you want to delete this weight log?",
    onSuccessInvalidate: [
        { queryKey: ["weightLogs"] },
        { queryKey: ["userHomeData"] }
    ],
    onSuccessCallback: () => {
        router.back()
    }
  })

  if (isLoading) {
    return (
        <View className="flex-1 justify-center items-center bg-gray-50">
            <ActivitySpinner size="large" color={COLORS.primary} />
        </View>
    )
  }

  if (isError || !weightLog) {
      return (
        <View className="flex-1 justify-center items-center bg-gray-50">
            <Text className="text-red-500 font-medium">Error loading weight details.</Text>
            <BackButton backTo="/weights" className="mt-4" />
        </View>
      )
  }

  const formattedDate = weightLog.createdAt 
    ? format(new Date(weightLog.createdAt), "MMMM dd, yyyy") 
    : ""

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="pt-12 px-4 pb-4">
        <BackButton backTo="/weights" />
      </View>

      <View className="flex-1 px-6">
        {/* Hero Section */}
        <View className="items-center py-10">
            <Text className="text-7xl font-black text-gray-900 tracking-tighter">
                {weightLog.weight}
            </Text>
            <Text className="text-xl text-gray-400 font-bold -mt-2 mb-8">
                KG
            </Text>
            
            <View className="bg-indigo-50 px-4 py-2 rounded-full">
                <Text className="text-sm font-bold text-indigo-500 uppercase tracking-widest">
                    {formattedDate}
                </Text>
            </View>
        </View>

        {/* Notes Card */}
        {weightLog.notes && (
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-4">
                <Text className="text-xs font-bold text-gray-400 tracking-widest mb-3">
                    NOTES
                </Text>
                <Text className="text-lg text-gray-800 leading-relaxed">
                    {weightLog.notes}
                </Text>
            </View>
        )}

        {/* Actions */}
        <View className="flex-row items-center gap-4 mt-10">
            {/* Edit Button */}
            <Pressable 
                className="flex-1 bg-indigo-50 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-indigo-100"
                onPress={() => {
                    setSelectedWorkout(weightLog)
                    router.push(`/weights/edit` as Route)
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
            {deleteMutation.error?.message || "Could not delete weight log."}
          </Text>
        )}
      </View>
    </View>
  )
}


