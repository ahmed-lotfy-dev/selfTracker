import React from "react"
import { View, Text, Modal, TouchableWithoutFeedback, Pressable, Platform } from "react-native"
import { useAlertStore } from "@/src/features/ui/useAlertStore";
import { useThemeColors } from "@/src/constants/Colors"

export default function CustomAlert() {
  const { isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, hideAlert } =
    useAlertStore()
  const colors = useThemeColors()

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    hideAlert()
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    hideAlert()
  }

  return (
    <Modal transparent visible={isOpen} animationType="fade" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <TouchableWithoutFeedback>
            <View className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl border border-border">

              <Text className="text-xl font-bold text-text mb-2 text-center">
                {title}
              </Text>

              <Text className="text-base text-placeholder text-center mb-8 leading-6">
                {message}
              </Text>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleCancel}
                  className="flex-1 py-3.5 rounded-xl bg-card border border-border items-center justify-center active:bg-border/50"
                >
                  <Text className="font-semibold text-text">{cancelText}</Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirm}
                  className="flex-1 py-3.5 rounded-xl bg-error items-center justify-center active:opacity-90 shadow-sm"
                >
                  <Text className="font-bold text-white">{confirmText}</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
