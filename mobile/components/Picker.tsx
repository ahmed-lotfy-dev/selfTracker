import { View, Text } from "react-native"
import { Picker } from "@react-native-picker/picker"
import React from "react"

type Props = {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
  options: { id: string; name: string; trainingSplit: string }[]
}

export default function Select({ value, setValue, options }: Props) {
  return (
    <View className="h-10 justify-center border border-primary rounded-md overflow-hidden mb-5 p-2">
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => setValue(itemValue)}
      >
        {options.map((option, index) => (
          <Picker.Item key={option.id} label={option.name} value={option.id} />
        ))}
      </Picker>
    </View>
  )
}
