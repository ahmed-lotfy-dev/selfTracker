import { logout } from "@/utils/api/authApi"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import Text from "@/components/Text"
import View from "@/components/View"
import { Pressable } from "react-native"

export default function LogoutButton({}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken")
      console.log({ refreshToken })

      if (!refreshToken) {
        throw new Error("No refresh token found!")
      }
      const response = logout(refreshToken)

      await AsyncStorage.multiRemove(["accessToken", "refreshToken"])

      router.replace("/")
    } catch (error: any) {
      console.error("Logout failed:", error.message)
      setError(error.message || "Logout failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <View className="felx-1 justify-center items-center bg-gray-500">
      <Pressable
        onPress={handleLogout}
        className="bg-red-500 text-white p-4 rounded-md mt-10"
        disabled={isLoading}
      >
        {isLoading ? "Logging out..." : "Logout"}
      </Pressable>

      {error && <Text className="text-red-500 mt-10">{error}</Text>}
    </View>
  )
}
