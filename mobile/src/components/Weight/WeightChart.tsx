import { View, Text, Button, ActivityIndicator, Dimensions } from "react-native"
import React, { useState } from "react"
import { LineChart } from "react-native-chart-kit"
import { useQuery } from "@tanstack/react-query"
import { fetchUserHomeInfo } from "@/src/lib/api/userApi"
import { fetchWeightLogsChart } from "@/src/lib/api/weightsApi"
import { COLORS } from "@/src/constants/Colors"

interface WeightLog {
  weight: string
  date: string
}

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

  return (
    <View
      className="flex-1 justify-center items-center "
      style={{
        width: SCREEN_WIDTH - 32, // Adjusted width to prevent overflow
        height: CHART_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        margin: "auto",
      }}
    >
      <Text className="my-2 font-bold text-blue-500">Last Month</Text>

      {data ? (
        <LineChart
          data={data}
          width={SCREEN_WIDTH - 32} // Adjusted width to prevent overflow
          height={200}
          chartConfig={{
            barPercentage: 2,
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#f9f9f9",
            backgroundGradientTo: "#f9f9f9",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Changed to blue
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          bezier
          style={{
            borderRadius: 6,
            borderColor: "black",
            borderWidth: 1,
          }}
        />
      ) : (
        <Text className="text-center text-gray-500 mt-4">
          No weight logs found. Start tracking to see progress.
        </Text>
      )}
    </View>
  )
}
