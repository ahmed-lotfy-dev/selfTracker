import { View, Text, Pressable, TouchableOpacity } from "react-native"
import Entypo from "@expo/vector-icons/Entypo"
import { Route, usePathname, useRouter } from "expo-router"

export default function AddButton({ className }: { className?: string }) {
  const router = useRouter()
  const path = usePathname()

  return (
    <TouchableOpacity
      onPress={() => router.push(`${path}/add` as Route)}
      className={`border border-green-700 bg-green-800 hover:border-green-700 hover:bg-green-900 transition-all ease-in-out  rounded-full p-4 absolute ${className}`}
    >
        <Entypo name="plus" size={24} color="white" />
    </TouchableOpacity>
  )
}
