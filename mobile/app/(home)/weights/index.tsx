import { WeightType } from "@/types/weightType"
import { fetchAllWeights } from "@/utils/api/weightsApi"
import { FlashList } from "@shopify/flash-list"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import Text from "@/components/Text"
import View from "@/components/View"
import { ActivityIndicator, Pressable } from "react-native"

export default function WeightsScreen() {
  const router = useRouter()

  const {
    data: weightLogs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["AllWeightsLogs"],
    queryFn: fetchAllWeights,
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">
          Failed to load weights. Please try again.
        </Text>
      </View>
    )
  }

  const logs = weightLogs?.weights || []
  if (logs.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No weights found.</Text>
      </View>
    )
  }

  const renderWeightItem = ({ item }: { item: WeightType }) => (
    <Pressable
      className="p-4 border-b border-gray-200"
      onPress={() => router.push(`/weights/${item.id}`)}
    >
      <Text className="text-lg font-semibold">{item.weight} kg</Text>
    </Pressable>
  )

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Weight Logs</Text>
      <FlashList
        data={logs}
        renderItem={renderWeightItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={50}
      />
    </View>
  )
}
