import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native"
import { useQuery } from "@tanstack/react-query"
import { fetchUserHomeInfo } from "@/src/lib/api/userApi"
import { WeightProgressCard } from "@/src/components/Home/WeightProgressCard"
import { COLORS } from "@/src/constants/Colors"
import { TasksProgressCard } from "@/src/components/Home/TasksProgressCard"
import { WorkoutProgressCard } from "@/src/components/Home/WorkoutProgressCard"
import UserProfile from "@/src/components/Profile/UserProfile"
import ActionButtons from "@/src/components/Home/ActionButtons" // Import ActionButtons
import React from "react"

export default function HomeScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["userHomeData"],
    queryFn: fetchUserHomeInfo,
    staleTime: 1000 * 60 * 5,
  })

  if (data) {
  console.log({
    weeklyWorkout: data.weeklyWorkout,
    monthlyWorkout: data.monthlyWorkout,
    weightChange: data.weightChange,
    weightDelta: data.weightDelta,
    bmi: data.userBMI,
    pendingTasks: data.pendingTasks,
    completedTasks: data.completedTasks,
    allTasks: data.allTasks,
    goalData: data.goal,
  })
}

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
      className="flex-1 bg-gray-100 px-4 py-4"
    >
      <UserProfile homeScreen className="mt-4" />
      <ActionButtons />

      <View className="gap-3">
        <WorkoutProgressCard
          weeklyWorkoutCount={data?.weeklyWorkout}
          monthlyWorkoutCount={data?.monthlyWorkout}
        />

        <WeightProgressCard
          weightChange={data?.weightChange}
          goalWeight={data?.goal?.goalWeight}
          delta={data?.weightDelta}
          bmi={data?.userBMI}
        />

        <TasksProgressCard
          pendingTasks={data?.pendingTasks}
          completedTasks={data?.completedTasks}
          allTasks={data?.allTasks}
        />
      </View>
    </ScrollView>
  )
}
