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
    <Pressable 
        onPress={handlePress} 
        className={`w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200 ${className}`}
    >
        <Entypo name="chevron-left" size={24} color="#374151" />
    </Pressable>
  )
}
