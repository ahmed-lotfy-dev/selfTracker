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
        className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center active:bg-white/10 transition-colors ${className}`}
    >
        <Entypo name="chevron-left" size={24} color="rgba(255,255,255,0.8)" />
    </Pressable>
  )
}
