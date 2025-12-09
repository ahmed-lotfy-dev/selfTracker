import { View, Text, ScrollView, RefreshControl } from "react-native"
import React from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchUserHomeInfo } from "@/src/lib/api/userApi"
import { TasksChart } from "@/src/components/Home/TasksChart"
import UserProfile from "@/src/components/Profile/UserProfile"
import ActionButtons from "@/src/components/Home/ActionButtons"
import { StatsRow } from "@/src/components/Home/StatsRow"

export default function HomeScreen() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ["userHomeData"],
    queryFn: fetchUserHomeInfo,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <ScrollView 
      className="flex-1 bg-white px-4 pt-5"
      contentContainerStyle={{ paddingBottom: 150 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <UserProfile homeScreen className="m" />

      <View className="items-start mt-3">
        <View className="">
          <Text className="text-2xl font-bold text-gray-900">
            Design your life,
          </Text>
          <Text className="text-xl font-bold text-gray-400">
            one habit at a time.
          </Text>
        </View>
      </View>
      
      <View className="mt-4">
        <Text className="text-lg font-semibold text-gray-800">
          Quick Actions
        </Text>
      </View>
      <ActionButtons />

      <View className="mt-4">
        <Text className="text-lg font-semibold text-gray-800">
          Insights
        </Text>
        <StatsRow
            weeklyWorkouts={data?.weeklyWorkout || 0}
            monthlyWorkouts={data?.monthlyWorkout || 0}
            weightChange={data?.weightChange || ""}
            bmi={data?.userBMI || null}
            goalWeight={data?.goal?.goalWeight || null}
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
