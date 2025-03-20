import { fetchAllWorkouts } from "@/utils/api/workouts"
import { useQuery } from "@tanstack/react-query"
import { View, Text, ScrollView, Spinner } from "tamagui"

export default function TabsLayout() {
  const {
    data: workoutLogs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: fetchAllWorkouts,
  })

  console.log(workoutLogs)

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

  if(workoutLogs?.workouts?.length === 0) {
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
        {workoutLogs?.workouts?.map((workout: any) => (
          <Text key={workout.id}>{workout.date}</Text>
        ))}
      </ScrollView>
    </View>
  )
}
