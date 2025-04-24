import { useRouter } from "expo-router"
import { View, Text, TouchableOpacity } from "react-native"

interface CardProps {
  title: string
  route: string
}

export default function Card({
  title,
  route,
}: CardProps) {
  const router = useRouter()
  const handlePress = () => {
    // router.push(`${title}`)
  }
  return (
    <View className="bg-white shadow-md rounded-lg p-4">
      <TouchableOpacity onPress={handlePress}>
        <Text className="text-lg font-semibold">{title}</Text>
      </TouchableOpacity>
    </View>
  )
}
