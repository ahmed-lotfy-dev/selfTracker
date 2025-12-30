
import { useState } from "react"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { useAuthActions } from "@/src/features/auth/useAuthStore"
import { updateUser } from "@/src/lib/api/userApi"
import { deleteImage, uploadImage } from "@/src/lib/api/imageApi"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"

export function useProfileImage() {
  const { user } = useAuth()
  const { setUser } = useAuthActions()
  const [isUploading, setIsUploading] = useState(false)

  const pickAndUploadImage = async (onSuccess?: () => void) => {
    try {
      // 1. Pick Image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      })

      if (result.canceled || !result.assets?.length) {
        return
      }

      setIsUploading(true)
      const selectedImage = result.assets[0]

      // 2. Compress/Optimize
      const optimizedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [{ resize: { width: 350 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      )

      // 3. Delete old image if exists
      if (user?.image) {
        await deleteImage(user.image)
      }

      // 4. Upload new image
      const uploadResult = await uploadImage(
        optimizedImage,
        selectedImage.fileName ?? "profile.jpg",
        selectedImage.mimeType ?? "image/jpeg"
      )

      const imageUrl = uploadResult.imageUrl;

      if (!imageUrl) {
        throw new Error("Upload failed: No URL returned")
      }

      // 5. Update user profile
      await updateUser({ id: user?.id!, image: imageUrl })

      setUser({ ...user, image: imageUrl })
      setIsUploading(false)
      if (onSuccess) onSuccess()

    } catch (error) {
      console.error("Error in profile image upload flow:", error)
      setIsUploading(false)
    }
  }

  return {
    pickAndUploadImage,
    isUploading,
  }
}
