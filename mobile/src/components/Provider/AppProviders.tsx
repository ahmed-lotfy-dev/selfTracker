// TODO revert back to safe area view when they fix it expo SDK 53
import { ReactNode } from "react"
import { SafeAreaView } from "react-native-safe-area-context"

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { KeyboardProvider } from "react-native-keyboard-controller"

import { Colors } from "@/src/constants/Colors"
import { useColorScheme } from "react-native"
import { ToastProvider } from "@/src/hooks/useToast"
import { ElectricWrapper } from "./ElectricWrapper"

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

import { GestureHandlerRootView } from "react-native-gesture-handler"

export function AppProviders({ children }: AppProvidersProps) {
  const theme = useColorScheme()
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
                  backgroundColor:
                    theme === "light" ? Colors.light.background : Colors.dark.background,
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
