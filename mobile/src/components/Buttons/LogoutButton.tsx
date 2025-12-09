import { Pressable, View, Text } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { clearTokens } from "@/src/lib/storage"
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
      await logout()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
      router.replace("/(auth)/sign-in")
    }
  }

  return (
    <View className={`flex-1 ${className} w-32 m-auto`} >
      <Pressable
        onPress={handleLogout}
        disabled={isLoading}
        className={`${
          isLoading ? "bg-gray-300" : "bg-red-600"
        } rounded-2xl py-2 items-center active:bg-red-700`}
      >
        <Text className="text-white font-bold text-lg">
          {isLoading ? "Logging out..." : "Logout"}
        </Text>
      </Pressable>

      {error && <Text className="text-red-500 mt-2 text-center">{error}</Text>}
    </View>
  )
}
