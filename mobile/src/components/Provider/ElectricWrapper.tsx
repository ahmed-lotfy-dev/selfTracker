import React, { useEffect, useState } from "react"
import { ElectricProvider, initElectric } from "@/src/lib/electric"
import { Text, View } from "react-native"

export const ElectricWrapper = ({ children }: { children: React.ReactNode }) => {
  const [electric, setElectric] = useState<any>()

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const client = await initElectric()
        if (isMounted) {
          setElectric(client)
        }
      } catch (error) {
        console.error("Failed to initialize ElectricSQL:", error)
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  if (!electric) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Syncing...</Text>
      </View>
    )
  }

  return <ElectricProvider db={electric}>{children}</ElectricProvider>
}
