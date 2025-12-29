import React, { useMemo } from "react"
import { View, Text, Pressable, Alert } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { useRouter } from "expo-router"
import { FlashList } from "@shopify/flash-list"
import { format } from "date-fns"

interface WorkoutLogsListProps {
  ListHeaderComponent?: React.ReactElement | null
  logs?: any[]
}

export const WorkoutLogsList = ({ ListHeaderComponent, logs }: WorkoutLogsListProps) => {
  const colors = useThemeColors()
  const router = useRouter()
  const storeLogs = useWorkoutsStore(s => s.workoutLogs)
  const deleteWorkoutLog = useWorkoutsStore(s => s.deleteWorkoutLog)
  const rawLogs = logs || storeLogs

  const sortedLogs = useMemo(() => {
    const uniqueLogs = Array.from(new Map(rawLogs.map((item: any) => [item.id, item])).values())
    return uniqueLogs
      .filter((l: any) => !l.deletedAt)
      .sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }, [rawLogs])

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

  return (
    <FlashList
      data={sortedLogs}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 150 }}
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
