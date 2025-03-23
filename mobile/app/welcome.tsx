import { Button, Image, Pressable } from "react-native"
import View from "@/components/View"
import Text from "@/components/Text"

import { useRouter } from "expo-router"

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View className="flex-1 justify-center items-center bg-white">
      {/* <Image
        source={require("../assets/welcome.png")} // Replace with your image
        style={{ width: 200, height: 200 }}
      /> */}
      <Text className="text-xl font-bold mb-20">Welcome to Self Tracker!</Text>
      <View className="flex-row gap-10">
        <Pressable onPress={() => router.push("/login")} className="flex-1">
          <Text className="text-black font-bold">Login</Text>
        </Pressable>
        <Pressable
          className="flex-1 "
          onPress={() => router.push("/register")}
        >
          <Text className="text-black font-bold">Register</Text>
        </Pressable>
      </View>
    </View>
  )
}
