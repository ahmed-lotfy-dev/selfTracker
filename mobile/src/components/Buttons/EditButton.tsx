import React from "react"
import { Pressable, PressableProps } from "react-native"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { COLORS } from "@/src/constants/Colors"

interface EditButtonProps extends PressableProps {
  onPress?: () => void
  className?: string
}

export default function EditButton({ className, onPress }: EditButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`justify-center items-center p-2 rounded-md ${className}`}
    >
      <FontAwesome name="pencil" size={18} color={COLORS.success} />
    </Pressable>
  )
}
