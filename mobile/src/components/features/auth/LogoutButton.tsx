import React, { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useAuthActions } from "@/src/features/auth/useAuthStore"
import { MaterialIcons } from "@expo/vector-icons"
import { PremiumCard } from "@/src/components/ui/PremiumCard"

export default function LogoutButton({ className }: { className?: string }) {
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
    <View className={`w-full px-4 ${className}`} >
      <PremiumCard 
        onPress={handleLogout}
        gradientColors={['#450a0a', '#7f1d1d']}
        containerStyle="h-14 justify-center border-red-900/10"
      >
        <View className="flex-row items-center justify-center">
          <MaterialIcons name="logout" size={18} color="white" />
          <Text className="text-white text-sm font-black uppercase tracking-[2px] ml-3">
            {isLoading ? "Synchronizing Out..." : "Sign Out"}
          </Text>
        </View>
      </PremiumCard>

      {error && (
        <View className="mt-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
          <Text className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest leading-4">{error}</Text>
        </View>
      )}
    </View>
  )
}
