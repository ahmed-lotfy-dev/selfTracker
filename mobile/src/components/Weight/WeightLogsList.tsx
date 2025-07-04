import { View, Text, RefreshControl, ActivityIndicator } from "react-native"
import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWeightLogs } from "@/src/lib/api/weightsApi"
import WeightLogItem from "./WeightLogItem"
import { FlashList } from "@shopify/flash-list"
import { WeightChart } from "./WeightChart"
import { COLORS } from "@/src/constants/Colors"

export const WeightLogsList = () => {
  const limit = 10

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["weightLogs"],
    queryFn: ({ pageParam }) => fetchAllWeightLogs(pageParam, limit),
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const logs = data?.pages.flatMap((page) => page.logs || []) ?? []

  if (isLoading || !data) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">
          Error loading chart data. Please try again later.
        </Text>
      </View>
    )
  }
  return (
    <View className="flex-1">
      <FlashList
        ListHeaderComponent={<WeightChart />}
        data={logs}
        renderItem={({ item }) => <WeightLogItem item={item} path="/weights" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#000"
          />
        }
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
        estimatedItemSize={117}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" style={{ marginVertical: 16 }} />
          ) : null
        }
      />
    </View>
  )
}
