import React from "react"
import { Platform, Modal, Pressable, Text, View } from "react-native"
import DateTimePicker from "@expo/ui/datetimepicker"
import { useThemeColors } from "@/src/constants/Colors"
import { PremiumCard } from "./ui/PremiumCard"

type DatePickerProps = {
  date: Date
  onChange: (date: Date) => void
  visible: boolean
  onClose: () => void
}

export default function DatePicker({
  date,
  onChange,
  visible,
  onClose,
}: DatePickerProps) {
  const colors = useThemeColors()

  if (!visible) return null

  // Use modal on iOS for better UX, native inline on Android
  if (Platform.OS === 'ios') {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <PremiumCard 
              containerStyle="m-4 p-4 border-white/10"
              gradientColors={['rgba(30,30,30,1)', 'rgba(15,15,15,1)']}
            >
              <View className="flex-row justify-between items-center w-full mb-4 px-2">
                 <Text className="text-white/50 font-bold uppercase tracking-widest text-[10px]">Select Date</Text>
                 <Pressable onPress={onClose} className="bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
                   <Text className="text-white font-bold text-xs uppercase tracking-widest">Done</Text>
                 </Pressable>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="inline"
                themeVariant="dark"
                onChange={(event, selectedDate) => {
                  if (selectedDate) onChange(selectedDate)
                }}
              />
            </PremiumCard>
          </Pressable>
        </Pressable>
      </Modal>
    )
  }

  // Android - use native picker directly
  return (
    <DateTimePicker
      value={date}
      mode="date"
      display="default"
      onChange={(event, selectedDate) => {
        if (selectedDate) onChange(selectedDate)
      }}
    />
  )
}
