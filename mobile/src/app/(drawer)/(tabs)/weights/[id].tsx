import { View, Text, Pressable } from "react-native"
import { deleteWeight, fetchSingleWeightLog } from "@/src/lib/api/weightsApi"
import { useQuery } from "@tanstack/react-query"
import { Route, Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useDelete } from "@/src/hooks/useDelete"
import { useWorkoutActions } from "@/src/store/useWokoutStore"
import React from "react"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { COLORS, useThemeColors } from "@/src/constants/Colors"
import BackButton from "@/src/components/Buttons/BackButton"
import { format } from "date-fns"
import { MaterialIcons } from "@expo/vector-icons"
import { safeParseDate } from "@/src/lib/utils/dateUtils"

import { useWeightLogStore } from "@/src/store/useWeightStore"

export default function WeightLog() {
  const router = useRouter()
  const { id } = useLocalSearchParams() as { id: string }
  const { setSelectedWeight } = useWeightLogStore()
  const colors = useThemeColors()

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
      <View className="flex-1 justify-center items-center bg-background">
        <ActivitySpinner size="large" color={colors.primary} />
      </View>
    )
  }

  if (isError || !weightLog) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-error font-medium">Error loading weight details.</Text>
        <BackButton backTo="/weights" className="mt-4" />
      </View>
    )
  }

  const formattedDate = format(safeParseDate(weightLog.createdAt), "MMMM dd, yyyy")

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="pt-12 px-4 pb-4">
        <BackButton backTo="/weights" />
      </View>

      <View className="flex-1 px-6">
        {/* Hero Section */}
        <View className="items-center py-10">
          <Text className="text-7xl font-black text-text tracking-tighter">
            {weightLog.weight}
          </Text>
          <Text className="text-xl text-placeholder font-bold -mt-2 mb-8">
            KG
          </Text>

          <View className="bg-primary/10 px-4 py-2 rounded-full">
            <Text className="text-sm font-bold text-primary uppercase tracking-widest">
              {formattedDate}
            </Text>
          </View>
        </View>

        {/* Notes Card */}
        {weightLog.notes && (
          <View className="bg-card rounded-3xl p-6 shadow-sm border border-border mt-4">
            <Text className="text-xs font-bold text-placeholder tracking-widest mb-3">
              NOTES
            </Text>
            <Text className="text-lg text-text leading-relaxed">
              {weightLog.notes}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View className="flex-row items-center gap-4 mt-10">
          {/* Edit Button */}
          <Pressable
            className="flex-1 bg-primary/10 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-primary/20"
            onPress={() => {
              setSelectedWeight(weightLog)
              router.push(`/weights/edit` as Route)
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
          <Text className="text-error mt-4 text-center">
            {deleteMutation.error?.message || "Could not delete weight log."}
          </Text>
        )}
      </View>
    </View>
  )
}


