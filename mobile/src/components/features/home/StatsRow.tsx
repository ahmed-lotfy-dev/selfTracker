import { View, Text } from "react-native"
import React, { useMemo } from "react"
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { useTasksStore } from "@/src/stores/useTasksStore"
import { useHabitsStore } from "@/src/stores/useHabitsStore"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { useSyncStore } from "@/src/stores/useSyncStore"
import { PremiumCard } from "../../ui/PremiumCard"

import { useRouter } from "expo-router"

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  icon: React.ReactNode
  colors: readonly [string, string, ...string[]]
  onPress?: () => void
}

const StatCard = ({ label, value, subLabel, icon, colors, onPress }: StatCardProps) => (
  <View className="flex-1 min-h-[110px]">
    <PremiumCard 
      gradientColors={colors}
      containerStyle="border-white/5"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="w-8 h-8 rounded-lg bg-white/10 items-center justify-center">
          {icon}
        </View>
        <Text className="text-white/40 font-black text-[9px] uppercase tracking-tighter">{label}</Text>
      </View>
      <View className="flex-1 justify-end">
        <View className="flex-row items-baseline">
          <Text className="text-2xl font-black text-white tracking-tighter">{value}</Text>
          {subLabel && (
            <Text className="text-white/50 text-[10px] ml-1 font-bold uppercase tracking-tight">{subLabel}</Text>
          )}
        </View>
      </View>
    </PremiumCard>
  </View>
)

export const StatsRow = () => {
  const router = useRouter()
  const colors = useThemeColors()
  const tasks = useTasksStore((s) => s.tasks)
  const habits = useHabitsStore((s) => s.habits)
  const workouts = useWorkoutsStore((s) => s.workoutLogs)
  const isSyncComplete = useSyncStore((s) => s.isInitialSyncComplete)

  const stats = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.deletedAt)
    const activeHabits = habits.filter((h) => !h.deletedAt)

    const pendingTasks = activeTasks.filter((t) => !t.completed).length
    const today = new Date().toISOString().split('T')[0]
    const todayHabits = activeHabits.filter((h) => h.completionDates?.includes(today)).length
    const totalHabits = activeHabits.length
    const totalStreak = activeHabits.reduce((sum, h) => sum + h.streak, 0)

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const workoutsThisWeek = workouts.filter((w) => {
      const date = new Date(w.createdAt)
      return date > weekAgo
    }).length

    return {
      pendingTasks,
      habitsToday: `${todayHabits}/${totalHabits}`,
      totalStreak,
      workoutsThisWeek: workoutsThisWeek === 0 && workouts.length > 0 ? `${workouts.length} total` : workoutsThisWeek,
      isSyncing: !isSyncComplete && tasks.length === 0 && habits.length === 0 && workouts.length === 0
    }
  }, [tasks, habits, workouts, isSyncComplete])

  return (
    <View className="mt-4 gap-3">
      {/* 2x2 Grid Layout */}
      <View className="flex-row gap-3">
        <StatCard
          label="Tasks"
          value={stats.isSyncing ? "..." : stats.pendingTasks}
          subLabel={stats.isSyncing ? "syncing" : "pending"}
          icon={<Ionicons name="list" size={18} color="white" />}
          colors={['#6366f1', '#4338ca']} // Indigo
          onPress={() => router.push("/(drawer)/(tabs)/home/tasks")}
        />
        <StatCard
          label="Habits"
          value={stats.isSyncing ? "..." : stats.habitsToday}
          subLabel={stats.isSyncing ? "syncing" : "today"}
          icon={<FontAwesome5 name="check-double" size={14} color="white" />}
          colors={['#10b981', '#047857']} // Emerald
          onPress={() => router.push("/(drawer)/(tabs)/habits")}
        />
      </View>

      <View className="flex-row gap-3">
        <StatCard
          label="Streak"
          value={stats.isSyncing ? "..." : stats.totalStreak}
          subLabel={stats.isSyncing ? "syncing" : "days"}
          icon={<FontAwesome5 name="fire-alt" size={16} color="white" />}
          colors={['#f59e0b', '#d97706']} // Amber
          onPress={() => router.push("/(drawer)/(tabs)/habits")}
        />
        <StatCard
          label="Workouts"
          value={stats.isSyncing ? "..." : stats.workoutsThisWeek}
          subLabel={stats.isSyncing ? "syncing" : (typeof stats.workoutsThisWeek === 'number' ? "this week" : "")}
          icon={<MaterialIcons name="fitness-center" size={18} color="white" />}
          colors={['#ec4899', '#be185d']} // Pink
          onPress={() => router.push("/(drawer)/(tabs)/home/workouts")}
        />
      </View>
    </View>
  )
}
