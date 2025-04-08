import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import WorkoutForm from "@/components/Workout/WorkoutForm"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import { useSelectedWorkout } from "@/store/useWokoutStore"

export default function AddWorkout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = useLocalSearchParams()
  const selectedWorkout = useSelectedWorkout()
  console.log({ selectedWorkout })
  return (
    <SafeAreaView>
      <WorkoutForm isEditing={true} />
    </SafeAreaView>
  )
}
