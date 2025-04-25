import { ReactNode, useMemo, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SafeAreaView } from "react-native-safe-area-context"

import { persistQueryClient,PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
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
      <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </QueryClientProvider>
  )
}
