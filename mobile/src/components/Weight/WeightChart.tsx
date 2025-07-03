import { View, Text, Button, ActivityIndicator, Dimensions } from "react-native"
import React, { useState } from "react"
import { LineChart } from "react-native-chart-kit"
import { useQuery } from "@tanstack/react-query"
import { fetchWeightLogsChart } from "@/src/lib/api/weightsApi"
import { COLORS } from "@/src/constants/Colors"

const SCREEN_WIDTH = Dimensions.get("window").width

const CHART_HEIGHT = 250 // Fixed height including padding

export const WeightChart = () => {
  const [month, setMonth] = useState<number>(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["weightLogsChartData", month],
    queryFn: () => fetchWeightLogsChart(month),
    staleTime: 1000 * 60 * 5,
  })

  const handlePress = () => {
    console.log("pressed")
  }

  if (isLoading || !data) {
    return (
      <View
        className="flex-1 justify-center items-center p-4"
        style={{
          height: CHART_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View
        className="flex-1 justify-center items-center p-4"
        style={{
          height: CHART_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text className="text-red-500 text-center">
          Error loading chart data. Please try again later.
        </Text>
      </View>
    )
  }

  const noChartData =
    !data ||
    !data.labels?.length ||
    !data.datasets?.[0]?.data?.length ||
    data.datasets[0].data.every((val:any) => typeof val !== "number" || isNaN(val))

  return (
    <View
      style={{
        width: SCREEN_WIDTH - 32,
        // height: CHART_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        alignSelf: "center",
      }}
    >
      <Text
        style={{ marginBottom: 8, fontWeight: "bold", color: COLORS.primary }}
      >
        Last Month
      </Text>

      {noChartData ? (
        <Text style={{ textAlign: "center", color: "#6B7280" }}>
          No weight logs found this month. Start tracking to see your progress!
        </Text>
      ) : (
        <LineChart
          data={data}
          width={SCREEN_WIDTH - 32}
          height={200}
          chartConfig={{
            barPercentage: 2,
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#f9f9f9",
            backgroundGradientTo: "#f9f9f9",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          bezier
          style={{
            borderRadius: 6,
            borderColor: "black",
            borderWidth: 1,
          }}
        />
      )}
    </View>
  )
}
