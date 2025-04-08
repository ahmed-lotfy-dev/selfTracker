import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import WorkoutForm from "@/components/Workout/WorkoutForm"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import { useSelectedWorkout } from "@/store/useWokoutStore"
import { ScrollView } from "react-native-gesture-handler"

export default function AddWorkout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
        <WorkoutForm isEditing={true} />
      </ScrollView>
    </SafeAreaView>
  )
}
