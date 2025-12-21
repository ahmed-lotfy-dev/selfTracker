import { View, Text } from "react-native"
import React, { useMemo } from "react"
import { useQuery } from "@livestore/react"
import { queryDb } from "@livestore/livestore"
import { tables } from "@/src/livestore/schema"
import WorkoutLogItem from "./WorkoutLogItem"
import { FlashList } from "@shopify/flash-list"
import { WorkoutChart } from "./WorkoutChart"
import { useThemeColors } from "@/src/constants/Colors"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"

const allWorkoutLogs$ = queryDb(
  () => tables.workoutLogs.where({ deletedAt: null }),
  { label: 'allWorkoutLogs' }
)

interface WorkoutLogsListProps {
  headerElement?: React.ReactNode
}

export const WorkoutLogsList = ({ headerElement }: WorkoutLogsListProps) => {
  const colors = useThemeColors()
  const allLogs = useQuery(allWorkoutLogs$)

  const sortedLogs = useMemo(() => {
    return [...allLogs].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
  }, [allLogs])

  const weeklyCount = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return sortedLogs.filter(log => log.createdAt && new Date(log.createdAt) > weekAgo).length
  }, [sortedLogs])

  const monthlyCount = useMemo(() => {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return sortedLogs.filter(log => log.createdAt && new Date(log.createdAt) > monthAgo).length
  }, [sortedLogs])

  const ListHeader = (
    <View className="mb-2">
      {headerElement}
      <View className="flex-row justify-around bg-card rounded-2xl mx-2 p-4 border border-border">
        <View className="items-center">
          <Text className="text-2xl font-bold text-primary">{weeklyCount}</Text>
          <Text className="text-sm text-placeholder">This Week</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-secondary">{monthlyCount}</Text>
          <Text className="text-sm text-placeholder">This Month</Text>
        </View>
      </View>

      <View className="mt-6 px-2">
        <Text className="text-lg font-semibold text-text mb-3">Workout Types</Text>
        <View className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden pb-4">
          <WorkoutChart />
        </View>
      </View>

      <Text className="text-lg font-semibold text-text mt-6 px-4 mb-2">Recent Workouts</Text>
    </View>
  )

  return (
    <View className="flex-1 bg-background">
      <FlashList
        ListHeaderComponent={ListHeader}
        data={sortedLogs}
        renderItem={({ item }) => <WorkoutLogItem item={item as any} path="/workouts" />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-placeholder font-medium">No workout logs yet.</Text>
          </View>
        }
      />
    </View>
  )
}
