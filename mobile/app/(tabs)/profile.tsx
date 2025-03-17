import { Button, Text, View } from "tamagui"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useState } from "react" // For loading state
import axios from "axios"

export default function Profile() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    console.log("Logout clicked")
    setIsLoading(true)
    setError(null)

    try {
      // Retrieve the refresh token
      const refreshToken = await AsyncStorage.getItem("refreshToken")
      console.log({ refreshToken })

      if (!refreshToken) {
        throw new Error("No refresh token found!")
      }

      // Make the logout request using axiosInstance
      const response = await axios.post(
        `${
          process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://selftracker.ahmedlotfy.dev"
        }/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`, // Override the default Authorization header
          },
        }
      )

      console.log("Logout response:", response.data)

      // Remove tokens from AsyncStorage
      await AsyncStorage.multiRemove(["accessToken", "refreshToken"])

      // Redirect to the login screen
      router.replace("/")
    } catch (error: any) {
      console.error("Logout failed:", error.message)
      setError(error.message || "Logout failed. Please try again.")
    } finally {
      setIsLoading(false) // Stop loading
    }
  }
  return (
    <View bg={"gray"} flex={1} justify={"center"} items={"center"}>
      <Text marginStart={50} color="black" fontWeight="bold">
        Profile
      </Text>

      <Button
        onPress={handleLogout}
        marginBlockStart={20}
        disabled={isLoading} // Disable button during loading
      >
        {isLoading ? "Logging out..." : "Logout"}
      </Button>

      {error && (
        <Text color="red" marginBlockStart={10}>
          {error}
        </Text>
      )}
    </View>
  )
}
