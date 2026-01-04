import React, { useMemo, useCallback } from "react"
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { useRouter } from "expo-router"
import { FlashList } from "@shopify/flash-list"
import { format } from "date-fns"

interface WorkoutLogsListProps {
  ListHeaderComponent?: React.ReactElement | null
  logs?: any[]
  disablePagination?: boolean
}

export const WorkoutLogsList = ({ ListHeaderComponent, logs, disablePagination }: WorkoutLogsListProps) => {
  const colors = useThemeColors()
  const router = useRouter()
  const storeLogs = useWorkoutsStore(s => s.workoutLogs)
  const deleteWorkoutLog = useWorkoutsStore(s => s.deleteWorkoutLog)
  const fetchWorkoutLogs = useWorkoutsStore(s => s.fetchWorkoutLogs)
  const nextCursor = useWorkoutsStore(s => s.nextCursor)
  const isLoading = useWorkoutsStore(s => s.isLoading)
  const hasMore = useWorkoutsStore(s => s.hasMore)
  const rawLogs = logs || storeLogs

  const sortedLogs = useMemo(() => {
    const uniqueLogs = Array.from(new Map(rawLogs.map((item: any) => [item.id, item])).values())
    return uniqueLogs
      .filter((l: any) => !l.deletedAt)
      .sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }, [rawLogs])

  const handleLoadMore = useCallback(() => {
    if (disablePagination || logs) return
    if (!isLoading && hasMore && nextCursor) {
      fetchWorkoutLogs(nextCursor)
    }
  }, [isLoading, hasMore, nextCursor, fetchWorkoutLogs, disablePagination, logs])

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Workout Log",
      "Are you sure you want to delete this workout log?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteWorkoutLog(id) }
      ]
    )
  }

  const renderItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center mb-2 px-3">
      <Pressable
        onPress={() => router.push(`/workouts/${item.id}`)}
        className="flex-1 p-4 bg-card rounded-xl border border-border shadow-sm"
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-text font-medium text-base">{item.workoutName}</Text>
          <Text className="text-xs text-placeholder">
            {format(new Date(item.createdAt), "dd/MM/yyyy")}
          </Text>
        </View>
        {item.notes && (
          <Text className="text-sm text-placeholder mt-1" numberOfLines={1}>
            {item.notes}
          </Text>
        )}
      </Pressable>
      <Pressable
        onPress={() => handleDelete(item.id)}
        className="ml-2 p-3 bg-red-500/10 rounded-xl"
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </Pressable>
    </View>
  )

  const renderFooter = useCallback(() => {
    if (disablePagination || logs) return null
    if (!isLoading) return null
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }, [isLoading, colors.primary, disablePagination, logs])

  return (
    <FlashList
      data={sortedLogs}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 150 }}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        !ListHeaderComponent ? (
          <View className="items-center justify-center py-16 border-2 border-dashed rounded-3xl mx-3 opacity-50" style={{ borderColor: colors.border }}>
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-black/5 dark:bg-white/5">
              <FontAwesome5 name="dumbbell" size={24} color={colors.text} style={{ opacity: 0.5 }} />
            </View>
            <Text className="text-lg font-bold mb-1 text-text">No workouts yet</Text>
            <Text className="text-sm text-center px-8 text-placeholder">
              Your workout history will appear here.
            </Text>
          </View>
        ) : null
      }
    />
  )
}
