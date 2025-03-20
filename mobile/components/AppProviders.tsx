  import { ReactNode, useMemo, useState } from "react"
  import { TamaguiProvider } from "tamagui"
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
  import { SafeAreaView } from "react-native-safe-area-context"
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
