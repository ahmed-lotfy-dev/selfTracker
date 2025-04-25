import { View, Text, Pressable, TouchableOpacity } from "react-native"
import Entypo from "@expo/vector-icons/Entypo"
import { Route, usePathname, useRouter } from "expo-router"
import { TouchableOpacityProps } from "react-native-gesture-handler"

interface AddButtonProps extends TouchableOpacityProps {
  className?: string
  path: string
}

export default function AddButton({ className, path }: AddButtonProps) {
  const router = useRouter()

  return (
    <TouchableOpacity
      onPress={() => router.push(`${path}/add` as Route)}
      className={`border border-slate-900 bg-slate-700 hover:bg-slate-800  transition-all ease-in-out rounded-full p-4 absolute bottom-10 right-10 z-10 ${className}`}
    >
      <Entypo name="plus" size={24} color="white" />
    </TouchableOpacity>
  )
}
