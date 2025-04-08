import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert, Platform } from "react-native"
import { showAlert } from "@/utils/lib"

type UseUpdateOptions = {
  mutationFn: (values: any) => Promise<any>
  onSuccessInvalidate?: { queryKey: any }[]
  onSuccessCallback?: () => void
  onErrorMessage?: string
}

export function useUpdate({
  mutationFn,
  onSuccessInvalidate = [],
  onSuccessCallback,
  onErrorMessage = "Failed to Update.", // Changed default error message
}: UseUpdateOptions) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      onSuccessInvalidate.forEach((invalidate) =>
        queryClient.invalidateQueries(invalidate)
      )
      onSuccessCallback?.()
    },
    onError: () => {
      showAlert("Error", onErrorMessage)
    },
  })

  return {
    updateMutation: mutation, 
  }
}
