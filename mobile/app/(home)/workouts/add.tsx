import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import Select from "@/components/Picker"
import { DateType } from "react-native-ui-datepicker"
import DatePicker from "@/components/DatePicker"
import { createWorkout } from "@/utils/api/workoutsApi"
import { fetchAllWorkouts } from "@/utils/api/workouts"
import { useUser } from "@/store/useAuthStore"
import { useRouter } from "expo-router"
import DateDisplay from "@/components/DateDisplay"

export default function AddWorkout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [workout, setWorkout] = useState<any>()
  const [date, setDate] = useState<DateType>(new Date())
  const [showDate, setShowDate] = useState(false)
  const [notes, setNotes] = useState("")
  const user = useUser()
  if (!user) return <Text>Loading...</Text>

  const { data: workouts } = useQuery({
    queryKey: ["workouts"],
    queryFn: fetchAllWorkouts,
    initialData: [],
  })

  const mutation = useMutation({
    mutationFn: () =>
      createWorkout({
        userId: user!.id,
        workoutId: workout,
        createdAt: date,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutLogs"] })
      setWorkout("")
      setDate(new Date())
      setNotes("")
      router.push("/workouts")
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  useEffect(() => {
    setWorkout(workouts[0]?.id)
  }, [])

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">Select Workout</Text>
      <Select value={workout} setValue={setWorkout} options={workouts} />

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
        disabled={mutation.isPending || !workout}
        className="bg-green-800 p-3 rounded-md mt-4"
      >
        {mutation.isPending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-white text-center">Add Workout</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}
