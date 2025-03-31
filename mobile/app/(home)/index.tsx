import { View, Text } from "react-native"
import { Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useAuthActions } from "@/store/useAuthStore"
import UserProfile from "@/components/UserProfile"

export default function HomeScreen() {
  const router = useRouter()
  const { logout } = useAuthActions()

  const handleLogout = async () => {
    await logout()
    router.replace("/welcome")
  }

  return (
    <View className="flex-1 justify-center items-center">
      <UserProfile />

      <Pressable
        onPress={handleLogout}
        className="bg-red-500 w-20 rounded-lg p-2 justify-center items-center mt-4"
      >
        <Text className="text-white">Logout</Text>
      </Pressable>
    </View>
  )
}
