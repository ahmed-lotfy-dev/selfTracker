import React, { useState, useRef } from 'react';
import { View, TextInput, Text } from 'react-native';
import { COLORS } from '@/src/constants/Colors';

interface OTPInputProps {
  length?: number;
  onChange: (otp: string) => void;
  error?: string;
}

export default function OTPInput({ length = 6, onChange, error }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Auto-focus next input when typing
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Move to previous input when field becomes empty (backspace or delete)
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0) {
      if (!otp[index]) {
        // If current field is empty, move to previous field
        inputs.current[index - 1]?.focus();
      } else {
        // If current field has text, clear it and move to previous field
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View className="mb-4">
      <View className="flex-row justify-center">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg font-bold bg-white mx-1"
            style={{ color: COLORS.inputText }}
            placeholderTextColor={COLORS.placeholder}
          />
        ))}
      </View>
      {error && <Text className="text-red-500 mt-2 text-center">{error}</Text>}
    </View>
  );
}