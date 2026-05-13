import React from "react"
import { View, Text, Pressable, Platform } from "react-native"
import DateTimePicker from "@expo/ui/datetimepicker"
import { Section } from "@/src/components/ui/Section"
import Row from "@/src/components/ui/Row"
import Input from "@/src/components/ui/Input"

interface PhysicalStatsSectionProps {
  weight: string
  setWeight: (val: string) => void
  height: string
  setHeight: (val: string) => void
  gender: string
  setGender: (val: string) => void
  dateOfBirth: Date | undefined
  setDateOfBirth: (date: Date) => void
  unitSystem: string
  showDatePicker: boolean
  setShowDatePicker: (show: boolean) => void
}

export default function PhysicalStatsSection({
  weight,
  setWeight,
  height,
  setHeight,
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
  unitSystem,
  showDatePicker,
  setShowDatePicker
}: PhysicalStatsSectionProps) {

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setShowDatePicker(Platform.OS === "ios")
      setDateOfBirth(selectedDate)
    }
  }

  return (
    <Section title="Physical Stats">
      <Row label="Weight" icon="activity">
        <Input
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="0"
          className="text-right w-24 py-1 h-8"
          containerClassName="mb-0"
        />
        <Text className="text-placeholder ml-2 text-xs">
          {unitSystem === 'imperial' ? 'lbs' : 'kg'}
        </Text>
      </Row>
      
      <Row label="Height" icon="bar-chart-2">
        <Input
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholder="0"
          className="text-right w-24 py-1 h-8"
          containerClassName="mb-0"
        />
        <Text className="text-placeholder ml-2 text-xs">
          {unitSystem === 'imperial' ? 'in' : 'cm'}
        </Text>
      </Row>
      
      <Row label="Gender" icon="user">
        <View className="flex-row bg-inputBackground rounded-lg p-1">
          {['male', 'female'].map((g) => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              className={`px-3 py-1 rounded-md ${gender === g ? 'bg-background shadow-sm' : ''}`}
            >
              <Text className={`text-xs capitalize ${gender === g ? 'font-bold text-primary' : 'text-placeholder'}`}>
                {g}
              </Text>
            </Pressable>
          ))}
        </View>
      </Row>
      
      <Row label="Date of Birth" icon="calendar" isLast>
        <Pressable 
          onPress={() => setShowDatePicker(true)} 
          className="bg-inputBackground px-3 py-2 rounded border border-border"
        >
          <Text className="text-text text-sm">
            {dateOfBirth ? dateOfBirth.toLocaleDateString() : "Set Date"}
          </Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </Row>
    </Section>
  )
}
