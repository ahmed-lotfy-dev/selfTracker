// TODO FORM VALIDAITON WITH TANSTACK FORM
import React, { useState } from "react"
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
  Pressable,
} from "react-native"
import { Link, useRouter } from "expo-router"
import { useAuthActions } from "@/store/useAuthStore"
import { useForm } from "@tanstack/react-form"
import { COLORS } from "@/constants/Colors"
import { authClient } from "@/utils/auth-client"
import { signIn } from "@/utils/api/authApi"
import { setAccessToken } from "@/utils/storage"
// import GoogleSignInBtn from "@/components/GoogleSignInBtn"

export default function SignIn() {
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState("")
  const { setUser } = useAuthActions()

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      console.log({ email: value.email, password: value.password })
      const response = await signIn(value.email, value.password)

      console.log({ response })
      if (response.error) {
        setErrorMessage(response.error.message || "")
      }
      if (response.data) {
        await setAccessToken(response.data.token)
        setUser(response.data.user)
        router.replace("/(home)")
      }
    },
  })

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, justifyContent: "center", padding: 20 }}
    >
      <Text className="font-bold text-xl mb-4">Sign In</Text>

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
            className="border border-gray-300 rounded-md px-4 py-2 mb-3"
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
            className="border border-gray-300 rounded-md px-4 py-2 mb-3"
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
            // disabled={!canSubmit || isSubmitting}
            className="bg-[#007bff] p-4 rounded-md items-center font-bold text-xl"
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={{ color: "white" }}>Login</Text>
            )}
          </TouchableOpacity>
        )}
      />
      <Link href="/sign-up" asChild>
        <Pressable className="justify-center items-center  rounded-lg p-2 mr-5 mt-4">
          <Text className="text-blue-500 ">Don't have an account? Sign Up</Text>
        </Pressable>
      </Link>
    </KeyboardAvoidingView>
  )
}
