import { ReactNode, useMemo, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SafeAreaView } from "react-native-safe-area-context"
import { defaultConfig } from "@tamagui/config/v4"
import { TamaguiProvider, View } from "@tamagui/core"
import { config } from "@/tamagui.config"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 2 } } })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config}>
        <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
      </TamaguiProvider>
    </QueryClientProvider>
  )
}
