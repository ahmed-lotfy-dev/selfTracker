import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Text, View, Button } from "tamagui"
import { getAllUsers, getToken, setToken } from "@/utils/lib"
import axiosInstance from "@/utils/api"

export default function HomeScreen() {
  const router = useRouter()
  const [firstRun, setFirstRun] = useState<boolean | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  console.log(accessToken)
  useEffect(() => {
    const checkAppState = async () => {
      try {
        const users = await getAllUsers()
        console.log(users)
        const firstRunCheck = await AsyncStorage.getItem("firstRun")
        if (firstRunCheck === null) {
          await AsyncStorage.setItem("firstRun", "false") // Set first-run flag
          setFirstRun(true) // Show welcome screen
          return
        }
        setFirstRun(false) // Normal auth check

        const token = await getToken("accessToken")
        setAccessToken(token!)
        router.replace(token ? "/" : "/login")
      } catch (error) {
        console.error("Error checking app state:", error)
      }
    }

    checkAppState()
  }, [])

  // ✅ Show Welcome Screen for First-Time Users
  if (firstRun === true) {
    return (
      <View flex={1} justify="center" items="center" bg="white">
        <Text fontSize={20} fontWeight="bold">
          Welcome to SelfTracker!
        </Text>
        <Button onPress={() => router.push("/(auth)/login")}>Login</Button>
        <Button onPress={() => router.push("/(auth)/register")}>
          Register
        </Button>
      </View>
    )
  }

  // ✅ If checking state, show nothing (avoiding flickering)
  if (firstRun === null) {
    return null
  }

  return (
    <View flex={1} justify="center" items="center" bg="gray">
      <Text fontSize={20} fontWeight="bold">
        Home
      </Text>
    </View>
  )
}
