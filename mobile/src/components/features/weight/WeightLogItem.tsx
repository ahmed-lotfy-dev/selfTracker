import { Text, Pressable, View } from "react-native"
import { Link, Route, useRouter } from "expo-router"
import { deleteWeight } from "@/src/lib/api/weightsApi"
import { useDelete } from "@/src/hooks/useDelete"
import { useWeightLogStore } from "@/src/store/useWeightStore"
import { MaterialIcons } from "@expo/vector-icons"
import { COLORS, useThemeColors } from "@/src/constants/Colors"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { WeightLogType } from "@/src/types/weightLogType"
import React from "react"
import { format } from "date-fns"

import { safeParseDate } from "@/src/lib/utils/dateUtils"

type WeightLogProps = {
  item: WeightLogType
  path: string
}

export default function WeightLogItem({ item, path }: WeightLogProps) {
  const router = useRouter()
  const { setSelectedWeight } = useWeightLogStore()
  const themeColors = useThemeColors()
  const { deleteMutation, triggerDelete } = useDelete({
    mutationFn: () => deleteWeight(String(item?.id)),
    confirmTitle: "Delete Weight",
    confirmMessage: "Are you sure you want to delete this weight log?",
    onSuccessInvalidate: [
      { queryKey: ["weightLogs"] },
      { queryKey: ["weightLogsCalendar"] },
      { queryKey: ["userHomeData"] },
    ],
  })

  // Format date parts safely
  const dateObj = safeParseDate(item.createdAt)
  const day = format(dateObj, "dd")
  const month = format(dateObj, "MMM")

  return (
    <View className="flex-row items-center my-2 px-4">
      {/* Date Column */}
      <View className="items-center w-12 mr-2">
        <Text className="text-xl font-bold text-text">{day}</Text>
        <Text className="text-xs font-semibold text-placeholder uppercase">{month}</Text>
      </View>

      {/* Content Card */}
      <Link href={`/weights/${item.id}`} asChild>
        <Pressable
          className="flex-1 bg-card p-4 rounded-2xl shadow-sm border border-border flex-row items-center justify-between"
          style={{ elevation: 1 }} // Android shadow
        >
          <View className="flex-1 mr-3">
            <View className="flex-row items-end gap-1">
              <Text className="text-2xl font-bold text-text">{item.weight}</Text>
              <Text className="text-sm font-medium text-placeholder mb-1">kg</Text>
            </View>
            <Text
              className="text-xs text-placeholder mt-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.notes || (item.mood ? `Mood: ${item.mood}` : "No details")}
            </Text>
          </View>

          <View className="flex-row gap-2 items-center">
            {/* Edit Button */}
            <Pressable
              className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 justify-center items-center active:bg-indigo-100"
              onPress={(e: any) => {
                e.stopPropagation()
                setSelectedWeight(item)
                router.push(`${path}/edit` as Route)
              }}
            >
              <MaterialIcons name="edit" size={18} color="#6366f1" />
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

