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
import { deleteWorkout } from "@/utils/api/workoutsApi"
import FontAwesome from "@expo/vector-icons/FontAwesome"

type WorkoutLogProps = {
  item: {
    logId: string | number
    workoutName: string
    createdAt: string
  }
  path: string
}

export default function WorkoutLogItem({ item, path }: WorkoutLogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkout(String(item.logId)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workoutLogs"] }),
    onError: () => Alert.alert("Error", "Failed to delete workout log."),
  })

  const DeleteAlert = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this workout log?"
      )
      if (confirmed) {
        deleteMutation.mutate()
      }
    } else {
      Alert.alert(
        "Delete workout log",
        "Are you sure you want to delete this workout log?",
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
      key={item.logId}
    >
      <TouchableOpacity
        className="flex-1"
        onPress={() => router.push(`${path}/${String(item.logId)}` as Route)}
      >
        <Text className="text-xl font-bold mb-3">{item.workoutName}</Text>
        <Text className="text-sm text-gray-500">
          <DateDisplay date={item.createdAt} />
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={DeleteAlert}
        disabled={deleteMutation.isPending}
        className="ml-4 p-2 bg-red-500 rounded-md"
      >
        {deleteMutation.isPending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <FontAwesome name="trash-o" size={18} color="white" />
        )}
      </TouchableOpacity>
    </View>
  )
}
