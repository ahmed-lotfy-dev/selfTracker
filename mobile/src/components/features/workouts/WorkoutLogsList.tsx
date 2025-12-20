import { View, Text, RefreshControl, } from "react-native"
import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import WorkoutLogItem from "./WorkoutLogItem"
import { FlashList } from "@shopify/flash-list"
import { COLORS } from "@/src/constants/Colors"
import { fetchAllWorkoutLogs } from "@/src/lib/api/workoutsApi"
import { WorkoutChart } from "./WorkoutChart"
import ActivitySpinner from "@/src/components/ActivitySpinner"

interface WorkoutLogsListProps {
  headerElement?: React.ReactNode
}

export const WorkoutLogsList = ({ headerElement }: WorkoutLogsListProps) => {
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

  const ListHeader = (
    <View className="mb-4">
      {headerElement}
      <View className="px-2 mt-2">
        <Text className="text-lg font-semibold text-text mb-3">Progress Chart</Text>
        <View className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden pb-4">
          <WorkoutChart />
        </View>
      </View>

      <Text className="text-lg font-semibold text-text mt-6 px-4 mb-2">History</Text>
    </View>
  )


  if (isLoading || !data) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivitySpinner size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="p-2 bg-background flex-1">
        <Text className="text-error">
          Failed to load workouts. Please try again.
        </Text>
        <Text className="text-error">{error?.message}</Text>
      </View>
    )
  }


  return (
    <View className="flex-1 bg-background">
      <FlashList
        ListHeaderComponent={ListHeader}
        data={logs}
        renderItem={({ item }) => (
          <WorkoutLogItem item={item} path="/weights" />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
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
