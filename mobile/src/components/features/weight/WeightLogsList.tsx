import React, { useMemo, useCallback } from "react"
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { useWeightStore } from "@/src/stores/useWeightStore"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { format } from "date-fns"

interface Props {
  ListHeaderComponent?: React.ReactElement | null
}

export const WeightLogsList = ({ ListHeaderComponent }: Props) => {
  const colors = useThemeColors()
  const router = useRouter()
  const weightLogs = useWeightStore(s => s.weightLogs)
  const deleteWeightLog = useWeightStore(s => s.deleteWeightLog)
  const fetchWeightLogs = useWeightStore(s => s.fetchWeightLogs)
  const nextCursor = useWeightStore(s => s.nextCursor)
  const isLoading = useWeightStore(s => s.isLoading)
  const hasMore = useWeightStore(s => s.hasMore)

  const sortedLogs = useMemo(() =>
    [...weightLogs]
      .filter(l => !l.deletedAt)
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [weightLogs]
  )

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && nextCursor) {
      fetchWeightLogs(nextCursor)
    }
  }, [isLoading, hasMore, nextCursor, fetchWeightLogs])

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Weight Log",
      "Are you sure you want to delete this weight log?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteWeightLog(id) }
      ]
    )
  }

  const renderItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center mb-2 px-3">
      <Pressable
        onPress={() => router.push(`/weights/${item.id}`)}
        className="flex-1 p-4 bg-card rounded-xl border border-border shadow-sm"
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-text font-bold text-lg">{item.weight} kg</Text>
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
    if (!isLoading) return null
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }, [isLoading, colors.primary])

  if (sortedLogs.length === 0 && !ListHeaderComponent) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>
          No weight logs yet
        </Text>
        <Text className="text-placeholder text-center px-8">
          Keep track of your journey by adding your first weight log.
        </Text>
      </View>
    )
  }

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
    />
  )
}