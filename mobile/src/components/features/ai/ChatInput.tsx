import React from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'

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
  const canSend = value.trim().length > 0 && !loading && !disabled

  return (
    <View className="flex-row items-center gap-2 px-4 py-3 border-t border-white/10 bg-background">
      <View className="flex-1 rounded-2xl bg-card border border-white/10 px-4 py-2">
        <TextInput
          className="text-text text-sm leading-5 max-h-24"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          multiline
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={canSend ? onSend : undefined}
          blurOnSubmit
        />
      </View>

      <Pressable
        onPress={onSend}
        disabled={!canSend}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          canSend ? 'bg-primary' : 'bg-white/10'
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className={`text-lg ${canSend ? 'text-white' : 'text-gray-500'}`}>
            ↑
          </Text>
        )}
      </Pressable>
    </View>
  )
}
