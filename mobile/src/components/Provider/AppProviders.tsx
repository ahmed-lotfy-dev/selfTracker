import { ReactNode, useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { useColorScheme, View, Text, Button, unstable_batchedUpdates as batchUpdates } from "react-native"
import { ToastProvider } from "@/src/hooks/useToast"
import { useUser } from "@/src/store/useAuthStore"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Uniwind } from 'uniwind'
import { queryClient } from "@/src/lib/react-query"
import { getAccessToken } from "@/src/lib/storage"

import { makePersistedAdapter } from '@livestore/adapter-expo'
import { LiveStoreProvider } from '@livestore/react'
import { makeCfSync } from '@livestore/sync-cf'
import { schema } from '@/src/livestore/schema'

interface AppProvidersProps {
  children: ReactNode
}

export { queryClient }

const syncUrl = process.env.EXPO_PUBLIC_LIVESTORE_SYNC_URL

const adapter = makePersistedAdapter({
  sync: { backend: syncUrl ? makeCfSync({ url: syncUrl }) : undefined },
})

export function AppProviders({ children }: AppProvidersProps) {
  const systemScheme = useColorScheme()
  const user = useUser()
  const [authToken, setAuthToken] = useState<string | null>(null)

  useEffect(() => {
    const desiredTheme = user?.theme ?? 'system'
    Uniwind.setTheme(desiredTheme)
  }, [user?.theme])

  useEffect(() => {
    getAccessToken().then((token: string | null) => setAuthToken(token))
  }, [user?.id])

  const activeTheme = (user?.theme === 'system' || !user?.theme)
    ? (systemScheme ?? 'light')
    : user?.theme

  const storeId = user?.id ?? 'anonymous'

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <LiveStoreProvider
            schema={schema}
            adapter={adapter}
            storeId={storeId}
            syncPayload={{ authToken: authToken ?? '' }}
            renderLoading={(stage) => (
              <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading ({stage.stage})...</Text>
              </SafeAreaView>
            )}
            renderError={(error: any) => (
              <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Error: {error.toString()}</Text>
              </SafeAreaView>
            )}
            renderShutdown={() => (
              <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>LiveStore Shutdown</Text>
              </SafeAreaView>
            )}
            batchUpdates={batchUpdates}
          >
            <KeyboardProvider>
              <SafeAreaView
                edges={["top", "left", "right"]}
                style={{ flex: 1 }}
              >
                {children}
              </SafeAreaView>
            </KeyboardProvider>
          </LiveStoreProvider>
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
