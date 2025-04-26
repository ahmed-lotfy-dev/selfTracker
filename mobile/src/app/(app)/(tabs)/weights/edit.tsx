import { ScrollView, View } from "react-native"
import WeightForm from "@/src/components/Weight/WeightForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"

export default function AddWeight() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <ScrollView style={{ flex: 1 }}>
      <WeightForm isEditing={true} />
    </ScrollView>
  )
}
