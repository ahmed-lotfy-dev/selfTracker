import React from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated'

interface ChatInputProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  loading?: boolean
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  loading = false,
  disabled = false,
  placeholder = 'Ask about your data...',
}: ChatInputProps) {
  const canSend = value.trim().length > 0 && !disabled
  const sendScale = useSharedValue(1)
  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }))

  return (
    <View className="flex-row items-center gap-2 px-4 py-3 border-t border-border bg-background">
      <View className="flex-1 rounded-2xl bg-card border border-border px-4 py-2">
        <TextInput
          className="text-text text-sm leading-5 max-h-24"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="var(--color-placeholder)"
          multiline
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={canSend ? onSend : undefined}
          blurOnSubmit
        />
      </View>

      <Animated.View style={sendStyle}>
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          onPressIn={() => { if (canSend) sendScale.value = withSpring(0.85) }}
          onPressOut={() => { sendScale.value = withSpring(1) }}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            canSend ? 'bg-primary' : 'bg-border'
          }`}
        >
          {loading && !canSend ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className={`text-lg ${canSend ? 'text-white' : 'text-text-muted'}`}>
              ↑
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  )
}
