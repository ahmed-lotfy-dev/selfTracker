import { View, Text } from "react-native"
import { Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useAuthActions } from "@/store/useAuthStore"
import UserProfile from "@/components/UserProfile"
import LogoutButton from "@/components/logoutButton"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import Drawer from "expo-router/drawer"

export default function HomeScreen() {
  const router = useRouter()
  const { logout } = useAuthActions()

  const handleLogout = async () => {
    await logout()
    router.replace("/welcome")
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="font-bold text-xl">HomePage</Text>
    </View>
  )
}
