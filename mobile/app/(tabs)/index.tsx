import { useRouter } from "expo-router"
import { useEffect } from "react"
import { Text, View } from "tamagui"

export default function HomeScreen() {
  const router = useRouter()

  // useEffect(() => {
  //   const isLoggedIn = false

  //   const timeout = setTimeout(() => {
  //     router.replace(isLoggedIn ? "./(tabs)/profile" : "/(auth)/login")
  //   }, 0) // Allows RootLayout to mount first

  //   return () => clearTimeout(timeout) // Cleanup
  // }, [])

  return (
    <View bg={"gray"} flex={1} justify={"center"} items={"center"}>
      <Text marginStart={50} color="black" fontWeight={"bold"}>
        Home
      </Text>
    </View>
  )
}
