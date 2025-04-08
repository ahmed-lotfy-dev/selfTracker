// TODO FORM VALIDAITON WITH TANSTACK FORM
import React, { useState } from "react"
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { login, userData } from "@/utils/api/authApi"
import { useAuthActions } from "@/store/useAuthStore"
import { setAccessToken, setRefreshToken } from "@/utils/storage"
import { useForm } from "@tanstack/react-form"
import { COLORS } from "@/constants/Colors"

export default function Login() {
  const router = useRouter()
  const { setTokens, setUser } = useAuthActions()
  const [status, setStatus] = useState<"off" | "submitting" | "submitted">(
    "off"
  )
  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setStatus("submitting")
      try {
        const response = await login(value.email, value.password)
        const { accessToken, refreshToken } = response

        setTokens(accessToken, refreshToken)
        await setAccessToken(accessToken)
        await setRefreshToken(refreshToken)

        const user = await userData()
        setUser(user.user)

        setStatus("submitted")
        router.replace("/")
      } catch (error: any) {
        console.error("Login failed:", error)
        setErrorMessage(error.response?.data?.message || "Login failed")
        setStatus("off")
      }
    },
  })

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, justifyContent: "center", padding: 20 }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Login Form
      </Text>

      <form.Field
        name="email"
        children={(field) => (
          <TextInput
            value={field.state.value}
            onBlur={field.handleBlur}
            onChangeText={field.handleChange}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              padding: 10,
              marginBottom: 10,
            }}
          />
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <TextInput
            value={field.state.value}
            onBlur={field.handleBlur}
            onChangeText={field.handleChange}
            placeholder="Password"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              padding: 10,
              marginBottom: 10,
            }}
          />
        )}
      />

      {errorMessage ? (
        <Text style={{ color: "red", marginBottom: 10 }}>{errorMessage}</Text>
      ) : null}

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <TouchableOpacity
            onPress={() => form.handleSubmit()}
            disabled={!canSubmit || isSubmitting}
            style={{
              backgroundColor: "#007bff",
              padding: 15,
              borderRadius: 5,
              alignItems: "center",
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={{ color: "white" }}>Login</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </KeyboardAvoidingView>
  )
}
