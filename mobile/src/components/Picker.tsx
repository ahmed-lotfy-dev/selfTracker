import { View, Text } from "react-native"
import { Picker } from "@react-native-picker/picker"
import React from "react"
import { useThemeColors } from "@/src/constants/Colors"

interface SelectProps {
  options: { label: string; value: string }[]
  selectedValue: string
  onValueChange: (value: string) => void
  label: string
}

export default function Select({
  options,
  selectedValue,
  onValueChange,
  label,
}: SelectProps) {
  const colors = useThemeColors()
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 8,
          color: colors.text,
        }}
      >
        {label}
      </Text>
      <View className="h-10 justify-center border border-primary rounded-md overflow-hidden p-2">
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => onValueChange(itemValue as string)}
          style={{ color: colors.text }}
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  )
}
