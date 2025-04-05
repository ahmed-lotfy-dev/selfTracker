import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native"
import { Route, useRouter } from "expo-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import DateDisplay from "./DateDisplay"
import { deleteWeight } from "@/utils/api/weightsApi"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { formatLocalDate } from "@/utils/lib"
import DeleteButton from "./DeleteButton"
import { useDelete } from "@/hooks/useDelete"

type WeightLogProps = {
  item: {
    id: string | number
    weight: number
    createdAt: string
  }
  path: string
}

export default function WeightLogItem({ item, path }: WeightLogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const localDate = formatLocalDate(item.createdAt)

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
      <TouchableOpacity
        className="flex-1"
        onPress={() => router.push(`${path}/${String(item.id)}` as Route)}
      >
        <Text className="text-xl font-bold mb-3">{item.weight} kg</Text>
        <Text className="text-sm text-gray-500">
          <DateDisplay date={localDate} />
        </Text>
      </TouchableOpacity>
      <View>
        <DeleteButton
          onDelete={triggerDelete}
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
