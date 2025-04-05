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

  const deleteMutation = useMutation({
    mutationFn: () => deleteWeight(String(item.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weightLogs"] })
      queryClient.invalidateQueries({ queryKey: ["weightLogsCalendar"] })
    },
    onError: () =>
      setTimeout(() => Alert.alert("Error", "Failed to delete weight log."), 0),
  })

  const DeleteAlert = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this weight log?"
      )
      if (confirmed) {
        deleteMutation.mutate()
      }
    } else {
      Alert.alert(
        "Delete weight log",
        "Are you sure you want to delete this weight log?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", onPress: () => deleteMutation.mutate() },
        ],
        { cancelable: true }
      )
    }
  }

  return (
    <View
      className="flex-row justify-between items-center p-4 border-b border-gray-200"
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
      <DeleteButton deleteMutation={deleteMutation} DeleteAlert={DeleteAlert} />
    </View>
  )
}
