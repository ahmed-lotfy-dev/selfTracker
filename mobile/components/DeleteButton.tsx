import { TouchableOpacity, ActivityIndicator } from "react-native"
import FontAwesome from "@expo/vector-icons/FontAwesome"

type DeleteButtonProps = {
  onDelete: () => void
  isLoading?: boolean
  className?: string
}

export default function DeleteButton({
  onDelete,
  isLoading,
  className,
}: DeleteButtonProps) {
  return (
    <TouchableOpacity
      onPress={onDelete}
      disabled={isLoading}
      className={`flex-1 justify-center items-center
       p-3 bg-red-500 rounded-md ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <FontAwesome name="trash-o" size={18} color="white" />
      )}
    </TouchableOpacity>
  )
}
