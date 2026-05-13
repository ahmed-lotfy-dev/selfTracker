import React from "react"
import { View, Text, Pressable, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

interface FoodImagePickerProps {
  imageUri: string | null
  onTakePhoto: () => void
  onPickImage: () => void
  onClearImage: () => void
}

export default function FoodImagePicker({ 
  imageUri, 
  onTakePhoto, 
  onPickImage, 
  onClearImage 
}: FoodImagePickerProps) {
  const colors = useThemeColors()

  if (imageUri) {
    return (
      <View className="mb-4">
        <Image
          source={{ uri: imageUri }}
          className="w-full h-64 rounded-xl"
          resizeMode="cover"
        />
        <Pressable
          onPress={onClearImage}
          className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <Ionicons name="close" size={20} color="white" />
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-row gap-4 mb-6">
      <Pressable
        onPress={onTakePhoto}
        className="flex-1 items-center justify-center p-8 rounded-xl border-2 border-dashed"
        style={{ borderColor: colors.primary }}
      >
        <Ionicons name="camera" size={48} color={colors.primary} />
        <Text className="mt-2 text-sm font-medium" style={{ color: colors.text }}>Take Photo</Text>
      </Pressable>
      
      <Pressable
        onPress={onPickImage}
        className="flex-1 items-center justify-center p-8 rounded-xl border-2 border-dashed"
        style={{ borderColor: colors.primary }}
      >
        <Ionicons name="images" size={48} color={colors.primary} />
        <Text className="mt-2 text-sm font-medium" style={{ color: colors.text }}>Gallery</Text>
      </Pressable>
    </View>
  )
}
