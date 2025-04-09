import { ScrollView, View } from "react-native"
import WorkoutForm from "@/components/Workout/WorkoutForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"

export default function AddWorkout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
      <ScrollView className="flex-1">
        <WorkoutForm />
      </ScrollView>
  )
}
