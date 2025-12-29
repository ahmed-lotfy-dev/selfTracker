import React, { useMemo } from "react"
import { View, Text, FlatList, Pressable } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"

import { useWeightStore } from "@/src/stores/useWeightStore"
import { useRouter } from "expo-router"

export const WeightLogsList = () => {
  const colors = useThemeColors()
  const router = useRouter()
  const weightLogs = useWeightStore(s => s.weightLogs)

  const sortedLogs = useMemo(() =>
    [...weightLogs].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [weightLogs]
  )

  if (sortedLogs.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>
          No weight logs yet
        </Text>
        <Text className="text-placeholder text-center px-8">
          Weight tracking will be available once sync is enabled.
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={sortedLogs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/weights/${item.id}`)}
          className="p-4 bg-card rounded-xl mb-2 border border-border"
        >
          <Text className="text-text font-bold text-lg">{item.weight} kg</Text>
          {item.notes && <Text className="text-sm text-placeholder mt-1" numberOfLines={1}>{item.notes}</Text>}
          <Text className="text-xs text-placeholder mt-1">{new Date(item.createdAt).toLocaleDateString()}</Text>
        </Pressable>
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  )
}

