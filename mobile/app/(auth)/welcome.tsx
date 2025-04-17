import { View, Text, Button, Image, Pressable } from "react-native"

import { useRouter } from "expo-router"

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View className="flex-1 justify-center items-center bg-white">
      {/* <Image
        source={require("../assets/welcome.png")}
        style={{ width: 200, height: 200 }}
      /> */}
      <Text className="text-xl font-bold mb-20">Welcome to Self Tracker!</Text>
      <View className="flex-row gap-10 justify-center items-center">
        <Pressable
          onPress={() => router.push("/(auth)/signIn")}
          className="flex-1 justify-center items-center border border-black rounded-lg p-2 ml-5"
        >
          <Text className="text-black font-bold">Login</Text>
        </Pressable>
        <Pressable
          className="flex-1 justify-center items-center border border-black rounded-lg p-2 mr-5"
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text className="text-black font-bold">Register</Text>
        </Pressable>
      </View>
    </View>
  )
}
