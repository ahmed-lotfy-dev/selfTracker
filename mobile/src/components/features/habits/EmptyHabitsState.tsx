import React from "react"
import { View, Text } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

export default function EmptyHabitsState() {
  return (
    <View className="items-center justify-center py-20 px-10">
      <View className="w-20 h-20 rounded-[30px] bg-white/5 items-center justify-center border border-white/10 mb-6">
        <MaterialCommunityIcons name="lightning-bolt-outline" size={40} color="rgba(255,255,255,0.1)" />
      </View>
      <Text className="text-xl font-bold text-white text-center mb-2">
        Zero Friction Environment
      </Text>
      <Text className="text-white/30 text-center text-sm leading-relaxed">
        You haven't defined any habits yet. Start with something so small it's impossible to fail.
      </Text>
    </View>
  )
}
