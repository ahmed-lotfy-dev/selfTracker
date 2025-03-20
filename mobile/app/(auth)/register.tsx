import React, { useState } from "react"
import { View, Text, Form, Input, Button, Spinner } from "tamagui"
import { useRouter } from "expo-router"
import axiosInstance from "@/utils/api/axiosInstane"
import { useAuthActions } from "@/store/useAuthStore"
import { register } from "@/utils/api/auth"
import { setAccessToken, setRefreshToken } from "@/utils/storage"

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
    <View height={"100%"} flex={1} justify={"space-between"} items={"center"}>
      <Text paddingBlockStart={30}>Register Form</Text>
      <Form flex={1} paddingBlockStart={30} onSubmit={handleRegister}>
        <Text>Name</Text>
        <Input
          width={"100%"}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          disabled={status === "submitting"}
        />

        <Text>Email</Text>
        <Input
          width={"100%"}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          disabled={status === "submitting"}
        />

        <Text>Password</Text>
        <Input
          width={"100%"}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          disabled={status === "submitting"}
        />

        {errorMessage ? <Text color="red">{errorMessage}</Text> : null}

        <Form.Trigger asChild>
          <Button
            icon={status === "submitting" ? () => <Spinner /> : undefined}
            disabled={status === "submitting"}
          >
            Register
          </Button>
        </Form.Trigger>

        <Button onPress={() => router.push("/login")} marginBlockStart={20}>
          Already have an account? Login
        </Button>
      </Form>
    </View>
  )
}
