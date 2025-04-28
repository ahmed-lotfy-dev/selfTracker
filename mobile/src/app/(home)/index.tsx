import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native"
import { useQuery } from "@tanstack/react-query"
import { fetchUserHomeInfo } from "@/src/utils/api/userApi"
import { MaterialIcons } from "@expo/vector-icons"
import { MetricsCard } from "@/src/components/Home/MetricCard"
import { WeightProgressCard } from "@/src/components/Home/WeightProgressCard"
import { COLORS } from "@/src/constants/Colors"
import { TasksProgressCard } from "@/src/components/Home/TasksProgressCard"
import { WorkoutProgressCard } from "@/src/components/Home/WorkoutProgressCard"
import Header from "@/src/components/Header"
import UserProfile from "@/src/components/Profile/UserProfile"

export default function HomeScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["userHomeData"],
    queryFn: fetchUserHomeInfo,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

  console.log(data)

  if (isLoading) {
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
          Error loading user data. Please try again later.
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          onRefresh={refetch}
          refreshing={isRefetching}
          tintColor="#3b82f6"
        />
      }
      className="flex-1 px-4 bg-gray-200"
    >
      <UserProfile homeScreen className="mt-4" />

      <View className="flex-1 gap-4">
        <WorkoutProgressCard
          weeklyWorkoutCount={data.weeklyWorkoutCount}
          monthlyWorkoutCount={data.monthlyWorkoutCount}
        />

        <WeightProgressCard
          currentWeight={data.userLatestWeight}
          goalWeight={data.goalWeight}
          delta={data.weightDelta}
        />

        <TasksProgressCard
          weeklyPendingTaskCount={data.weeklyPendingTaskCount}
          weeklyCompletedTaskCount={data.weeklyCompletedTaskCount}
        />
      </View>
    </ScrollView>
  )
}
