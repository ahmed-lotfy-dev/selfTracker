import React from "react"
import Entypo from "@expo/vector-icons/Entypo"
import { Href, useRouter } from "expo-router"
import { View, Text, Pressable } from "react-native"
import { useCallback } from "react"

export default function BackButton({
  backTo,
  className,
}: {
  backTo?: Href
  className?: string
}) {
  const router = useRouter()

  const handlePress = useCallback(() => {
    if (backTo) {
      router.push(backTo)
    } else {
      router.back()
    }
  }, [backTo, router])

  return (
    <View
      className={` w-10 h-10 rounded-full flex items-center justify-center mt-5  ${className}`}
    >
      <Pressable onPress={handlePress} className="">
        <Entypo name="chevron-left" size={24} />
      </Pressable>
    </View>
  )
}
