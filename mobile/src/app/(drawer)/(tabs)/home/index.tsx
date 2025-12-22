import { View, Text, ScrollView } from "react-native"
import React, { useMemo } from "react"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import { TasksChart } from "@/src/components/features/home/TasksChart"
import UserProfile from "@/src/components/features/profile/UserProfile"
import ActionButtons from "@/src/components/features/home/ActionButtons"
import { StatsRow } from "@/src/components/features/home/StatsRow"
import Header from "@/src/components/Header"
import { useUser } from "@/src/store/useAuthStore"
import { ActivityIndicator } from "react-native"
import { useQuery } from "@livestore/react"
import { queryDb } from "@livestore/livestore"
import { tables } from "@/src/livestore/schema"

const allWorkoutLogs$ = queryDb(
  () => tables.workoutLogs,
  { label: 'homeWorkoutLogs' }
)

const allWeightLogs$ = queryDb(
  () => tables.weightLogs,
  { label: 'homeWeightLogs' }
)

const allTasks$ = queryDb(
  () => tables.tasks,
  { label: 'homeTasks' }
)

export default function HomeScreen() {
  const user = useUser()
  const workoutLogs = useQuery(allWorkoutLogs$)
  const weightLogs = useQuery(allWeightLogs$)
  const tasks = useQuery(allTasks$)

  React.useEffect(() => {
    console.log(`[HomeScreen] Data Status - Workouts: ${workoutLogs.length}, Weights: ${weightLogs.length}, Tasks: ${tasks.length}`)
  }, [workoutLogs.length, weightLogs.length, tasks.length])

  const stats = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const weeklyWorkouts = workoutLogs.filter(
      log => log.createdAt && new Date(log.createdAt) > weekAgo
    ).length

    const monthlyWorkouts = workoutLogs.filter(
      log => log.createdAt && new Date(log.createdAt) > monthAgo
    ).length

    const sortedWeights = [...weightLogs]
      .filter(w => w.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())

    const latestWeight = sortedWeights[0]?.weight
    const previousWeight = sortedWeights[1]?.weight
    const weightChange = latestWeight && previousWeight
      ? (parseFloat(latestWeight) - parseFloat(previousWeight)).toFixed(1)
      : ""

    const pendingTasks = tasks.filter(t => !t.completed).length
    const completedTasks = tasks.filter(t => t.completed).length

    return { weeklyWorkouts, monthlyWorkouts, weightChange, pendingTasks, completedTasks }
  }, [workoutLogs, weightLogs, tasks])

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
            weeklyWorkouts={stats.weeklyWorkouts}
            monthlyWorkouts={stats.monthlyWorkouts}
            weightChange={stats.weightChange}
            bmi={null}
            goalWeight={null}
          />
        </View>

        <View className="mt-4">
          <TasksChart
            pendingTasks={stats.pendingTasks}
            completedTasks={stats.completedTasks}
          />
        </View>
      </ScrollView>
    </View>
  )
}
