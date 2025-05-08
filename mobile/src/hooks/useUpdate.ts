import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Platform } from "react-native"
import { showAlert } from "@/src/lib/lib"

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
  onErrorMessage = "Failed to Update.",
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
