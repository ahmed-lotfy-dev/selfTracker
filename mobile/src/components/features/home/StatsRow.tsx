import { View, Text, ScrollView } from "react-native"
import React, { useMemo } from "react"
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { useTasksStore } from "@/src/stores/useTasksStore"
import { useHabitsStore } from "@/src/stores/useHabitsStore"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  icon: React.ReactNode
  colorClass: string
}

const getBgClass = (colorClass: string) => {
  if (colorClass.includes("statPrimary")) return "bg-statPrimary/10"
  if (colorClass.includes("statSecondary")) return "bg-statSecondary/10"
  if (colorClass.includes("statTertiary")) return "bg-statTertiary/10"
  if (colorClass.includes("statQuaternary")) return "bg-statQuaternary/10"
  return "bg-background"
}

const StatCard = ({ label, value, subLabel, icon, colorClass }: StatCardProps) => (
  <View
    className={`bg-card p-4 rounded-xl shadow-sm mr-3 min-w-[140px] border border-border flex-1`}
  >
    <View className={`p-2 rounded-full self-start mb-3 ${getBgClass(colorClass)}`}>
      {icon}
    </View>
    <Text className="text-2xl font-bold text-text">{value}</Text>
    <Text className="text-placeholder font-medium text-xs uppercase mt-1">{label}</Text>
    {subLabel && <Text className="text-placeholder text-xs mt-1">{subLabel}</Text>}
  </View>
)

export const StatsRow = () => {
  const colors = useThemeColors()
  const tasks = useTasksStore((s) => s.tasks)
  const habits = useHabitsStore((s) => s.habits)
  const workouts = useWorkoutsStore((s) => s.workoutLogs)

  const stats = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.deletedAt)
    const activeHabits = habits.filter((h) => !h.deletedAt)

    const pendingTasks = activeTasks.filter((t) => !t.completed).length
    const todayHabits = activeHabits.filter((h) => h.completedToday).length
    const totalHabits = activeHabits.length
    const totalStreak = activeHabits.reduce((sum, h) => sum + h.streak, 0)

    const workoutsThisWeek = workouts.filter((w) => {
      const date = new Date(w.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date > weekAgo
    }).length

    return {
      pendingTasks,
      habitsToday: `${todayHabits}/${totalHabits}`,
      totalStreak,
      workoutsThisWeek,
    }
  }, [tasks, habits, workouts])

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3 -mx-2 px-2"
      contentContainerStyle={{ paddingRight: 16 }}
    >
      <StatCard
        label="Pending Tasks"
        value={stats.pendingTasks}
        icon={<MaterialIcons name="check-circle" size={20} color={colors.statPrimary} />}
        colorClass="text-statPrimary"
      />
      <StatCard
        label="Habits Today"
        value={stats.habitsToday}
        icon={<FontAwesome5 name="fire" size={18} color={colors.statSecondary} />}
        colorClass="text-statSecondary"
      />
      <StatCard
        label="Total Streak"
        value={stats.totalStreak}
        subLabel="days"
        icon={<FontAwesome5 name="trophy" size={18} color={colors.statTertiary} />}
        colorClass="text-statTertiary"
      />
      <StatCard
        label="Workouts"
        value={stats.workoutsThisWeek}
        subLabel="this week"
        icon={<MaterialIcons name="fitness-center" size={20} color={colors.statQuaternary} />}
        colorClass="text-statQuaternary"
      />
    </ScrollView>
  )
}
