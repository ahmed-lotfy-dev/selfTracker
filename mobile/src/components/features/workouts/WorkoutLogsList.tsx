import React, { useMemo, useCallback } from "react"
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { useRouter } from "expo-router"
import { FlashList } from "@shopify/flash-list"
import { format } from "date-fns"
import { PremiumCard } from "../../ui/PremiumCard"

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
    <View className="flex-row items-center mb-3">
      <View className="flex-1">
        <PremiumCard
          onPress={() => router.push(`/home/workouts/${item.id}`)}
          gradientColors={['rgba(255,255,255,0.03)', 'transparent']}
          containerStyle="p-4 border-white/5"
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-white font-black text-xl tracking-tighter" numberOfLines={1} style={{ flexShrink: 1, marginRight: 8 }}>
              {item.workoutName}
            </Text>
            <View className="bg-white/5 px-2 py-1 rounded-full border border-white/5">
              <Text className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                {format(new Date(item.createdAt), "dd MMM")}
              </Text>
            </View>
          </View>
          {item.notes && (
            <Text className="text-[12px] font-bold text-white/40 mt-3 tracking-tight uppercase" numberOfLines={1}>
              {item.notes}
            </Text>
          )}
        </PremiumCard>
      </View>
      <Pressable
        onPress={() => handleDelete(item.id)}
        className="ml-3 self-stretch min-w-[50px] bg-red-500/10 rounded-2xl items-center justify-center border border-red-500/20"
      >
        <Ionicons name="trash" size={20} color="#ef4444" />
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
          <View className="items-center justify-center py-10 px-4">
            <PremiumCard 
              containerStyle="border-white/5 items-center justify-center p-8 w-full border-dashed"
              gradientColors={['rgba(255,255,255,0.02)', 'transparent']}
            >
              <View className="w-10 h-10 rounded-full items-center justify-center bg-white/5 mb-4">
                <FontAwesome5 name="dumbbell" size={24} color="rgba(255,255,255,0.4)" />
              </View>
              <Text className="text-white text-lg font-black tracking-tight mb-2 uppercase">No Workouts Yet</Text>
              <Text className="text-white/40 text-xs font-bold text-center leading-5 uppercase tracking-wide">
                Your workout history will automatically appear here.
              </Text>
            </PremiumCard>
          </View>
        ) : null
      }
    />
  )
}
