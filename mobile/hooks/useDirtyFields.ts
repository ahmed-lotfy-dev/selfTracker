import { useStore, AnyFormApi } from "@tanstack/react-form"

export const useDirtyFields = (form: AnyFormApi) => {
  return useStore(form.store, (state) =>
    Object.entries(state.fieldMeta)
      .filter(([_, meta]) => meta.isDirty)
      .map(([name]) => name)
  )
}
