import { fetchSingleWeightLog } from "@/utils/api/weightsApi"
import { useQuery } from "@tanstack/react-query"
import { usePathname } from "expo-router"
import View from "@/components/View"
import Text from "@/components/Text"

export default function WeightLog() {
  const id = usePathname().split("/").pop()
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
    <View className="p-5">
      <Text className="text-xl font-semibold mb-2">Weight Log</Text>
      <Text className="text-lg">Date: {log.date || "No date available"}</Text>
      <Text className="text-lg">
        Weight: {log.weight || "No weight recorded"}
      </Text>
      <Text className="text-lg">
        Notes: {log.notes || "No notes available"}
      </Text>
    </View>
  )
}
