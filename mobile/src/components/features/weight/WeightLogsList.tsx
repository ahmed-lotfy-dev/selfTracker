import { View, Text, RefreshControl } from "react-native"
import React from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { fetchAllWeightLogs } from "@/src/lib/api/weightsApi"
import { fetchUserHomeInfo } from "@/src/lib/api/userApi"
import WeightLogItem from "./WeightLogItem"
import { FlashList } from "@shopify/flash-list"
import { WeightChart } from "./WeightChart"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { useThemeColors } from "@/src/constants/Colors"
import { WeightStatsRow } from "./WeightStatsRow"

export const WeightLogsList = () => {
  const limit = 10
  const colors = useThemeColors()

  const { data: homeData } = useQuery({
    queryKey: ["userHomeData"],
    queryFn: fetchUserHomeInfo,
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
    isError,
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

  const ListHeader = (
    <View className="mb-4 px-2">
      <View className="">
        <Text className="text-lg font-semibold text-text mb-2">Overview</Text>
        <WeightStatsRow
          currentWeight={homeData?.latestWeight || null}
          weightChange={homeData?.weightChange || ""}
          bmi={homeData?.userBMI || null}
          goalWeight={homeData?.goal?.goalWeight || null}
        />
      </View>

      <View className="mt-6">
        <Text className="text-lg font-semibold text-text mb-3">Progress Chart</Text>
        <View className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden pb-4">
          <WeightChart />
        </View>
      </View>

      <Text className="text-lg font-semibold text-text mt-6 px-4 mb-2">History</Text>
    </View>
  )

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
          Error loading data. Please try again later.
        </Text>
      </View>
    )
  }
  return (
    <View className="flex-1 bg-background">
      <FlashList
        ListHeaderComponent={ListHeader}
        data={logs}
        renderItem={({ item }) => <WeightLogItem item={item} path="/weights" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.text}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
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
            <ActivitySpinner size="small" className="mx-4 my-4" />
          ) : null
        }
      />
    </View>
  )
}

