// TODO revert back to safe area view when they fix it expo SDK 53
import { ReactNode, useMemo, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"

import React from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { COLORS } from "@/src/constants/Colors"

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
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <SafeAreaView
        edges={["top","left", "right",]}
        style={{ flex: 1, backgroundColor: COLORS.background }}
      >
        {children}
      </SafeAreaView>
    </PersistQueryClientProvider>
  )
}
