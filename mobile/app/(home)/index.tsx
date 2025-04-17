import { View, Text } from "react-native"
import { Pressable } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import Drawer from "expo-router/drawer"

export default function HomeScreen() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="font-bold text-xl">HomePage</Text>
    </View>
  )
}
