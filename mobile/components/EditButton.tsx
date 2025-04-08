import { TouchableOpacity, TouchableOpacityProps } from "react-native"
import FontAwesome from "@expo/vector-icons/FontAwesome"

interface EditButtonProps extends TouchableOpacityProps {
  onPress?: () => void
  className?: string
}

export default function EditButton({ className, onPress }: EditButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 justify-center items-center p-2 rounded-md bg-green-900 ${className}`}
    >
      <FontAwesome name="pencil" size={20} color="white" />
    </TouchableOpacity>
  )
}
