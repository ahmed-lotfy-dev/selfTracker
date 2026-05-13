import React, { useMemo, useState } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { useThemeColors } from "@/src/constants/Colors"
import { useWeightStore } from "@/src/stores/useWeightStore"
import { format, subMonths, isAfter } from "date-fns"
import { PremiumCard } from "../../ui/PremiumCard"

type Range = "1M" | "3M" | "6M"

export const WeightChart = () => {
  const colors = useThemeColors()
  const weightLogs = useWeightStore(s => s.weightLogs)
  const [range, setRange] = useState<Range>("1M")
  const [chartWidth, setChartWidth] = useState(0)

  const chartData = useMemo(() => {
    let startDate: Date
    switch (range) {
      case "1M": startDate = subMonths(new Date(), 1); break
      case "3M": startDate = subMonths(new Date(), 3); break
      case "6M": startDate = subMonths(new Date(), 6); break
    }

    const filteredLogs = weightLogs
      .filter(l => !l.deletedAt && l.weight && isAfter(new Date(l.createdAt), startDate))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    if (filteredLogs.length < 2) return null

    const labels = filteredLogs.map((l, i) =>
      i === 0 || i === filteredLogs.length - 1 || i === Math.floor(filteredLogs.length / 2)
        ? format(new Date(l.createdAt), "dd/MM")
        : ""
    )

    const data = filteredLogs.map(l => parseFloat(l.weight))

    return { labels, datasets: [{ data }] }
  }, [weightLogs, range])

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
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Text className="text-white/40 font-black text-[10px] uppercase tracking-[2px]">Weight Velocity</Text>
            </View>
            <Text className="text-white text-3xl font-black tracking-tighter">Progress</Text>
          </View>
          <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/5">
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
            <LineChart
              data={chartData}
              width={chartWidth}
              height={180}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
              chartConfig={{
                backgroundColor: "#0f172a",
                backgroundGradientFrom: "#0f172a",
                backgroundGradientTo: "#0f172a",
                fillShadowGradientFrom: "#10b981",
                fillShadowGradientTo: "#10b981",
                fillShadowGradientFromOpacity: 0.18,
                fillShadowGradientToOpacity: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.35})`,
                decimalPlaces: 1,
                propsForDots: {
                  r: "3",
                  strokeWidth: "2",
                  stroke: "#10b981"
                },
                propsForLabels: {
                  fontSize: 10,
                  fontWeight: "bold",
                }
              }}
              bezier
              style={styles.chart}
              transparent
              getDotColor={() => "#10b981"}
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
