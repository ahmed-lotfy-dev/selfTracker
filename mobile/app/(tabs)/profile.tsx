import { Button, Text, View } from "tamagui"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axiosInstance from "@/utils/api"
import { getToken } from "@/utils/lib"

export default function Profile() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const accessToken = await getToken("accessToken")
      axiosInstance.post(
        "/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      await AsyncStorage.multiRemove(["accessToken", "refreshToken"])
      router.replace("/") // Redirect to login screen
    } catch (error: any) {
      console.error("Logout failed:", error.message)
    }
  }

  return (
    <View bg={"gray"} flex={1} justify={"center"} items={"center"}>
      <Text marginStart={50} color="black" fontWeight="bold">
        Profile
      </Text>
      <Button onPress={handleLogout} marginBlockStart={20}>
        Logout
      </Button>
    </View>
  )
}
