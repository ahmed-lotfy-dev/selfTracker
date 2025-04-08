import { View, Text } from "react-native"
import { deleteWeight, fetchSingleWeightLog } from "@/utils/api/weightsApi"
import { useQuery } from "@tanstack/react-query"
import { Route, Stack, useLocalSearchParams, useRouter } from "expo-router"
import DateDisplay from "@/components/DateDisplay"
import { useDelete } from "@/hooks/useDelete"
import DeleteButton from "@/components/DeleteButton"
import EditButton from "@/components/EditButton"
import { useWorkoutActions } from "@/store/useWokoutStore"

export default function WeightLog() {
  const router = useRouter()
  const { id } = useLocalSearchParams() as { id: string }
  const { setSelectedWorkout } = useWorkoutActions()

  const {
    data: weightLog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["WeightLog", id],
    queryFn: () =>
      id ? fetchSingleWeightLog(id) : Promise.reject("Invalid ID"),
    enabled: !!id,
  })
  console.log(weightLog)
  console.log({ weightLog })

  const { deleteMutation, triggerDelete } = useDelete({
    mutationFn: () => deleteWeight(String(weightLog?.id)),
    confirmTitle: "Delete Weight",
    confirmMessage: "Are you sure you want to delete this weight log?",
    onSuccessInvalidate: [{ queryKey: ["weightLogs"] }],
  })

  if (isLoading) return <Text>Loading...</Text>
  if (isError) return <Text>Error loading weight log</Text>

  const log = weightLog ?? {}
  return (
    <>
      <Stack.Screen
        options={{
          title: new Date(log.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        }}
      />
      <View className="p-5">
        <Text className="text-xl font-semibold mb-2">Weight Log</Text>
        <Text className="text-lg">
          Date:
          <DateDisplay date={log.createdAt} />
        </Text>
        <Text className="text-lg">
          Weight: {log.weight || "No weight recorded"}
        </Text>
        <Text className="text-lg">
          Notes: {log.notes || "No notes available"}
        </Text>
        <View className="flex-row justify-start gap-3 w-32 mt-3">
          <EditButton
            onPress={() => {
              setSelectedWorkout(weightLog)
              router.navigate(`/workouts/edit` as Route)
            }}
          />
          <DeleteButton onPress={triggerDelete} />
          {deleteMutation.isError && (
            <Text className="text-red-500 mt-2">
              {deleteMutation.error?.message || "Could not delete workout."}
            </Text>
          )}
        </View>
      </View>
    </>
  )
}
