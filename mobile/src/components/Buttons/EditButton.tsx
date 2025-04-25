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
      className={`justify-center items-center p-2 rounded-md border border-green-500 ${className}`}
    >
      <FontAwesome name="pencil" size={18} color="green" />
    </TouchableOpacity>
  )
}
