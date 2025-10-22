import { View, Text, Pressable } from "react-native"
import Entypo from "@expo/vector-icons/Entypo"
import { Route, usePathname, useRouter } from "expo-router"
import React from "react"
import { COLORS } from "@/src/constants/Colors"

interface AddButtonProps {
  path: string
}

const BG_COLOR = COLORS.primary
export default function AddButton({  path }: AddButtonProps) {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push(`${path}/add` as Route)}
      className={`rounded-full absolute right-10 bottom-28 w-12 h-12 justify-center items-center bg-green-950 hover:bg-green-950 border`}
    >
      <Entypo name="plus" size={24} color="white" />
    </Pressable>
  )
}
