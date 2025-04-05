import { Pressable, View, Text } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { logout } from "@/utils/api/authApi"
import axios from "axios"

type logoutProps = {
  className?: string
}
export default function LogoutButton({ className }: logoutProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken")

      if (!refreshToken) {
        throw new Error("No refresh token found!")
      }
      const response = logout(refreshToken)

      await AsyncStorage.multiRemove(["accessToken", "refreshToken"])

      router.replace("/welcome") 
    } catch (error: any) {
      console.error("Logout failed:", error.message)
      setError(error.message || "Logout failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <View className={`felx-1 justify-center items-center ${className}`}>
      <Pressable
        onPress={handleLogout}
        className="bg-red-500 w-36 rounded-lg p-2 justify-center items-center mt-4"
      >
        <Text className="text-white font-bold">Logout</Text>
      </Pressable>

      {error && <Text className="text-red-500 mt-10">{error}</Text>}
    </View>
  )
}
