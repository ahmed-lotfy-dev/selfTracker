import React from "react"
import Entypo from "@expo/vector-icons/Entypo"
import { Route, useRouter } from "expo-router"
import { View, Text, Pressable } from "react-native"

export default function BackButton({
  backTo,
  className,
}: {
  backTo: Route
  className?: string
}) {
  const router = useRouter()

  return (
    <View
      className={` w-10 h-10 rounded-full flex items-center justify-center mt-5  ${className}`}
    >
      <Pressable onPress={() => router.push(backTo)} className="">
        <Entypo name="chevron-left" size={24} />
      </Pressable>
    </View>
  )
}
