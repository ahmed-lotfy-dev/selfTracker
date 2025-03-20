import { WorkoutType } from "@/types/workoutType"
import axiosInstance from "@/utils/api/axiosInstane"
import { fetchAllWorkouts } from "@/utils/api/workouts"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useEffect, useState } from "react"
import { View, Text, ScrollView, Spinner } from "tamagui"

export default function WorkoutScreen() {
  const [workout, setWorkouts] = useState()

  const {
    data: workoutLogs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["AllWorkoutsLogss"],
    queryFn: fetchAllWorkouts,
  })

  if (isLoading) {
    return (
      <View flex={1} justify="center" items="center">
        <Spinner size="large" />
      </View>
    )
  }

  if (isError) {
    return (
      <View flex={1} justify="center" items="center">
        <Text>Failed to load workouts. Please try again.</Text>
      </View>
    )
  }

  if (workoutLogs?.workouts?.length === 0) {
    return (
      <View flex={1} justify="center" items="center">
        <Text>No workouts found.</Text>
      </View>
    )
  }

  return (
    <View>
      <Text>Workouts Screen</Text>
      <ScrollView>
        {workoutLogs &&
          workoutLogs?.workouts.map((workout: WorkoutType, idx: number) => (
            <Text key={idx}>{workout.workoutName}</Text>
          ))}
      </ScrollView>
    </View>
  )
}
