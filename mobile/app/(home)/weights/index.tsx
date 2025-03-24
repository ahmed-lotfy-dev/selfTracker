import { WeightType } from "@/types/weightType"
import { fetchAllWeights } from "@/utils/api/weightsApi"
import { FlashList } from "@shopify/flash-list"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import Text from "@/components/Text"
import View from "@/components/View"
import { ActivityIndicator, Pressable } from "react-native"

export default function WeightsScreen() {
  const router = useRouter()
  const limit = 10

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["weights"],
    queryFn: ({ pageParam }) => fetchAllWeights(pageParam, limit), 
    getNextPageParam: (lastPage) => lastPage.nextCursor, 
    initialPageParam: null, 
  })

  const logs = data?.pages.flatMap((page) => page.weights || []) || []

  console.log("Logs:", logs)

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
        <Text className="text-red-500">{error.message}</Text>
      </View>
    )
  }

  if (logs.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No weights found.</Text>
      </View>
    )
  }

  const renderWeightItem = ({ item }: { item: WeightType }) => {
    if (!item) return null 
    return (
      <Pressable
        className="p-4 border-b border-gray-200"
        onPress={() => router.push(`/weights/${item.id}`)}
      >
        <Text className="text-lg font-semibold">{item.weight} kg</Text>
        <Text className="text-sm text-gray-500">
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </Pressable>
    )
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Weight Logs</Text>
      <FlashList
        data={logs || []}
        renderItem={renderWeightItem}
        keyExtractor={(item) => {
          console.log("Item ID:", item?.id)                      
          return item?.id?.toString() || "fallback-key"
        }}
        estimatedItemSize={50}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" className="my-4" />
          ) : null
        }
      />
    </View>
  )
}
