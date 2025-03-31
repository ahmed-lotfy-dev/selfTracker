import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWeightLogs } from "@/utils/api/weightsApi"
import LogList from "@/components/LogList"
import WeightLogItem from "@/components/WeightLogItem"
import Header from "@/components/Header"
import ScreenContainer from "@/components/ScreenContainer"
import { ActivityIndicator, Text } from "react-native"

export default function WeightsScreen() {
  const limit = 10

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["weightLogs"],
    queryFn: ({ pageParam }) => fetchAllWeightLogs(pageParam, limit),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const logs = data?.pages.flatMap((page) => page.weightLogs) || []

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator
          size="large"
          className="flex-1 justify-center items-center"
        />
      </ScreenContainer>
    )
  }

  if (isError) {
    return (
      <ScreenContainer>
        <Text className="text-red-500">
          Failed to load weights. Please try again.
        </Text>
        <Text className="text-red-500">{error.message}</Text>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <Header title="Weight Logs" addPath="/weights/add" />
      <LogList
        logs={logs}
        renderItem={({ item }) => <WeightLogItem item={item} path="/weights" />}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </ScreenContainer>
  )
}
