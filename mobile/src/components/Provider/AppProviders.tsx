// TODO revert back to safe area view when they fix it expo SDK 53
import { ReactNode } from "react"
import { SafeAreaView } from "react-native-safe-area-context"

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { KeyboardProvider } from "react-native-keyboard-controller"

import { Colors } from "@/src/constants/Colors"
import { useColorScheme } from "react-native"
import { ToastProvider } from "@/src/hooks/useToast"

interface AppProvidersProps {
  children: ReactNode
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

export function AppProviders({ children }: AppProvidersProps) {
  const theme = useColorScheme()
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
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
      </ToastProvider>
      the auth is working but it fetchd successfully just the weight logs not the workout logs not working show no logs i guess on tauri app
    </QueryClientProvider>
  )
}
