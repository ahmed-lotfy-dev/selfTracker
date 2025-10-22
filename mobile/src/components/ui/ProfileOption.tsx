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
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "500",
          marginBottom: 4,
          color: colors.inputText,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onValueChange(option.value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              alignItems: "center",
              backgroundColor:
                selectedValue === option.value
                  ? colors.darkGreen // Dark green background for selected
                  : "white", // White background for not selected
              borderRightWidth: option.value === options[0].value ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color:
                  selectedValue === option.value
                    ? "lightgreen" // White text for selected
                    : "black", // Black text for not selected
                fontWeight: "500",
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
