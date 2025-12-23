import { View, Text } from "react-native"
import React, { useMemo } from "react"
import { useLiveQuery, eq } from "@tanstack/react-db"
import { useCollections } from "@/src/db/collections"
import WeightLogItem from "./WeightLogItem"
import { safeParseDate } from "@/src/lib/utils/dateUtils"
import { FlashList } from "@shopify/flash-list"
import { WeightChart } from "./WeightChart"
import { useThemeColors } from "@/src/constants/Colors"
import { WeightStatsRow } from "./WeightStatsRow"

export const WeightLogsList = () => {
  const colors = useThemeColors()

  const collections = useCollections()
  if (!collections) return null

  const { data: allLogs = [] } = useLiveQuery((q: any) =>
    q.from({ logs: collections.weightLogs })
      .select(({ logs }: any) => ({
        id: logs.id,
        weight: logs.weight,
        mood: logs.mood,
        energy: logs.energy,
        notes: logs.notes,
        createdAt: logs.created_at,
        updatedAt: logs.updated_at,
        deletedAt: logs.deleted_at,
        userId: logs.user_id,
      }))
  ) ?? { data: [] }

  React.useEffect(() => {
    console.log('[WEIGHTS] Raw collection size:', collections.weightLogs.count?.() || 'N/A')
    console.log('[WEIGHTS] Query result:', allLogs.length, 'logs found')
    if (allLogs.length > 0) {
      console.log('[WEIGHTS] First log sample:', allLogs[0])
    }
  }, [allLogs])

  const sortedLogs = useMemo(() => {
    if (!allLogs || !Array.isArray(allLogs)) return []
    return (allLogs as any[]).sort((a, b) => {
      const dateA = safeParseDate(a.createdAt).getTime()
      const dateB = safeParseDate(b.createdAt).getTime()
      return dateB - dateA
    })
  }, [allLogs])

  const latestWeight = sortedLogs[0]?.weight || null
  const previousWeight = sortedLogs[1]?.weight || null
  const weightChange = latestWeight && previousWeight
    ? (parseFloat(latestWeight) - parseFloat(previousWeight)).toFixed(1)
    : ""

  const ListHeader = (
    <View className="mb-2 px-2">
      <View className="">
        <WeightStatsRow
          currentWeight={latestWeight ? parseFloat(latestWeight) : null}
          weightChange={weightChange}
          bmi={null}
          goalWeight={null}
        />
      </View>

      <View className="mt-6">
        <Text className="text-lg font-semibold text-text mb-3">Progress Chart</Text>
        <View className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden pb-4">
          <WeightChart />
        </View>
      </View>

      <Text className="text-lg font-semibold text-text mt-6 px-4 mb-2">History</Text>
    </View>
  )

  return (
    <View className="flex-1 bg-background">
      <FlashList
        ListHeaderComponent={ListHeader}
        data={sortedLogs}
        renderItem={({ item }) => <WeightLogItem item={item} path="/weights" />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-placeholder font-medium">No weight logs yet.</Text>
          </View>
        }
      />
    </View>
  )
}
