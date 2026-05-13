import React, { useMemo, useState } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { BarChart } from "react-native-chart-kit"
import { useThemeColors } from "@/src/constants/Colors"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { subMonths, subDays, isAfter } from "date-fns"
import { PremiumCard } from "../../ui/PremiumCard"

type Range = "1W" | "1M" | "3M" | "6M"

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
  const [chartWidth, setChartWidth] = useState(0)

  const chartData = useMemo(() => {
    let startDate: Date
    switch (range) {
      case "1W": startDate = subDays(new Date(), 7); break
      case "1M": startDate = subMonths(new Date(), 1); break
      case "3M": startDate = subMonths(new Date(), 3); break
      case "6M": startDate = subMonths(new Date(), 6); break
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
      .slice(0, 5)

    if (sorted.length === 0) return null

    return {
      labels: sorted.map(([name]) => name.length > 7 ? name.slice(0, 6) + '…' : name),
      datasets: [{ data: sorted.map(([, count]) => count) }]
    }
  }, [workoutLogs, range])

  const RangeButton = ({ label, value }: { label: string, value: Range }) => (
    <Pressable
      onPress={() => setRange(value)}
      className={`px-3 py-1 rounded-lg ${range === value ? "bg-white/20" : "bg-transparent"}`}
    >
      <Text className={`text-[10px] font-black ${range === value ? "text-white" : "text-white/40"}`}>
        {label}
      </Text>
    </Pressable>
  )

  return (
    <View className="mb-8">
      <PremiumCard
        gradientColors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
        containerStyle="border-white/5 py-6"
      >
        <View className="flex-row items-center justify-between mb-6 px-2">
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <View className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <Text className="text-white/40 font-black text-[10px] uppercase tracking-[2px]">Training Volume</Text>
            </View>
            <Text className="text-white text-3xl font-black tracking-tighter">Frequency</Text>
          </View>
          <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/5">
            <RangeButton label="1W" value="1W" />
            <RangeButton label="1M" value="1M" />
            <RangeButton label="3M" value="3M" />
            <RangeButton label="6M" value="6M" />
          </View>
        </View>

        <View
          onLayout={e => setChartWidth(e.nativeEvent.layout.width)}
          style={styles.chartContainer}
        >
          {chartData && chartWidth > 0 ? (
            <BarChart
              data={chartData}
              width={chartWidth}
              height={180}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              withInnerLines={false}
              showValuesOnTopOfBars
              chartConfig={{
                backgroundColor: "#0d0d14",
                backgroundGradientFrom: "#0d0d14",
                backgroundGradientTo: "#0d0d14",
                backgroundGradientFromOpacity: 0,
                backgroundGradientToOpacity: 0,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.35})`,
                barPercentage: 0.55,
                propsForLabels: {
                  fontSize: 9,
                  fontWeight: "bold",
                }
              }}
              style={styles.chart}
            />
          ) : !chartData && chartWidth > 0 ? (
            <View className="py-16 items-center px-10">
              <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/10 mb-4">
                <Text className="text-white/20 text-xl font-black">?</Text>
              </View>
              <Text className="text-white/30 text-center text-[10px] font-black uppercase tracking-[2px]">
                Awaiting Data Input
              </Text>
            </View>
          ) : null}
        </View>
      </PremiumCard>
    </View>
  )
}

const styles = StyleSheet.create({
  chartContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 12,
    marginTop: 4,
    marginLeft: -16,
  }
})
