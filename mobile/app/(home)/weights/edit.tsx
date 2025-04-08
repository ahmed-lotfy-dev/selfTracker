import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import WeightForm from "@/components/Weight/WeightForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"

export default function AddWeight() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <SafeAreaView>
      <WeightForm isEditing={true} />
    </SafeAreaView>
  )
}
