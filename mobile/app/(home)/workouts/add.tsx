import { ScrollView, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import WorkoutForm from "@/components/Workout/WorkoutForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"

export default function AddWorkout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
        <WorkoutForm />
      </ScrollView>
    </SafeAreaView>
  )
}
