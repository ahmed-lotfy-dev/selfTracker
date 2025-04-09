import { View } from "react-native"
import WorkoutForm from "@/components/Workout/WorkoutForm"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import { useSelectedWorkout } from "@/store/useWokoutStore"
import { ScrollView } from "react-native-gesture-handler"

export default function AddWorkout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  return (
      <ScrollView className="flex-1">
        <WorkoutForm isEditing={true} />
      </ScrollView>
  )
}
