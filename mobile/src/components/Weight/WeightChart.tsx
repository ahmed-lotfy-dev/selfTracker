import { View, Text, Button } from "react-native"
import React, { useState } from "react"
import { LineChart } from "react-native-chart-kit"
import { useQuery } from "@tanstack/react-query"
import { fetchUserHomeInfo } from "@/src/lib/api/userApi"

interface WeightLog {
  weight: string
  date: string
}

export const WeightChart = () => {
  const { data }: { data?: { threeMonthsWeightLogs?: WeightLog[] } } = useQuery(
    {
      queryKey: ["userHomeData"],
      queryFn: fetchUserHomeInfo,
      staleTime: 1000 * 60 * 5,
      enabled: true,
    }
  )
  const [isOpen, setIsOpen] = useState(false)
  const handlePress = () => {
    console.log("pressed")
  }
  console.log(data)
  return (
    <View className="flex-1 justify-center items-center ">
      <Text className="my-2 font-bold text-blue-500">Last Month</Text>

      {data?.threeMonthsWeightLogs && data.threeMonthsWeightLogs.length > 0 ? (
        <LineChart
          data={{
            labels: data.threeMonthsWeightLogs
              .map((log: WeightLog) => log.date)
              .filter(
                (_: string, index: number, array: string[]) =>
                  index % Math.ceil(array.length / 3) === 0
              ),
            datasets: [
              {
                data: data.threeMonthsWeightLogs.map((log: WeightLog) =>
                  parseFloat(log.weight)
                ),
              },
            ],
          }}
          width={320} // Adjusted width to prevent overflow
            height={200}
            chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#f9f9f9",
            backgroundGradientTo: "#f9f9f9",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Changed to blue
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
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
