import React from "react"
import { View, Text, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

interface LogFoodDateHeaderProps {
  selectedDate: Date
  onChangeDate: (days: number) => void
}

export default function LogFoodDateHeader({ selectedDate, onChangeDate }: LogFoodDateHeaderProps) {
  const colors = useThemeColors()

  return (
    <View
      className="flex-row items-center justify-between px-6 py-4 border-b"
      style={{ backgroundColor: colors.background, borderColor: colors.border }}
    >
      <Pressable onPress={() => onChangeDate(-1)} className="p-2">
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </Pressable>

      <View className="items-center">
        <Text className="text-base font-semibold" style={{ color: colors.text }}>
          {selectedDate.toDateString() === new Date().toDateString()
            ? "Today"
            : selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <Pressable onPress={() => onChangeDate(1)} className="p-2">
        <Ionicons name="chevron-forward" size={24} color={colors.primary} />
      </Pressable>
    </View>
  )
}
