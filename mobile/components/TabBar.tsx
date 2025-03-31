import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"

const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View className="flex-row justify-center items-center p-2 w-11/12 gap-3 rounded-3xl  m-auto bg-gray-200 shadow-md">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = options.title || route.name

        const isFocused = state.index === index

        const IconComponent = options.tabBarIcon

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            className={`flex-1 justify-center items-center p-2 rounded-3xl bg-slate-700 shadow-md`}
          >
            {IconComponent &&
              IconComponent({
                color: isFocused ? "#d97706" : "#9ca3af",
                size: 22,
                focused: isFocused,
              })}
            {/* <Text
              className={`${
                isFocused ? "text-amber-600 font-semibold" : "text-gray-200"
              } text-xs mt-1`}
            >
              {label}
            </Text> */}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default TabBar
