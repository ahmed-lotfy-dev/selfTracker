import { TouchableOpacity, ActivityIndicator } from "react-native"
import FontAwesome from "@expo/vector-icons/FontAwesome"

// Defining DeleteButtonProps
type DeleteButtonProps = {
  onDelete: () => void // The onDelete function
  isLoading?: boolean // Optional isLoading flag
}

export default function DeleteButton({
  onDelete,
  isLoading,
}: DeleteButtonProps) {
  return (
    <TouchableOpacity
      onPress={onDelete}
      disabled={isLoading} // Disable button if loading
      className="ml-4 p-2 bg-red-500 rounded-md"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <FontAwesome name="trash-o" size={18} color="white" />
      )}
    </TouchableOpacity>
  )
}
