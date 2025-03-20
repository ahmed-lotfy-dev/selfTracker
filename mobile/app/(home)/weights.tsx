import { WeightType } from "@/types/weightType"
import axiosInstance from "@/utils/api/axiosInstane"
import { fetchAllWeights } from "@/utils/api/weights"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useEffect, useState } from "react"
import { View, Text, ScrollView, Spinner } from "tamagui"

export default function WeightsScreen() {
  const [weights, setWeights] = useState()

  const {
    data: weightLogs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["AllWeightsLogs"],
    queryFn: fetchAllWeights,
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
        <Text>Failed to load weights. Please try again.</Text>
      </View>
    )
  }

  if (weightLogs?.length === 0) {
    return (
      <View flex={1} justify="center" items="center">
        <Text>No weights found.</Text>
      </View>
    )
  }

  return (
    <View>
      <Text>Weights Screen</Text>
      <ScrollView>
        {weightLogs &&
          weightLogs?.weights.map((weight: WeightType, idx: number) => (
            <Text key={idx}>{weight.weight}</Text>
          ))}
      </ScrollView>
    </View>
  )
}
