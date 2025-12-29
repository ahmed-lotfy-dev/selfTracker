import React, { useMemo, useState } from "react"
import { View, Text, Dimensions, Pressable } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { useThemeColors } from "@/src/constants/Colors"
import { useWeightStore } from "@/src/stores/useWeightStore"
import { format, subMonths, subYears, isAfter } from "date-fns"

const SCREEN_WIDTH = Dimensions.get("window").width

type Range = "1M" | "3M" | "6M" | "1Y"

export const WeightChart = () => {
  const colors = useThemeColors()
  const weightLogs = useWeightStore(s => s.weightLogs)
  const [range, setRange] = useState<Range>("1M")

  const chartData = useMemo(() => {
    let startDate: Date
    switch (range) {
      case "1M": startDate = subMonths(new Date(), 1); break
      case "3M": startDate = subMonths(new Date(), 3); break
      case "6M": startDate = subMonths(new Date(), 6); break
      case "1Y": startDate = subYears(new Date(), 1); break
    }

    const filteredLogs = weightLogs
      .filter(l => !l.deletedAt && l.weight && isAfter(new Date(l.createdAt), startDate))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    if (filteredLogs.length < 2) return null

    // We only want a few labels on the X axis
    const labels = filteredLogs.map((l, i) =>
      i === 0 || i === filteredLogs.length - 1 || i === Math.floor(filteredLogs.length / 2)
        ? format(new Date(l.createdAt), "dd/MM")
        : ""
    )

    const data = filteredLogs.map(l => parseFloat(l.weight))

    return {
      labels,
      datasets: [{ data }]
    }
  }, [weightLogs, range])

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
    <View className="mb-4 bg-card rounded-2xl border border-border overflow-hidden shadow-sm mx-3">
      <View className="p-4 border-b border-border flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>Weight Trend</Text>
          <Text className="text-[10px] text-placeholder uppercase tracking-widest">Progress Visualization</Text>
        </View>
        <View className="flex-row gap-1">
          <RangeButton label="1M" value="1M" />
          <RangeButton label="3M" value="3M" />
          <RangeButton label="6M" value="6M" />
          <RangeButton label="1Y" value="1Y" />
        </View>
      </View>

      <View className="py-4 items-center justify-center">
        {chartData ? (
          <LineChart
            data={chartData}
            width={SCREEN_WIDTH - 48}
            height={180}
            yAxisSuffix="kg"
            withInnerLines={false}
            withOuterLines={false}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, ${opacity})`,
              labelColor: (opacity = 1) => colors.placeholder,
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: colors.primary
              },
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        ) : (
          <View className="py-12 items-center px-8">
            <Text className="text-placeholder text-center text-sm">
              Keep logging your weight to see your progress chart!
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
