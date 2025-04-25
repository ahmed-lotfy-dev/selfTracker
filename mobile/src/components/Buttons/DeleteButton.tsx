import { TouchableOpacity, ActivityIndicator } from "react-native"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { COLORS } from "@/src/constants/Colors"

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
      className={`justify-center items-center
       p-2 rounded-md border border-red-500 ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <FontAwesome name="trash-o" size={20} color="red" />
      )}
    </TouchableOpacity>
  )
}
