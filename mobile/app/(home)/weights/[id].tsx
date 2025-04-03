import { View, Text } from "react-native"
import { fetchSingleWeightLog } from "@/utils/api/weightsApi"
import { useQuery } from "@tanstack/react-query"
import { Stack, useLocalSearchParams } from "expo-router"
import DateDisplay from "@/components/DateDisplay"

export default function WeightLog() {
  const { id } = useLocalSearchParams() as { id: string }
  console.log(id)

  const {
    data: weightLog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["WeightLog", id],
    queryFn: () =>
      id ? fetchSingleWeightLog(id) : Promise.reject("Invalid ID"),
    enabled: !!id,
  })

  console.log("Weight Log Response:", weightLog)

  if (isLoading) return <Text>Loading...</Text>
  if (isError) return <Text>Error loading weight log</Text>

  const log = weightLog?.weightLog?.[0] ?? {}

  return (
    <>
      <Stack.Screen
        options={{
          title: new Date(log.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        }}
      />
      <View className="p-5">
        <Text className="text-xl font-semibold mb-2">Weight Log</Text>
        <Text className="text-lg">
          Date:
          <DateDisplay date={log.createdAt} />
        </Text>
        <Text className="text-lg">
          Weight: {log.weight || "No weight recorded"}
        </Text>
        <Text className="text-lg">
          Notes: {log.notes || "No notes available"}
        </Text>
      </View>
    </>
  )
}
