import React from "react"
import { Pressable } from "react-native"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { COLORS } from "@/src/constants/Colors"
import ActivitySpinner from "../ActivitySpinner"

type DeleteButtonProps = {
  onPress?: () => void
  isLoading?: boolean
  className?: string
}

export default function DeleteButton({
  onPress,
  isLoading,
  className,
}: DeleteButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className={`justify-center items-center
       p-2 rounded-md border border-red-500 ${className}`}
    >
      {isLoading ? (
        <ActivitySpinner size="small" color={COLORS.primary} />
      ) : (
        <FontAwesome name="trash-o" size={20} color="red" />
      )}
    </Pressable>
  )
}
