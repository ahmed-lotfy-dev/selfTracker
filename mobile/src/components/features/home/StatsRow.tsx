import { View, Text, ScrollView } from "react-native"
import React, { useMemo } from "react"
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { useCollections } from "@/src/db/collections"
import { useLiveQuery } from "@tanstack/react-db"
import { safeParseDate } from "@/src/lib/utils/dateUtils"

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  icon: React.ReactNode
  colorClass: string
}

const getBgClass = (colorClass: string) => {
  const map: Record<string, string> = {
    "text-statPrimary": "bg-statPrimary/10",
    "text-statSecondary": "bg-statSecondary/10",
    "text-statTertiary": "bg-statTertiary/10",
    "text-statQuaternary": "bg-statQuaternary/10",
  }

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
  const collections = useCollections()

  if (!collections) {
    return null
  }

  const { data: workoutLogs = [] } = useLiveQuery((q: any) =>
    q.from({ logs: collections.workoutLogs })
      .select(({ logs }: any) => ({
        id: logs.id,
        createdAt: logs.createdAt,
      }))
  ) ?? { data: [] }

  const { data: weightLogs = [] } = useLiveQuery((q: any) =>
    q.from({ logs: collections.weightLogs })
      .select(({ logs }: any) => ({
        id: logs.id,
        weight: logs.weight,
        createdAt: logs.createdAt,
      }))
  ) ?? { data: [] }

  const stats = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const weeklyWorkouts = workoutLogs.filter(
      (log: any) => log.createdAt && safeParseDate(log.createdAt) > weekAgo
    ).length

    const monthlyWorkouts = workoutLogs.filter(
      (log: any) => log.createdAt && safeParseDate(log.createdAt) > monthAgo
    ).length

    const sortedWeights = [...weightLogs]
      .filter((w: any) => w.createdAt)
      .sort((a: any, b: any) => safeParseDate(b.createdAt).getTime() - safeParseDate(a.createdAt).getTime())

    const latestWeight = sortedWeights[0]?.weight
    const previousWeight = sortedWeights[1]?.weight
    const weightChange = latestWeight && previousWeight
      ? (parseFloat(latestWeight) - parseFloat(previousWeight)).toFixed(1)
      : ""

    return { weeklyWorkouts, monthlyWorkouts, weightChange }
  }, [workoutLogs, weightLogs])

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row py-2"
      contentContainerStyle={{ paddingRight: 20 }}
    >
      <StatCard
        label="Weekly Workouts"
        value={stats.weeklyWorkouts}
        icon={<FontAwesome5 name="dumbbell" size={16} color={colors.statPrimary} />}
        colorClass="text-statPrimary"
      />

      <StatCard
        label="Monthly Workouts"
        value={stats.monthlyWorkouts}
        icon={<MaterialIcons name="calendar-today" size={16} color={colors.statSecondary} />}
        colorClass="text-statSecondary"
      />

      <StatCard
        label="Weight Change"
        value={stats.weightChange || "N/A"}
        icon={<MaterialIcons name="monitor-weight" size={18} color={colors.statSecondary} />}
        colorClass="text-statSecondary"
      />
    </ScrollView>
  )
}
