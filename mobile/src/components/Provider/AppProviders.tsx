// TODO revert back to safe area view when they fix it expo SDK 53
import { ReactNode, useMemo, useState } from "react"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import React from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"

interface AppProvidersProps {
  children: ReactNode
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
})

export function AppProviders({ children }: AppProvidersProps) {
  const insets = useSafeAreaInsets()

  const top = typeof insets.top === "number" ? insets.top : 0
  const bottom = typeof insets.bottom === "number" ? insets.bottom : 0
  const left = typeof insets.left === "number" ? insets.left : 0
  const right = typeof insets.right === "number" ? insets.right : 0

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
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
    </PersistQueryClientProvider>
  )
}
