import Entypo from "@expo/vector-icons/Entypo"
import { Route, useRouter } from "expo-router"
import { View, Text, Pressable } from "react-native"

type Props = { backTo: string }

export default function BackButton({ backTo }: Props) {
  const router = useRouter()

  return (
    <View>
      <Pressable onPress={() => router.navigate(backTo as Route)}>
        <Entypo name="chevron-left" className="ml-5" size={24} />
      </Pressable>
    </View>
  )
}
