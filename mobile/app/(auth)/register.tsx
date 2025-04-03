import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { useRouter } from "expo-router"
import axiosInstance from "@/utils/api/axiosInstane"
import { useAuthActions } from "@/store/useAuthStore"
import { register } from "@/utils/api/authApi"
import { setAccessToken, setRefreshToken } from "@/utils/storage"
import { showAlert } from "@/utils/lib"

export default function Register() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"off" | "submitting" | "submitted">(
    "off"
  )
  const [errorMessage, setErrorMessage] = useState("")
  const { setTokens } = useAuthActions()

  const handleRegister = async () => {
    setStatus("submitting")
    setErrorMessage("")

    if (!name || !email || !password) {
      setErrorMessage("All fields are required")
      setStatus("off")
      return
    }

    try {
      const response = await register(name, email, password)
      const { accessToken, refreshToken } = response

      setTokens(accessToken, refreshToken)

      await setAccessToken(accessToken)
      await setRefreshToken(refreshToken)

      router.replace("/verify-email")

      setStatus("submitted")
    } catch (error: any) {
      console.error("Registration failed:", error)
      setErrorMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      )
      setStatus("off")
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, justifyContent: "center", padding: 20 }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Register
      </Text>

      <Text>Name</Text>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 5,
          borderRadius: 5,
        }}
        editable={status !== "submitting"}
      />

      <Text>Email</Text>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 5,
          borderRadius: 5,
        }}
        editable={status !== "submitting"}
      />

      <Text>Password</Text>
      <TextInput
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 5,
          borderRadius: 5,
        }}
        editable={status !== "submitting"}
      />

      {errorMessage ? (
        <Text style={{ color: "red", marginVertical: 5 }}>{errorMessage}</Text>
      ) : null}

      {/* Register Button */}
      <TouchableOpacity
        onPress={handleRegister}
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
          <Text style={{ color: "white", fontWeight: "bold" }}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => showAlert("Navigate", "Go to login screen")}
        style={{
          marginTop: 15,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "blue" }}>Already have an account? Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}
