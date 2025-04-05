import { ActivityIndicator, Text, View } from "react-native"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWeightLogs } from "@/utils/api/weightsApi"
import LogList from "@/components/LogList"
import WeightLogItem from "@/components/WeightLogItem"
import Header from "@/components/Header"
import AddButton from "@/components/AddButton"

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
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator
          size="large"
          className="flex-1 justify-center items-center"
        />
      </View>
    )
  }

  if (isError) {
    return (
      <View>
        <Text className="text-red-500">
          Failed to load weights. Please try again.
        </Text>
        <Text className="text-red-500">{error.message}</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 p-4 justify-center relative">
      <Header title="Weight Logs" />
      <LogList
        logs={logs}
        renderItem={({ item }) => <WeightLogItem item={item} path="/weights" />}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
      <AddButton className="bottom-10 right-5"/>
    </View>
  )
}
