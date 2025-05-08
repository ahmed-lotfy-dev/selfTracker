import { View, Text, RefreshControl, ActivityIndicator } from "react-native"
import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWeightLogs } from "@/src/lib/api/weightsApi"
import WeightLogItem from "./WeightLogItem"
import { FlashList } from "@shopify/flash-list"
import { WeightChart } from "./WeightChart"

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
  })

  const logs = data?.pages.flatMap((page) => page.logs || []) ?? []

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
