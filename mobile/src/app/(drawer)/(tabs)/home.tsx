import { View, Text, ScrollView } from "react-native"
import React from "react"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import { TasksChart } from "@/src/components/features/home/TasksChart"
import UserProfile from "@/src/components/features/profile/UserProfile"
import ActionButtons from "@/src/components/features/home/ActionButtons"
import { StatsRow } from "@/src/components/features/home/StatsRow"
import Header from "@/src/components/Header"

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background px-2">
      <Header
        title="SelfTracker"
        rightAction={<DrawerToggleButton />}
      />
      <ScrollView
        className="flex-1 px-2"
        contentContainerStyle={{ paddingBottom: 150 }}
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
          <StatsRow />
        </View>

        <View className="mt-4">
          <TasksChart />
        </View>
      </ScrollView>
    </View>
  )
}
