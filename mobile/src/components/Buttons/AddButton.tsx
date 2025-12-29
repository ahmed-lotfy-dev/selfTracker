import { Pressable } from "react-native"
import Entypo from "@expo/vector-icons/Entypo"
import { Ionicons } from "@expo/vector-icons"
import { Route, useRouter } from "expo-router"
import React from "react"

interface AddButtonProps {
  path: string
  icon?: string
  iconFamily?: "entypo" | "ionicons"
}

export default function AddButton({ path, icon = "plus", iconFamily = "entypo" }: AddButtonProps) {
  const router = useRouter()

  const IconComponent = iconFamily === "ionicons" ? Ionicons : Entypo

  return (
    <Pressable
      onPress={() => router.push(`${path}/add` as Route)}
      className="absolute bottom-28 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg bg-primary border border-primary/20"
    >
      <IconComponent name={icon as any} size={28} color="white" />
    </Pressable>
  )
}
