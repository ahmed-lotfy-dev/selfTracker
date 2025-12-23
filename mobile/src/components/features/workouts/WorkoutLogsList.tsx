import { View, Text } from "react-native"
import React, { useMemo } from "react"
import { useLiveQuery, eq } from "@tanstack/react-db"
import { useCollections } from "@/src/db/collections"
import WorkoutLogItem from "./WorkoutLogItem"
import { FlashList } from "@shopify/flash-list"
import { WorkoutChart } from "./WorkoutChart"
import { useThemeColors } from "@/src/constants/Colors"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"

interface WorkoutLogsListProps {
  headerElement?: React.ReactNode
}

export const WorkoutLogsList = ({ headerElement }: WorkoutLogsListProps) => {
  const colors = useThemeColors()

  const collections = useCollections()
  if (!collections) return null

  const { data: allLogs = [] } = useLiveQuery((q: any) =>
    q.from({ logs: collections.workoutLogs })
      .select(({ logs }: any) => ({
        id: logs.id,
        workoutId: logs.workout_id,
        workoutName: logs.workout_name,
        notes: logs.notes,
        createdAt: logs.created_at,
        updatedAt: logs.updated_at,
        deletedAt: logs.deleted_at,
        userId: logs.user_id,
      }))
  ) ?? { data: [] }

  React.useEffect(() => {
    console.log('[WORKOUTS] Raw collection size:', collections.workoutLogs.count?.() || 'N/A')
    console.log('[WORKOUTS] Query result:', allLogs.length, 'logs found')
    if (allLogs.length > 0) {
      console.log('[WORKOUTS] First log sample:', allLogs[0])
    }
  }, [allLogs])

  const sortedLogs = useMemo(() => {
    if (!allLogs || !Array.isArray(allLogs)) return []
    return (allLogs as any[]).sort((a, b) => {
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
        renderItem={({ item }) => <WorkoutLogItem item={item} path="/workouts" />}
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
