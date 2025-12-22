import React, { useState } from "react"
import { View, Text } from "react-native"
import { useRouter } from "expo-router"
import { useAuthActions } from "@/src/features/auth/useAuthStore"
import Button from "@/src/components/ui/Button"

type logoutProps = {
  className?: string
}

export default function LogoutButton({ className }: logoutProps) {
  const { logout } = useAuthActions()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await logout()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
      router.replace("/sign-in")
    }
  }

  return (
    <View className={`w-32 m-auto ${className}`} >
      <Button
        onPress={handleLogout}
        loading={isLoading}
        variant="danger"
        fullWidth
      >
        {isLoading ? "Signing out..." : "Sign Out"}
      </Button>

      {error && <Text className="text-error mt-2 text-center">{error}</Text>}
    </View>
  )
}
