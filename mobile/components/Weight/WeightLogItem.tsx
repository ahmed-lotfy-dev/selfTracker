import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native"
import { Link, Route, useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import DateDisplay from "../DateDisplay"
import { deleteWeight } from "@/utils/api/weightsApi"
import DeleteButton from "../DeleteButton"
import { useDelete } from "@/hooks/useDelete"
import EditButton from "../EditButton"
import { useWeightLogStore } from "@/store/useWeightStore"

type WeightLogProps = {
  item: {
    id: string
    userId: string
    weight: number
    mood: string
    energy: string
    notes: string
    createdAt: string
  }
  path: string
}

export default function WeightLogItem({ item, path }: WeightLogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setSelectedWeight } = useWeightLogStore()
  const { deleteMutation, triggerDelete } = useDelete({
    mutationFn: () => deleteWeight(String(item?.id)),
    confirmTitle: "Delete Weight",
    confirmMessage: "Are you sure you want to delete this weight log?",
    onSuccessInvalidate: [{ queryKey: ["weightLogs"] }],
  })

  return (
    <View
      className="flex-row justify-center items-center p-4 border-b border-gray-200"
      key={item.id}
    >
      <Link href={`/weights/${item.id}`} asChild>
        <TouchableOpacity className="flex-1">
          <Text className="text-xl font-bold mb-3">{item.weight} kg</Text>
          <Text className="text-sm text-gray-500">
            <DateDisplay date={item.createdAt} />
          </Text>
        </TouchableOpacity>
      </Link>

      <View className="flex-row items-center gap-3">
        <EditButton
          onPress={() => {
            setSelectedWeight(item)
            router.navigate(`${path}/edit` as Route)
          }}
        />
        <DeleteButton
          onPress={triggerDelete}
          isLoading={deleteMutation.isPending}
        />
        {deleteMutation.isError && (
          <Text className="text-red-500 mt-2">
            {deleteMutation.error?.message || "Could not delete workout."}
          </Text>
        )}
      </View>
    </View>
  )
}
