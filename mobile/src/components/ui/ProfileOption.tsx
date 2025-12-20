import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import * as SelectPrimitive from "@rn-primitives/select"
import { useThemeColors } from "@/src/constants/Colors"

interface Option {
  label: string
  value: string
}

interface ProfileOptionProps {
  options: [Option, Option] // Exactly two options
  selectedValue: string
  onValueChange: (value: string) => void
  label: string
}

export const ProfileOption = ({
  options,
  selectedValue,
  onValueChange,
  label,
}: ProfileOptionProps) => {
  const colors = useThemeColors()

  return (
    <View className="mb-4">
      <Text className="text-base font-medium mb-1 text-text">
        {label}
      </Text>
      <View className="flex-row rounded-md border border-border overflow-hidden mb-3">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onValueChange(option.value)}
            className={`flex-1 py-2 items-center justify-center border-border ${selectedValue === option.value ? "bg-primary" : "bg-card"
              }`}
            style={{
              borderRightWidth: option.value === options[0].value ? 1 : 0,
            }}
          >
            <Text
              className={`font-medium ${selectedValue === option.value ? "text-white" : "text-text"
                }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
