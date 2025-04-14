import Entypo from "@expo/vector-icons/Entypo"
import { Route, useRouter } from "expo-router"
import { View, Text, Pressable } from "react-native"


export default function BackButton({ backTo }:{backTo: Route}) {
  const router = useRouter()

  return (
    <View>
      <Pressable onPress={() => router.push(backTo)}>
        <Entypo name="chevron-left" className="ml-3" size={24} />
      </Pressable>
    </View>
  )
}
