import React, { useState } from "react"
import {
  Text,
  View,
  Platform,
} from "react-native"
import { Link, useRouter, Redirect } from "expo-router"
import { useAuthStore } from "@/src/features/auth/useAuthStore"
import { signIn } from "@/src/lib/api/authApi"
import * as SecureStore from "expo-secure-store"
import { signInSchema } from "@/src/types/userType"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import { SocialLoginButtons } from "@/src/components/features/auth/SocialLoginButtons"
import Input from "@/src/components/ui/Input"
import Button from "@/src/components/ui/Button"
import { useAuth } from "@/src/features/auth/useAuthStore"

export default function SignIn() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

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
        return
      }

      // Success case: We already have user and token from the API!
      if (response.data?.token && response.data?.user) {

        // Save token to SecureStore
        await SecureStore.setItemAsync("selftracker.better-auth.session_token", response.data.token)
        await SecureStore.setItemAsync("selftracker.session_token", response.data.token)

        // Update store with user and token
        const { setUser, setToken, setIsLoading } = useAuthStore.getState()
        setUser(response.data.user)
        setToken(response.data.token)
        setIsLoading(false)

      } else {
        setFormError("No authentication data received")
      }
    } catch (err) {
      console.error('[SIGN-IN] Exception:', err)
      setFormError("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }


  // Redirect to home if already authenticated and verified
  if (isAuthenticated && user?.emailVerified) {
    return <Redirect href="/home" />
  }

  // Redirect to verify-email if authenticated but not verified
  if (isAuthenticated && !user?.emailVerified) {
    return <Redirect href="/verify-email" />
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, justifyContent: "center", padding: 24 }}
      className="bg-background"
    >
      <View className="mb-8">
        <Text className="font-bold text-3xl text-text mb-2">Welcome Back</Text>
        <Text className="text-placeholder font-medium">Sign in to continue your journey</Text>
      </View>

      {/* Social Login Buttons - shown first */}
      <SocialLoginButtons />

      {/* Divider */}
      <View className="flex-row items-center my-8">
        <View className="flex-1 h-px bg-border" />
        <Text className="mx-4 text-placeholder text-sm font-medium">Or continue with email</Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      {/* Email Input */}
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="hello@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        error={emailError}
      />

      {/* Password Input */}
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        error={passwordError}
      />

      {/* Form Error */}
      {formError ? (
        <Text className="text-error mb-4 font-medium text-center">{formError}</Text>
      ) : null}

      {/* Submit Button */}
      <Button
        onPress={handleSubmit}
        loading={isSubmitting}
        size="lg"
        className="mt-2"
      >
        Sign In
      </Button>

      {/* Link to Sign Up */}
      <View className="flex-row justify-center mt-6">
        <Text className="text-placeholder">Don't have an account? </Text>
        <Link href="/sign-up" asChild>
          <Text className="text-primary font-bold">Sign Up</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  )
}
