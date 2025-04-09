import { Link, Stack } from "expo-router"
import { StyleSheet } from "react-native"

import { Text, View } from "react-native"
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 justify-center items-center p-5">
        <Text className="font-bold text-2xl">This screen doesn't exist.</Text>
        <Link href="/">
          <Text className="mt-4 py-4 bg-[#2e78b7]">Go to home screen!</Text>
        </Link>
      </View>
    </>
  )
}
