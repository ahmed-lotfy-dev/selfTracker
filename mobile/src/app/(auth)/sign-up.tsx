import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
} from "react-native"
import { Link, useRouter } from "expo-router"
import { COLORS } from "@/src/constants/Colors"
import { setAccessToken } from "@/src/lib/storage"
import { useAuthActions } from "@/src/store/useAuthStore"
import { signUp } from "@/src/lib/api/authApi"
import { signUpSchema } from "@/src/types/userType"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import { SocialLoginButtons } from "@/src/components/Auth/SocialLoginButtons"

export default function SignUp() {
  const router = useRouter()
  const { setUser } = useAuthActions()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setNameError("")
    setEmailError("")
    setPasswordError("")
    setFormError("")

    const result = signUpSchema.safeParse({ name, email, password })

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      if (errors.name) setNameError(errors.name[0])
      if (errors.email) setEmailError(errors.email[0])
      if (errors.password) setPasswordError(errors.password[0])
      return
    }

    setIsSubmitting(true)

    try {
      const response = await signUp(name, email, password)

      if (response.error) {
        setFormError(response.error.message || "Signup failed")
      } else if (response.data) {
        setUser(response.data.token)
        router.replace("/(auth)/verify-email")
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
      <Text className="font-bold text-xl mb-4">Sign Up</Text>

      {/* Social Login Buttons - shown first */}
      <SocialLoginButtons />

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        autoCapitalize="words"
        autoComplete="name"
        placeholderTextColor={COLORS.inputText}
        className="border border-gray-300 rounded-md px-4 py-2 mb-1"
      />
      {nameError ? (
        <Text className="text-red-500 mb-2">{nameError}</Text>
      ) : null}

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

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        placeholderTextColor={COLORS.inputText}
        className="border border-gray-300 rounded-md px-4 py-2 mb-1"
      />
      {passwordError ? (
        <Text className="text-red-500 mb-2">{passwordError}</Text>
      ) : null}

      {formError ? (
        <Text className="text-red-500 mb-3">{formError}</Text>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        className={`p-4 rounded-md items-center ${isSubmitting ? "bg-blue-200" : "bg-[#007bff]"
          }`}
      >
        {isSubmitting ? (
          <ActivitySpinner color={COLORS.primary} />
        ) : (
          <Text style={{ color: "white" }}>Sign Up</Text>
        )}
      </Pressable>

      <Link href="/sign-in" asChild>
        <Pressable className="justify-center items-center rounded-lg p-2 mr-5 mt-4">
          <Text className="text-blue-500">
            Already have an account? Sign In
          </Text>
        </Pressable>
      </Link>
    </KeyboardAvoidingView>
  )
}
