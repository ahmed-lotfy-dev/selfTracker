import { useAuth } from "@/hooks/useAuth"
import { deleteImage, uploadImage } from "@/utils/api/imageApi"
import { updateUser } from "@/utils/api/userApi"
import { useState } from "react"
import { View, Text, TouchableOpacity, Button } from "react-native"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"
import { useUpdate } from "@/hooks/useUpdate"

export default function UploadImageBtn() {
  const { user } = useAuth()

  const [imageFile, setImageFile] =
    useState<ImagePicker.ImagePickerAsset | null>(null)

  const { updateMutation } = useUpdate({
    mutationFn: updateUser,
    onSuccessInvalidate: [{ queryKey: ["userData"] }],
  })

  const pickImageAndUpload = async () => {
    try {
      // Open the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      })

      // If the user cancels the picker, exit early
      if (result.canceled || !result.assets?.length) {
        console.log("Image picker canceled or no image selected.")
        return
      }

      // Store the selected image
      const selectedImage = result.assets[0]
      setImageFile(selectedImage)

      const optimizedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [{ resize: { width: 350 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      )

      console.log("Image selected, starting upload...")

      // Delete the old profile image
      if (user.profileImage) {
        await deleteImage(user.profileImage)
      }
      console.log(optimizedImage)
      // Upload the new image
      const { imageUrl } = await uploadImage(
        optimizedImage,
        imageFile?.fileName ?? "",
        imageFile?.mimeType ?? ""
      )

      // Update the user's profile with the new image URL
      updateMutation.mutate({
        id: user?.id,
        profileImage: imageUrl,
      })

      console.log("Image uploaded successfully.")
    } catch (error) {
      console.error("Error during image selection or upload:", error)
    }
  }

  return (
    <View>
      <TouchableOpacity onPress={pickImageAndUpload}>
        <Text className="bg-gray-700 text-white px-4 py-2 rounded-lg">
          Change Picture
        </Text>
      </TouchableOpacity>
    </View>
  )
}
