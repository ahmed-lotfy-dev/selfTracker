import { View, Text, Pressable } from "react-native"
import Entypo from "@expo/vector-icons/Entypo"
import { Route, usePathname, useRouter } from "expo-router"
import React from "react"

interface AddButtonProps {
  className?: string
  path: string
}

export default function AddButton({ className, path }: AddButtonProps) {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push(`${path}/add` as Route)}
      className={`bg-primary p-3 rounded-full ${className}`}
    >
      <Entypo name="plus" size={24} color="white" />
    </Pressable>
  )
}
