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
import Card from "@/src/components/Home/Card"

export default function HomeScreen() {
  const {
    data: userData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userHomeData"],
    queryFn: fetchUserHomeInfo,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" className="text-blue-500" />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-lg mb-2">Failed to load data</Text>
        <Text
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          onPress={() => refetch()}
        >
          Retry
        </Text>
      </View>
    )
  }

  const {
    weeklyWorkoutCount,
    monthlyWorkoutCount,
    weeklyComplletedTaskCount,
    weeklyPendingTaskCount,
    goalWeight,
    userLatestWeight,
  } = userData?.collectedUserHomeData || {}

  const weightDelta = userData?.collectedUserHomeData?.weightDelta || 0

  const isProgressGood = weightDelta <= 0 // Negative delta is good (losing weight)

  return (
    <ScrollView
      refreshControl={
        <RefreshControl onRefresh={refetch} refreshing={isRefetching} />
      }
      className="flex-1 p-4"
    >
      <Text className="text-2xl font-bold mb-6">Dashboard</Text>

      {/* Activity Card */}
      <Card
        title={"Activity"}
        route={"/workouts"}
      />
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-lg font-semibold mb-3">Activity</Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <MaterialIcons
              name="fitness-center"
              size={24}
              className="text-blue-500"
            />
            <Text className="text-2xl font-bold mt-1">
              {weeklyWorkoutCount}
            </Text>
            <Text className="text-gray-500">Weekly Workouts</Text>
          </View>
          <View className="items-center">
            <MaterialIcons
              name="fitness-center"
              size={24}
              className="text-blue-500"
            />
            <Text className="text-2xl font-bold mt-1">
              {monthlyWorkoutCount}
            </Text>
            <Text className="text-gray-500">Monthly Workouts</Text>
          </View>
          <View className="items-center">
            <MaterialIcons
              name="check-circle"
              size={24}
              className="text-blue-500"
            />
            <Text className="text-2xl font-bold mt-1">
              {`${weeklyPendingTaskCount}/${weeklyComplletedTaskCount}`}
            </Text>
            <Text className="text-gray-500">Tasks</Text>
          </View>
        </View>
      </View>

      {/* Weight Card */}
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold mb-3">Weight Progress</Text>
        <View className="flex-row justify-between mb-3">
          <View className="items-center">
            <MaterialIcons
              name="monitor-weight"
              size={24}
              className="text-blue-500"
            />
            <Text className="text-2xl font-bold mt-1">
              {userLatestWeight} kg
            </Text>
            <Text className="text-gray-500">Current</Text>
          </View>
          <View className="items-center">
            <MaterialIcons name="flag" size={24} className="text-blue-500" />
            <Text className="text-2xl font-bold mt-1">{goalWeight} kg</Text>
            <Text className="text-gray-500">Goal</Text>
          </View>
        </View>
        <View className="flex-row items-center justify-center mt-2">
          <MaterialIcons
            name={isProgressGood ? "trending-down" : "trending-up"}
            size={24}
            className={isProgressGood ? "text-green-500" : "text-red-500"}
          />
          <Text
            className={`ml-2 font-semibold ${
              isProgressGood ? "text-green-500" : "text-red-500"
            }`}
          >
            {(weightDelta || 0) > 0 ? "+" : ""}
            {Math.abs(weightDelta || 0).toFixed(1)} kg
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
