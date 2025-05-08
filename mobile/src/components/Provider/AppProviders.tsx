// TODO revert back to safe area view when they fix it expo SDK 53
import { ReactNode, useMemo, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import AsyncStorage from "@react-native-async-storage/async-storage"
import React from "react"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const insets = useSafeAreaInsets()

  const top = typeof insets.top === "number" ? insets.top : 0
  const bottom = typeof insets.bottom === "number" ? insets.bottom : 0
  const left = typeof insets.left === "number" ? insets.left : 0
  const right = typeof insets.right === "number" ? insets.right : 0

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <View
        style={[
          {
            flex: 1,
            paddingTop: top,
            paddingBottom: bottom,
            paddingLeft: left,
            paddingRight: right,
          },
        ]}
      >
        {children}
      </View>
        </QueryClientProvider>
  )
}
