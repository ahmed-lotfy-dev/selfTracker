import { Pressable, View, Text } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { clearTokens } from "@/src/utils/storage"
import { useAuthActions } from "@/src/store/useAuthStore"
import { authClient } from "@/src/utils/auth-client"
import { useAuth } from "../../hooks/useAuth"

type logoutProps = {
  className?: string
}
export default function LogoutButton({ className }: logoutProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await clearTokens()
      await authClient.signOut()
      await logout()
      router.replace("/welcome")
    } catch (e: any) {
      setError(e.message)
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
