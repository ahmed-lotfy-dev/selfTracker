import { View, Text, Pressable } from "react-native"
import { Stack, useLocalSearchParams, useRouter, Route } from "expo-router"
import React, { useMemo } from "react"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { useThemeColors } from "@/src/constants/Colors"
import BackButton from "@/src/components/Buttons/BackButton"
import { format } from "date-fns"
import { MaterialIcons } from "@expo/vector-icons"
import { safeParseDate } from "@/src/lib/utils/dateUtils"
import { useWeightLogStore } from "@/src/features/weight/useWeightStore"
import { useLiveQuery, eq } from "@tanstack/react-db"
import { weightLogCollection } from "@/src/db/collections"
import { useAlertStore } from "@/src/features/ui/useAlertStore"

export default function WeightLog() {
  const router = useRouter()
  const { id } = useLocalSearchParams() as { id: string }
  const { setSelectedWeight } = useWeightLogStore()
  const colors = useThemeColors()
  const { showAlert } = useAlertStore()

  const { data: allLogsData } = useLiveQuery((q) =>
    q.from({ logs: weightLogCollection })
      .where(({ logs }) => eq(logs.deletedAt, null))
      .select(({ logs }) => logs)
  ) as { data: any[] }

  const allLogs = useMemo(() => allLogsData || [], [allLogsData])
  const weightLog = allLogs.find((log: any) => log.id === id)

  const handleDelete = () => {
    showAlert(
      "Delete Weight",
      "Are you sure you want to delete this weight log?",
      async () => {
        await weightLogCollection.delete(id)
        router.back()
      },
      () => { },
      "Delete",
      "Cancel"
    )
  }

  if (!weightLog) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-error font-medium">Weight log not found.</Text>
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

        <View className="flex-row items-center gap-4 mt-10">
          <Pressable
            className="flex-1 bg-primary/10 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-primary/20"
            onPress={() => {
              setSelectedWeight(weightLog as any)
              router.push(`/weights/edit` as Route)
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
