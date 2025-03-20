import React, { useState } from "react"
import { Form, Input, Text, View, Button, Spinner } from "tamagui"
import { useRouter } from "expo-router"
import axios from "axios"
import { UserType } from "@/types/userType"
import { login } from "@/utils/api/auth"
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
    <View height={"100%"} flex={1} justify={"space-between"} items={"center"}>
      <Text paddingBlockStart={30}>Login Form</Text>
      <Form flex={1} paddingBlockStart={30} onSubmit={handleLogin}>
        <Text>Email</Text>
        <Input
          width={"100%"}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
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
        />

        {errorMessage ? <Text color="red">{errorMessage}</Text> : null}

        <Form.Trigger asChild>
          <Button
            icon={status === "submitting" ? () => <Spinner /> : undefined}
            disabled={status === "submitting"}
          >
            Login
          </Button>
        </Form.Trigger>
      </Form>
    </View>
  )
}
