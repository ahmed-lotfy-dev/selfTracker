import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createWeight } from "@/utils/api/weightsApi"
import { useUser } from "@/store/useAuthStore"
import { DateType } from "react-native-ui-datepicker"
import { useRouter } from "expo-router"
import DatePicker from "@/components/DatePicker"
import DateDisplay from "@/components/DateDisplay"
import { convertLocalDateToUtc, showAlert } from "@/utils/lib"

export default function AddWeight() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState<DateType>(new Date().toISOString())
  const [showDate, setShowDate] = useState(false)
  const user = useUser()
  if (!user) return <Text>Loading...</Text>

  const mutation = useMutation({
    mutationFn: () => {
      const weightValue = parseFloat(weight)
      if (isNaN(weightValue)) {
        showAlert("Invalid Input", "Please enter a valid weight.")
        return Promise.reject("Invalid weight")
      }

      const localDate = convertLocalDateToUtc(new Date(date as string))
      
      return createWeight({
        userId: user.id,
        weight: weightValue,
        notes: notes.trim() || null,
        createdAt: localDate,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weightLogs"] })
      setWeight("")
      setNotes("")
      setDate(new Date())
      router.push("/weights")
    },
    onError: (error) => {
      console.error("Error adding weight:", error)
    },
  })

  return (
    <View className="px-4">
      <Text className="text-lg font-bold mb-4">Enter Your Weight</Text>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholder="Enter weight (kg)"
        className="border border-green-700 rounded-md p-2 mb-3"
      />

      <Text className="text-lg font-bold mb-2">Notes (Optional)</Text>
      <TextInput
        className="border border-green-700 rounded-md p-2 mb-3"
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes (e.g., morning weigh-in)"
      />

      <Text className="text-lg font-bold mb-2">Select Date</Text>

      <View className="mb-4">
        <TouchableOpacity onPress={() => setShowDate(!showDate)}>
          <DateDisplay
            date={date ? date.toLocaleString() : new Date().toLocaleString()}
          />
        </TouchableOpacity>
      </View>

      {showDate && (
        <DatePicker
          date={date}
          setDate={setDate}
          showDate={showDate}
          setShowDate={setShowDate}
        />
      )}

      <TouchableOpacity
        onPress={() => mutation.mutate()}
        disabled={mutation.isPending || !weight}
        className="bg-green-800 p-3 rounded-md"
      >
        {mutation.isPending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-white text-center">Add Weight</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}
function zonedTimeToUtc(date: DateType, userTimezone: any) {
  throw new Error("Function not implemented.")
}
