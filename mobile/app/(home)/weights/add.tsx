import { ScrollView, View } from "react-native"
import WeightForm from "@/components/Weight/WeightForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"

export default function AddWeight() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
      <ScrollView className="flex-1">
        <WeightForm />
      </ScrollView>
  )
}
