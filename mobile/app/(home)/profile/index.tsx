import UserProfile from "@/components/UserProfile"
import { Text, View } from "react-native"

export default function index() {
  return (
    <View className="flex-1 justify-center items-center">
      <UserProfile />
    </View>
  )
}
