import React, { useMemo, useState } from "react"
import { View, Text, Dimensions, Pressable } from "react-native"
import { BarChart } from "react-native-chart-kit"
import { useThemeColors } from "@/src/constants/Colors"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { format, subMonths, subYears, eachDayOfInterval, isSameDay, isAfter, startOfDay } from "date-fns"

const SCREEN_WIDTH = Dimensions.get("window").width

type Range = "1W" | "1M" | "3M" | "6M"

export const WorkoutChart = () => {
  const colors = useThemeColors()
  const workoutLogs = useWorkoutsStore(s => s.workoutLogs)
  const [range, setRange] = useState<Range>("1W")

  const chartData = useMemo(() => {
    let startDate: Date
    let intervalDays: number

    switch (range) {
      case "1W":
        startDate = subMonths(new Date(), 0); // Logic fix: 7 days
        startDate.setDate(new Date().getDate() - 6);
        intervalDays = 7;
        break
      case "1M":
        startDate = subMonths(new Date(), 1);
        intervalDays = 30;
        break
      case "3M":
        startDate = subMonths(new Date(), 3);
        intervalDays = 90;
        break
      case "6M":
        startDate = subMonths(new Date(), 6);
        intervalDays = 180;
        break
    }

    // For larger ranges, grouping by week might be better, but let's stick to daily for now 
    // or limit the number of bars shown.

    const days = eachDayOfInterval({
      start: startOfDay(startDate),
      end: startOfDay(new Date())
    })

    // To prevent too many bars, we'll slice the days for the chart display if range is large,
    // or aggregate. For BarChart, too many bars looks bad.
    // Let's keep it simple: if > 14 days, we just show the last 14 for the bar chart 
    // OR we could just show the frequency.

    const displayDays = days.length > 30 ? days.slice(-30) : days

    const labels = displayDays.map((day, i) =>
      displayDays.length <= 14 || i % Math.floor(displayDays.length / 5) === 0
        ? format(day, displayDays.length > 7 ? "dd/MM" : "EEE")
        : ""
    )

    const counts = displayDays.map(day =>
      workoutLogs.filter(l => !l.deletedAt && isSameDay(new Date(l.createdAt), day)).length
    )

    const hasAnyWorkouts = counts.some(c => c > 0)
    if (!hasAnyWorkouts) return null

    return {
      labels,
      datasets: [{ data: counts }]
    }
  }, [workoutLogs, range])

  const RangeButton = ({ label, value }: { label: string, value: Range }) => (
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
          <Text className="text-lg font-bold" style={{ color: colors.text }}>Activity</Text>
          <Text className="text-[10px] text-placeholder uppercase tracking-widest">Workout Frequency</Text>
        </View>
        <View className="flex-row gap-1">
          <RangeButton label="1W" value="1W" />
          <RangeButton label="1M" value="1M" />
          <RangeButton label="3M" value="3M" />
          <RangeButton label="6M" value="6M" />
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
              barPercentage: 0.5,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        ) : (
          <View className="py-12 items-center px-8">
            <Text className="text-placeholder text-center text-sm">
              Keep moving! Log your workouts to see your activity here.
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
