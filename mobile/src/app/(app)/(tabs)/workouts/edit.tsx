import { View } from "react-native"
import WorkoutForm from "@/src/components/Workout/WorkoutForm"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import { useSelectedWorkout } from "@/src/store/useWokoutStore"
import { ScrollView } from "react-native"

export default function AddWorkout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <ScrollView style={{ flex: 1 }}>
      <WorkoutForm isEditing={true} />
    </ScrollView>
  )
}
