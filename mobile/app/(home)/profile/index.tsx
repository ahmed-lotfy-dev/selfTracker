import UserProfile from "@/components/UserProfile"
import { useUser } from "@/store/useAuthStore"
import { Text, View } from "react-native"

export default function index() {
  const user = useUser()
  console.log({ user })
  return (
    <View className="flex-1 justify-center items-center">
      <UserProfile />
      <View></View>
    </View>
  )
}
