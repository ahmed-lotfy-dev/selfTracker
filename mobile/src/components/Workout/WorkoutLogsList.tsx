import { View, Text, RefreshControl,  } from "react-native"
import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWeightLogs } from "@/src/lib/api/weightsApi"
import WorkoutLogItem from "./WorkoutLogItem"
import { FlashList } from "@shopify/flash-list"
import { COLORS } from "@/src/constants/Colors"
import { fetchAllWorkoutLogs } from "@/src/lib/api/workoutsApi"
import { WorkoutChart } from "./WorkoutChart"
import ActivitySpinner from "@/src/components/ActivitySpinner"

export const WorkoutLogsList = () => {
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
    queryKey: ["workoutLogs"],
    queryFn: ({ pageParam }) => fetchAllWorkoutLogs(pageParam, limit),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const logs = data?.pages.flatMap((page) => page.logs || []) ?? []

  if (isLoading || !data) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivitySpinner size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="p-4">
        <Text className="text-red-500">
          Failed to load workouts. Please try again.
        </Text>
        <Text className="text-red-500">{error.message}</Text>
      </View>
    )
  }


  return (
    <View className="flex-1">
      <FlashList
        data={logs}
        renderItem={({ item }) => (
          <WorkoutLogItem item={item} path="/weights" />
        )}
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
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<WorkoutChart />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivitySpinner size="small" className="mx-4"  />
          ) : null
        }
      />
    </View>
  )
}
