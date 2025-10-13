import {
  Text,
  Pressable,
  View,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native"
import { Link, Route, useRouter } from "expo-router"
import DateDisplay from "../DateDisplay"
import { deleteWeight } from "@/src/lib/api/weightsApi"
import DeleteButton from "../Buttons/DeleteButton"
import { useDelete } from "@/src/hooks/useDelete"
import EditButton from "../Buttons/EditButton"
import { useWeightLogStore } from "@/src/store/useWeightStore"
import { WeightLogType } from "@/src/types/weightLogType"
import React from "react"

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
    onSuccessInvalidate: [
      { queryKey: ["weightLogs"] },
      { queryKey: ["weightLogsCalendar"] },
      { queryKey: ["userHomeData"] },
    ],
  })

  return (
    <View
      className="flex-1 flex-row justify-between items-center p-4 border shadow-md border-[#64748b] rounded-lg mb-3 my-5"
      key={item.id}
    >
      <View className="flex-1 x flex-row">
        <Link href={`/weights/${item.id}`} asChild>
          <Pressable className="flex-1">
            <Text className="text-xl font-bold mb-3">{item.weight} kg</Text>
            <DateDisplay date={item.createdAt} />
          </Pressable>
        </Link>
      </View>

      <View className="flex-1 justify-end flex-row gap-5">
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
