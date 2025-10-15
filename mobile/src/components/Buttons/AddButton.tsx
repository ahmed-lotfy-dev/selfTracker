import { View, Text, Pressable } from "react-native"
import Entypo from "@expo/vector-icons/Entypo"
import { Route, usePathname, useRouter } from "expo-router"
import React from "react"
import { COLORS } from "@/src/constants/Colors"

interface AddButtonProps {
  className?: string
  path: string
}

const BG_COLOR = COLORS.primary
export default function AddButton({ className, path }: AddButtonProps) {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push(`${path}/add` as Route)}
      className={`bg-primary rounded-full absolute right-10 bottom-40 w-12 h-12 justify-center items-center bg-green-950 hover:bg-green-950 border`}
    >
      <Entypo name="plus" size={24} color="white" />
    </Pressable>
  )
}
