// TODO revert back to safe area view when they fix it expo SDK 53
import { ReactNode, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { KeyboardProvider } from "react-native-keyboard-controller"

import { Colors } from "@/src/constants/Colors"
import { useColorScheme, View } from "react-native"
import { ToastProvider } from "@/src/hooks/useToast"
import { ElectricWrapper } from "./ElectricWrapper"
import { useUser } from "@/src/store/useAuthStore"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Uniwind } from 'uniwind'

interface AppProvidersProps {
  children: ReactNode
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 5,
      networkMode: "offlineFirst",
      retry: false,
      refetchOnReconnect: true,
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: false,
    },
  },
})

export function AppProviders({ children }: AppProvidersProps) {
  const systemScheme = useColorScheme()
  const user = useUser()

  useEffect(() => {
    // Only update theme if we have a user preference or default to system
    // Uniwind handles "system", "dark", "light" strings correctly
    const desiredTheme = user?.theme ?? 'system'
    Uniwind.setTheme(desiredTheme)
  }, [user?.theme])

  // We rely on Uniwind to handle the 'dark' variant propagation
  // The systemScheme hook might still be useful for fallback colors if needed
  // but for the most part, Uniwind + Tailwind classes handle it.

  // However, SafeAreaView background color needs to be reactive.
  // We can calculate the *expected* active theme to set the background color properly
  const activeTheme = (user?.theme === 'system' || !user?.theme)
    ? (systemScheme ?? 'light')
    : user?.theme

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ElectricWrapper>
            <KeyboardProvider>
              <SafeAreaView
                edges={["top", "left", "right"]}
                style={{
                  flex: 1,
                }}
              >
                {children}
              </SafeAreaView>
            </KeyboardProvider>
          </ElectricWrapper>
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
