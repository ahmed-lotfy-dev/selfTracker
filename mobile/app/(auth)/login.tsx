import axiosInstance from "@/utils/api"
import { setToken } from "@/utils/lib"
import React, { useState } from "react"
import { Form, Input, Text, View, Button, Spinner } from "tamagui"
import { useRouter } from "expo-router"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"off" | "submitting" | "submitted">(
    "off"
  )
  const [errorMessage, setErrorMessage] = useState("")

  const handleLogin = async () => {
    setStatus("submitting")

    try {
      const { data: tokens } = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      })
      console.log(tokens)
      setStatus("submitted")
      setToken("accessToken", tokens.accessToken)
      setToken("refreshToken", tokens.refreshToken)
      const {data:user} = axiosInstance.get("/api/users/me")
      router.replace("/")
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Login failed")
      setStatus("off")
    }
  }

  return (
    <View height={"100%"} flex={1} justify={"space-between"} items={"center"}>
      <Text paddingBlockStart={30}>Login Form</Text>
      <Form flex={1} paddingBlockStart={30} onSubmit={handleLogin}>
        <Text>Email</Text>
        <Input placeholder="Email" value={email} onChangeText={setEmail} />
        <Text>Password</Text>
        <Input
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        {errorMessage ? <Text color="red">{errorMessage}</Text> : null}

        <Form.Trigger asChild>
          <Button
            icon={status === "submitting" ? () => <Spinner /> : undefined}
          >
            Login
          </Button>
        </Form.Trigger>
      </Form>
    </View>
  )
}
