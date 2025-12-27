import React, { useState } from "react"
import {
  View,
  Text,
  Pressable,
  Platform,
} from "react-native"
import { Link, useRouter, Redirect } from "expo-router"
import { useAuthStore, useAuth } from "@/src/features/auth/useAuthStore"
import { signUp } from "@/src/lib/api/authApi"
import * as SecureStore from "expo-secure-store"
import { signUpSchema } from "@/src/types/userType"
import { KeyboardAwareScrollView } from "react-native-keyboard-controller"

import { SocialLoginButtons } from "@/src/components/features/auth/SocialLoginButtons"
import Input from "@/src/components/ui/Input"
import Button from "@/src/components/ui/Button"

export default function SignUp() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

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
      }
    } catch (err) {
      setFormError("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Redirect to verify-email if authenticated but not verified (after signup)
  if (isAuthenticated && !user?.emailVerified) {
    return <Redirect href="/verify-email" />
  }

  // Redirect to home if already fully authenticated
  if (isAuthenticated && user?.emailVerified) {
    return <Redirect href="/home" />
  }

  return (
    <KeyboardAwareScrollView
      bottomOffset={62}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      className="bg-background"
    >
      <View className="mb-8">
        <Text className="font-bold text-3xl text-text mb-2">Create Account</Text>
        <Text className="text-placeholder font-medium">Join us and start tracking your journey</Text>
      </View>

      {/* Social Login Buttons - shown first */}
      <SocialLoginButtons />

      {/* Divider */}
      <View className="flex-row items-center my-8">
        <View className="flex-1 h-px bg-border" />
        <Text className="mx-4 text-placeholder text-sm font-medium">Or sign up with email</Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      <Input
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Full Name"
        autoCapitalize="words"
        autoComplete="name"
        error={nameError}
      />

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

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Create a strong password"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        error={passwordError}
      />

      {formError ? (
        <Text className="text-error mb-4 font-medium text-center">{formError}</Text>
      ) : null}

      <Button
        onPress={handleSubmit}
        loading={isSubmitting}
        size="lg"
        className="mt-2"
      >
        Create Account
      </Button>

      <View className="flex-row justify-center mt-6">
        <Text className="text-placeholder">Already have an account? </Text>
        <Link href="/sign-in" asChild>
          <Text className="text-primary font-bold">Sign In</Text>
        </Link>
      </View>
    </KeyboardAwareScrollView>
  )
}
