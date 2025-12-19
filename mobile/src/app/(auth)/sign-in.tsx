import React, { useState } from "react"
import {
  Text,
  TextInput,
  Pressable,
  Platform,
  View,
} from "react-native"
import { Link, useRouter } from "expo-router"
import { useAuthActions } from "@/src/store/useAuthStore"
import { COLORS } from "@/src/constants/Colors"
import { signIn } from "@/src/lib/api/authApi"
import { setAccessToken } from "@/src/lib/storage"
import { signInSchema } from "@/src/types/userType"
import { z } from "zod"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import { SocialLoginButtons } from "@/src/components/Auth/SocialLoginButtons"

export default function SignIn() {
  const router = useRouter()
  const { setUser } = useAuthActions()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Reset errors
    setEmailError("")
    setPasswordError("")
    setFormError("")

    const parsed = signInSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      if (fieldErrors.email) setEmailError(fieldErrors.email[0])
      if (fieldErrors.password) setPasswordError(fieldErrors.password[0])
      return
    }

    setIsSubmitting(true)

    try {
      const response = await signIn(email, password)

      if (response.error) {
        setFormError(response.error.message || "Login failed")
      } else if (response.data) {
        await setAccessToken(response.data.token)
        setUser(response.data.user)
        router.replace("/home")
      }
    } catch (err) {
      setFormError("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, justifyContent: "center", padding: 20 }}
    >
      <Text className="font-bold text-xl mb-4">Sign In</Text>

      {/* Social Login Buttons - shown first */}
      <SocialLoginButtons />

      {/* Divider */}
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500 text-sm">Or continue with</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Email Input */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        placeholderTextColor={COLORS.inputText}
        className="border border-gray-300 rounded-md px-4 py-2 mb-1"
      />
      {emailError ? (
        <Text className="text-red-500 mb-2">{emailError}</Text>
      ) : null}

      {/* Password Input */}
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        placeholderTextColor={COLORS.inputText}
        className="border border-gray-300 rounded-md px-4 py-2 mb-1 color-inputText"
      />
      {passwordError ? (
        <Text className="text-red-500 mb-2">{passwordError}</Text>
      ) : null}

      {/* Form Error */}
      {formError ? (
        <Text className="text-red-500 mb-3">{formError}</Text>
      ) : null}

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        className={`p-4 rounded-md items-center ${isSubmitting ? "bg-blue-300" : "bg-[#007bff]"
          }`}
      >
        {isSubmitting ? (
          <ActivitySpinner color={COLORS.primary} />
        ) : (
          <Text style={{ color: "white" }}>Login</Text>
        )}
      </Pressable>

      {/* Link to Sign Up */}
      <Link href="/sign-up" asChild>
        <Pressable className="justify-center items-center rounded-lg p-2 mr-5 mt-4">
          <Text className="text-blue-500">Don't have an account? Sign Up</Text>
        </Pressable>
      </Link>
    </KeyboardAvoidingView>
  )
}
