import { View, Text, ScrollView, RefreshControl } from "react-native"
import React from "react"
import { Stack } from "expo-router"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import { useQuery } from "@tanstack/react-query"
import { fetchUserHomeInfo } from "@/src/lib/api/userApi"
import { TasksChart } from "@/src/components/features/home/TasksChart"
import UserProfile from "@/src/components/features/profile/UserProfile"
import ActionButtons from "@/src/components/features/home/ActionButtons"
import { StatsRow } from "@/src/components/features/home/StatsRow"
import Header from "@/src/components/Header"

import { useUser } from "@/src/store/useAuthStore"
import { ActivityIndicator } from "react-native"

export default function HomeScreen() {
  const user = useUser()
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ["userHomeData"],
    queryFn: fetchUserHomeInfo,
    // only fetch when we have a valid initialized user from the store
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  })

  // If we have a session but no user yet, it means DB is initializing
  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-placeholder text-sm">Preparing your workspace...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background px-2">
      <Header
        title="SelfTracker"
        rightAction={<DrawerToggleButton />}
      />
      <ScrollView
        className="flex-1 px-2"
        contentContainerStyle={{ paddingBottom: 150 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <UserProfile homeScreen className="" />

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
    </View>
  )
}
