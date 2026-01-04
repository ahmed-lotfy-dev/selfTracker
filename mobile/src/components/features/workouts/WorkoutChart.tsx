import React, { useMemo, useState } from "react"
import { View, Text, Dimensions, Pressable } from "react-native"
import { BarChart } from "react-native-chart-kit"
import { useThemeColors } from "@/src/constants/Colors"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { subMonths, subDays, subYears, isAfter } from "date-fns"

const SCREEN_WIDTH = Dimensions.get("window").width

type Range = "1W" | "1M" | "3M" | "6M" | "1Y"

const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date()
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T')
  const date = new Date(normalized)
  return isNaN(date.getTime()) ? new Date() : date
}

export const WorkoutChart = () => {
  const colors = useThemeColors()
  const workoutLogs = useWorkoutsStore(s => s.workoutLogs)
  const [range, setRange] = useState<Range>("1M")

  const chartData = useMemo(() => {
    let startDate: Date

    switch (range) {
      case "1W":
        startDate = subDays(new Date(), 7)
        break
      case "1M":
        startDate = subMonths(new Date(), 1)
        break
      case "3M":
        startDate = subMonths(new Date(), 3)
        break
      case "6M":
        startDate = subMonths(new Date(), 6)
        break
      case "1Y":
        startDate = subYears(new Date(), 1)
        break
    }

    const activeLogs = workoutLogs.filter(l =>
      !l.deletedAt && isAfter(parseDate(l.createdAt), startDate)
    )

    if (activeLogs.length === 0) return null

    const workoutCounts = activeLogs.reduce((acc, log) => {
      const name = log.workoutName || 'Other'
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sorted = Object.entries(workoutCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)

    if (sorted.length === 0) return null

    return {
      labels: sorted.map(([name]) => name.length > 8 ? name.slice(0, 7) + '…' : name),
      datasets: [{ data: sorted.map(([, count]) => count) }]
    }
  }, [workoutLogs, range])

  const RangeButton = ({ label, value }: { label: string; value: Range }) => (
    <Pressable
      onPress={() => setRange(value)}
      className={`px-3 py-1 rounded-full ${range === value ? "bg-primary" : "bg-card border border-border"}`}
    >
      <Text className={`text-[10px] font-bold ${range === value ? "text-white" : "text-placeholder"}`}>
        {label}
      </Text>
    </Pressable>
  )

  return (
    <View className="mb-4 bg-card rounded-2xl border border-border overflow-hidden shadow-sm mx-1">
      <View className="p-4 border-b border-border flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>Workouts</Text>
          <Text className="text-[10px] text-placeholder uppercase tracking-widest">By Type</Text>
        </View>
        <View className="flex-row gap-1">
          <RangeButton label="1W" value="1W" />
          <RangeButton label="1M" value="1M" />
          <RangeButton label="3M" value="3M" />
          <RangeButton label="6M" value="6M" />
          <RangeButton label="1Y" value="1Y" />
        </View>
      </View>

      <View className="py-4 items-center justify-center">
        {chartData ? (
          <BarChart
            data={chartData}
            width={SCREEN_WIDTH - 48}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            withInnerLines={false}
            showValuesOnTopOfBars
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => colors.primary,
              labelColor: (opacity = 1) => colors.placeholder,
              style: {
                borderRadius: 16
              },
              barPercentage: 0.6,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        ) : (
          <View className="py-12 items-center px-8">
            <Text className="text-placeholder text-center text-sm">
              No workouts in this period. Log some workouts!
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
