import View from "@/components/View"
import Text from "@/components/Text"
import { ActivityIndicator } from "react-native"
import { useQuery } from "@tanstack/react-query"
import { userData } from "@/utils/api/authApi"

export default function UserProfile() {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: userData,
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError || !user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Failed to load user data</Text>
      </View>
    )
  }
  console.log(user)
  return (
    <View className="items-center p-4">
      <Text className="text-2xl font-bold">
        User: {user.user.name ? user.user.name : "No Name"}
      </Text>
      <Text className="text-lg text-gray-500">
        Email: {user.user.email ? user.user.email : "No Email"}
      </Text>
    </View>
  )
}
