import { View, Text } from "react-native"
import React, { useMemo } from "react"
import { useQuery } from "@livestore/react"
import { queryDb } from "@livestore/livestore"
import { tables } from "@/src/livestore/schema"
import WeightLogItem from "./WeightLogItem"
import { FlashList } from "@shopify/flash-list"
import { WeightChart } from "./WeightChart"
import { useThemeColors } from "@/src/constants/Colors"
import { WeightStatsRow } from "./WeightStatsRow"

const allWeightLogs$ = queryDb(
  () => tables.weightLogs.where({ deletedAt: null }),
  { label: 'allWeightLogs' }
)

export const WeightLogsList = () => {
  const colors = useThemeColors()
  const allLogs = useQuery(allWeightLogs$)

  const sortedLogs = useMemo(() => {
    return [...allLogs].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
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
        renderItem={({ item }) => <WeightLogItem item={item as any} path="/weights" />}
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
