import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert, Platform } from "react-native"
import { showAlert } from "@/src/lib/lib"

type UseAddOptions = {
  mutationFn: (values: any) => Promise<any>
  onSuccessInvalidate?: { queryKey: any }[]
  onSuccessCallback?: () => void
  onErrorMessage?: string
}

export function useAdd({
  mutationFn,
  onSuccessInvalidate = [],
  onSuccessCallback,
  onErrorMessage = "Failed to Add.",
}: UseAddOptions) {
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
    addMutation: mutation,
  }
}
