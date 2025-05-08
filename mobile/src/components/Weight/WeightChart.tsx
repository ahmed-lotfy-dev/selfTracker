import { View, Text, Button } from "react-native"
import React, { useState } from "react"
import { LineChart } from "react-native-chart-kit"
import { useQuery } from "@tanstack/react-query"
import { fetchUserHomeInfo } from "@/src/lib/api/userApi"
import { fetchWeightLogsChart } from "@/src/lib/api/weightsApi"

interface WeightLog {
  weight: string
  date: string
}

export const WeightChart = () => {
  const [month, setMonth] = useState<number>(1)

  const { data } = useQuery({
    queryKey: ["weightLogsChartData", month],
    queryFn: () => fetchWeightLogsChart(month),
    staleTime: 1000 * 60 * 5,
  })

  console.log("Workout Chart Data:", data)
  const [isOpen, setIsOpen] = useState(false)
  const handlePress = () => {
    console.log("pressed")
  }
  console.log(data)
  return (
    <View className="flex-1 justify-center items-center ">
      <Text className="my-2 font-bold text-blue-500">Last Month</Text>

      {data ? (
        <LineChart
          data={data}
          width={320} // Adjusted width to prevent overflow
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
            width: "100%",
            marginVertical: 3,
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
