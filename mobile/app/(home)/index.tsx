import { View, Text } from "react-native"
import { Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useAuthActions } from "@/store/useAuthStore"
import UserProfile from "@/components/UserProfile"
import LogoutButton from "@/components/logoutButton"

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
    </View>
  )
}
