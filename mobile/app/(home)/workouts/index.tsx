import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAllWorkoutLogs } from "@/utils/api/workoutsApi"
import LogList from "@/components/LogList"
import WorkoutLogItem from "@/components/WorkoutLogItem"
import Header from "@/components/Header"
import ScreenContainer from "@/components/ScreenContainer"
import { ActivityIndicator, Text } from "react-native"

export default function WorkoutScreen() {
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
    queryKey: ["workoutLogs"],
    queryFn: ({ pageParam }) => fetchAllWorkoutLogs(pageParam, limit),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const logs = data?.pages.flatMap((page) => page.workoutLogs) || []

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
          Failed to load workouts. Please try again.
        </Text>
        <Text className="text-red-500">{error.message}</Text>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <Header title="Workout Logs" addPath="/workouts/add" />
      <LogList
        logs={logs}
        renderItem={({ item }) => (
          <WorkoutLogItem item={item} path="/workouts" />
        )}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </ScreenContainer>
  )
}
