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
import { deleteWeight } from "@/src/utils/api/weightsApi"
import DeleteButton from "../DeleteButton"
import { useDelete } from "@/src/hooks/useDelete"
import EditButton from "../EditButton"
import { useWeightLogStore } from "@/src/store/useWeightStore"
import { WeightLogType } from "@/src/types/weightLogType"

type WeightLogProps = {
  item: WeightLogType
  path: string
}

export default function WeightLogItem({ item, path }: WeightLogProps) {
  const router = useRouter()
  const { setSelectedWeight } = useWeightLogStore()
  const { deleteMutation, triggerDelete } = useDelete({
    mutationFn: () => deleteWeight(String(item?.id)),
    confirmTitle: "Delete Weight",
    confirmMessage: "Are you sure you want to delete this weight log?",
    onSuccessInvalidate: [{ queryKey: ["weightLogs", "weightLogsCalendar"] }],
  })

  return (
    <View
      className="flex-row justify-center items-center p-4 border shadow-md border-[#64748b] rounded-lg mb-3 mt-5"
      key={item.id}
    >
      <View className="flex-1 flex-row">
        <Link href={`/weights/${item.id}`} asChild>
          <TouchableOpacity className="flex-1">
            <Text className="text-xl font-bold mb-3">{item.weight} kg</Text>
            <Text className="text-sm text-gray-500">
              <DateDisplay date={item.createdAt} />
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="flex-1 flex-row gap-3">
        <EditButton
          onPress={() => {
            setSelectedWeight(item)
            router.push(`${path}/edit` as Route)
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
