import React, { useMemo, useCallback } from "react"
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { useWeightStore } from "@/src/stores/useWeightStore"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { format } from "date-fns"
import { PremiumCard } from "../../ui/PremiumCard"

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
    <View className="flex-row items-center mb-3">
      <View className="flex-1">
        <PremiumCard
          onPress={() => router.push(`/weights/${item.id}`)}
          gradientColors={['rgba(255,255,255,0.03)', 'transparent']}
          containerStyle="p-4 border-white/5"
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-white font-black text-2xl tracking-tighter">
              {item.weight} <Text className="text-base text-white/30 uppercase tracking-widest">kg</Text>
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
    if (!isLoading) return null
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }, [isLoading, colors.primary])

  if (sortedLogs.length === 0 && !ListHeaderComponent) {
    return (
      <View className="flex-1 items-center justify-center py-10 px-4">
        <PremiumCard 
          containerStyle="border-white/5 items-center justify-center p-8 w-full border-dashed"
          gradientColors={['rgba(255,255,255,0.02)', 'transparent']}
        >
          <View className="w-10 h-10 rounded-full items-center justify-center bg-white/5 mb-4">
            <Ionicons name="scale-outline" size={28} color="rgba(255,255,255,0.4)" />
          </View>
          <Text className="text-white text-lg font-black tracking-tight mb-2 uppercase">No Logs Yet</Text>
          <Text className="text-white/40 text-xs font-bold text-center leading-5 uppercase tracking-wide">
            Add your first weight reading to start tracking your journey.
          </Text>
        </PremiumCard>
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