import { TouchableOpacity, ActivityIndicator } from "react-native"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { COLORS } from "@/constants/Colors"

type DeleteButtonProps = {
  onPress?: () => void
  isLoading?: boolean
  className?: string
}

export default function DeleteButton({
  onPress,
  isLoading,
  className,
}: DeleteButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      className={`flex-1 justify-center items-center
       p-2 bg-red-500 rounded-md ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <FontAwesome name="trash-o" size={18} color="white" />
      )}
    </TouchableOpacity>
  )
}
