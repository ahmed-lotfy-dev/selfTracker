import { View, Text, ScrollView, RefreshControl } from "react-native"
import React from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchUserHomeInfo } from "@/src/lib/api/userApi"
import { TasksChart } from "@/src/components/features/home/TasksChart"
import UserProfile from "@/src/components/features/profile/UserProfile"
import ActionButtons from "@/src/components/features/home/ActionButtons"
import { StatsRow } from "@/src/components/features/home/StatsRow"

export default function HomeScreen() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ["userHomeData"],
    queryFn: fetchUserHomeInfo,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <ScrollView
      className="flex-1 bg-background px-4 pt-5"
      contentContainerStyle={{ paddingBottom: 150 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <UserProfile homeScreen className="m" />

      <View className="items-start mt-3">
        <View className="">
          <Text className="text-2xl font-bold text-primary">
            Design your life,
          </Text>
          <Text className="text-xl font-bold text-placeholder">
            one habit at a time.
          </Text>
        </View>
      </View>

      <View className="mt-4">
        <Text className="text-lg font-semibold text-text">
          Quick Actions
        </Text>
      </View>
      <ActionButtons />

      <View className="mt-4">
        <Text className="text-lg font-semibold text-text">
          Insights
        </Text>
        <StatsRow
          weeklyWorkouts={data?.weeklyWorkout || 0}
          monthlyWorkouts={data?.monthlyWorkout || 0}
          weightChange={data?.weightChange || ""}
          bmi={null}
          goalWeight={null}
        />
      </View>

      <View className="mt-4">
        <TasksChart
          pendingTasks={data?.pendingTasks || 0}
          completedTasks={data?.completedTasks || 0}
        />
      </View>
    </ScrollView>
  )
}
