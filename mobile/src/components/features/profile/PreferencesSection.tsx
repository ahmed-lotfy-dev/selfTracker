import React from "react"
import { View, Text, Pressable } from "react-native"
import { Section } from "@/src/components/ui/Section"
import Row from "@/src/components/ui/Row"
import Input from "@/src/components/ui/Input"
import { useAuthStore } from "@/src/features/auth/useAuthStore"

interface PreferencesSectionProps {
  income: string
  setIncome: (val: string) => void
  currency: string
  setCurrency: (val: string) => void
  unitSystem: string
  setUnitSystem: (val: string) => void
  theme: string
  setTheme: (val: string) => void
}

export default function PreferencesSection({
  income,
  setIncome,
  currency,
  setCurrency,
  unitSystem,
  setUnitSystem,
  theme,
  setTheme
}: PreferencesSectionProps) {
  
  const handleThemeChange = (option: "light" | "dark" | "system") => {
    setTheme(option)
    const uniwindTheme = option === 'system' ? 'system' : option
    // Dynamically import uniwind to follow Tauri/Web best practices
    import('uniwind').then(({ Uniwind }) => Uniwind.setTheme(uniwindTheme))
    
    // Update store immediately for UI response
    const user = useAuthStore.getState().user
    if (user) {
      useAuthStore.getState().setUser({ ...user, theme: option });
    }
  }

  return (
    <Section title="Preferences & Details">
      <Row label="Income" icon="dollar-sign">
        <Input
          value={income}
          onChangeText={setIncome}
          keyboardType="numeric"
          placeholder="0.00"
          className="text-right w-24 py-1 h-8"
          containerClassName="mb-0"
        />
      </Row>
      
      <Row label="Currency" icon="credit-card">
        <Input
          value={currency}
          onChangeText={setCurrency}
          placeholder="EGP"
          className="text-right w-24 py-1 h-8"
          containerClassName="mb-0"
        />
      </Row>
      
      <Row label="Unit System" icon="box">
        <View className="flex-row bg-inputBackground rounded-lg p-1">
          {['metric', 'imperial'].map((sys) => (
            <Pressable
              key={sys}
              onPress={() => setUnitSystem(sys)}
              className={`px-3 py-1 rounded-md ${unitSystem === sys ? 'bg-background shadow-sm' : ''}`}
            >
              <Text className={`text-xs capitalize ${unitSystem === sys ? 'font-bold text-primary' : 'text-placeholder'}`}>
                {sys}
              </Text>
            </Pressable>
          ))}
        </View>
      </Row>
      
      <Row label="Theme" icon="moon" isLast>
        <View className="flex-row bg-inputBackground rounded-lg p-1">
          {(['light', 'dark', 'system'] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => handleThemeChange(option)}
              className={`px-3 py-1 rounded-md ${theme === option ? 'bg-background shadow-sm' : ''}`}
            >
              <Text className={`text-xs capitalize ${theme === option ? 'font-bold text-primary' : 'text-placeholder'}`}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </Row>
    </Section>
  )
}
