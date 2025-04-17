import React, { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"

interface SelectOptionProps {
  title: string
  options: string[]
  onSelect: (value: string) => void
  initialValue?: string
}

const SelectOption: React.FC<SelectOptionProps> = ({
  title,
  options,
  onSelect,
  initialValue,
}) => {
  const [selectedOption, setSelectedOption] = useState(
    initialValue || options[0]
  )
  const position = useSharedValue(0)
  const width = useSharedValue(0)

  const handleSelect = (option: string, index: number) => {
    setSelectedOption(option)
    position.value = withSpring(index * width.value, {
      damping: 15,
      stiffness: 120,
    })
    onSelect(option)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }))

  return (
    <View className="flex-row items-center space-x-4 px-4 py-2 mb-3">
      <Text className="text-black text-base font-medium">{title}</Text>
      <View
        className="flex-row items-center bg-gray-200 relative rounded-lg p-1"
        onLayout={(event) => {
          width.value =
            (event.nativeEvent.layout.width - (options.length - 1) * 8) /
            options.length
        }}
      >
        {options.map((option, index) => (
          <TouchableOpacity
            key={option}
            className={`py-2 px-4 ${
              index !== options.length - 1 ? "mr-2" : ""
            }`}
            onPress={() => handleSelect(option, index)}
            activeOpacity={0.7}
          >
            <Text
              className={`text-center font-medium text-sm ${
                selectedOption === option
                  ? "text-white font-bold"
                  : "text-gray-700"
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          className="absolute bg-[#475569] rounded-md"
          style={[
            animatedStyle,
            {
              width: `${100 / options.length}%`,
              height: "100%",
            },
          ]}
        />
      </View>
    </View>
  )
}

export default SelectOption
