import { View, Text, RefreshControl } from "react-native"
import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWeightLogs } from "@/src/lib/api/weightsApi"
import WeightLogItem from "./WeightLogItem"
import { FlashList } from "@shopify/flash-list"
import { WeightChart } from "./WeightChart"
import ActivitySpinner from "../ActivitySpinner"
import { useThemeColors } from "@/src/constants/Colors"

export const WeightLogsList = () => {
  const limit = 10
  const colors = useThemeColors()

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
        <ActivitySpinner size="large" color={colors.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className={`text-[${colors.error}] text-center`}>
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
            tintColor={colors.text}
          />
        }
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivitySpinner size="small" className="mx-4"  />
          ) : null
        }
      />
    </View>
  )
}
