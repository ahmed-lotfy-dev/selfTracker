import React, { useState } from "react"
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { useRouter } from "expo-router"
import axios from "axios"
import { UserType } from "@/types/userType"
import { login } from "@/utils/api/authApi"
import { useAuthActions } from "@/store/useAuthStore"
import { setAccessToken, setRefreshToken } from "@/utils/storage"

export default function Login() {
  const router = useRouter()
  const { setTokens } = useAuthActions()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"off" | "submitting" | "submitted">(
    "off"
  )
  const [errorMessage, setErrorMessage] = useState("")

  const handleLogin = async () => {
    setStatus("submitting")
    try {
      const response = await login(email, password)
      const { accessToken, refreshToken } = response

      setTokens(accessToken, refreshToken)

      await setAccessToken(accessToken)
      await setRefreshToken(refreshToken)

      setStatus("submitted")

      router.replace("/")
    } catch (error: any) {
      console.error("Login failed:", error)
      setErrorMessage(error.response?.data?.message || "Login failed")
      setStatus("off")
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, justifyContent: "center", padding: 20 }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Login Form
      </Text>

      <Text>Email</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 5,
          borderRadius: 5,
        }}
      />

      <Text>Password</Text>
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 5,
          borderRadius: 5,
        }}
      />

      {errorMessage ? (
        <Text style={{ color: "red", marginVertical: 5 }}>{errorMessage}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleLogin}
        disabled={status === "submitting"}
        style={{
          backgroundColor: "blue",
          padding: 15,
          borderRadius: 5,
          alignItems: "center",
          marginTop: 10,
          opacity: status === "submitting" ? 0.5 : 1,
        }}
      >
        {status === "submitting" ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "bold" }}>Login</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}
