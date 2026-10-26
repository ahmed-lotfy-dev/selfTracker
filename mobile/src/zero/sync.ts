import { queries } from "./queries"
import { mapHabitRow, mapTaskRow } from "./mappers"
import type { AppZero } from "./client"
import { useTasksStore } from "@/src/stores/useTasksStore"
import { useHabitsStore } from "@/src/stores/useHabitsStore"
import { useSyncStore } from "@/src/stores/useSyncStore"

/**
 * Bridges Zero's materialized views into the app's Zustand stores.
 *
 * The stores stay the single UI-facing API (screens keep using `useActiveTasks`,
 * `addTask`, `toggleComplete`, …) but their contents now come from Zero instead
 * of PowerSync/MMKV merges.
 */
export function startZeroSync(zero: AppZero): () => void {
  const tasksView = zero.materialize(queries.tasks())
  const habitsView = zero.materialize(queries.habits())

  const offTasks = tasksView.addListener((rows, resultType, error) => {
    if (resultType === "error" && error) {
      console.warn("[Zero] tasks query error:", error)
      return
    }
    useTasksStore.getState().setTasks(rows.map(mapTaskRow))
  })

  const offHabits = habitsView.addListener((rows, resultType, error) => {
    if (resultType === "error" && error) {
      console.warn("[Zero] habits query error:", error)
      return
    }
    useHabitsStore.getState().setHabits(rows.map(mapHabitRow))
  })

  const setStatus = (status: "syncing" | "synced" | "error" | "auth_required") => {
    const { setTableStatus } = useSyncStore.getState()
    setTableStatus("tasks", status)
    setTableStatus("habits", status)
  }

  const offConnection = zero.connection.state.subscribe((state) => {
    switch (state.name) {
      case "connected":
        setStatus("synced")
        break
      case "connecting":
      case "initializing":
      case "disconnected":
        setStatus("syncing")
        break
      case "needs-auth":
        console.warn("[Zero] needs auth:", state.reason)
        setStatus("auth_required")
        break
      case "error":
        console.warn("[Zero] connection error:", state.reason)
        setStatus("error")
        break
      case "closed":
        break
    }
  })

  return () => {
    offTasks()
    offHabits()
    offConnection()
    tasksView.destroy()
    habitsView.destroy()
  }
}
