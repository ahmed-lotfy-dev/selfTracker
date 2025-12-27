# The Optimistic UI Pattern with React 19

This guide explains the "Optimistic UI" pattern we implemented in your SelfTracker app using React 19's new `useOptimistic` and `useTransition` hooks.

## The Concept: "Act Now, Sync Later"

Standard UI waits for the server/database to confirm an action before updating the screen. This feels slow (laggy).
**Optimistic UI** assumes the action will succeed and updates the screen *instantly*. If the server fails later, it silently rolls back.

## The Tools

### 1. `useOptimistic`
This hook manages a temporary "layer" of state on top of your real data.
- **Input:** Your real data (e.g., from the database).
- **Action:** A function to merge your temporary local changes.
- **Output:** A combined version of data (Real + Optimistic) to render directly.

### 2. `useTransition`
This hook lets you fire off the slow background work (the database update) without freezing the UI.
- It marks the database update as a "transition" (non-urgent work).
- It allows the UI to stay responsive while the promise resolves.

## How They Work Together

1.  User clicks "Toggle".
2.  **IMMEDIATELY**: `addOptimisticItem(...)` runs. The UI re-renders instantly with the new state (e.g., checked box).
3.  **BACKGROUND**: `startTransition(async () => { ... })` runs the actual DB update.
4.  **SYNC**: Once the DB updates, the "Real Data" changes. `useOptimistic` sees the new real data stays consistent, and automatically discards the temporary optimistic state.

## Code Example: Mobile Tasks

Here is the exact pattern we used in your `mobile/src/app/(drawer)/(tabs)/tasks.tsx`.

```tsx
import { useOptimistic, useTransition } from "react"
// ... imports

export default function TaskScreen() {
  const collections = useCollections()
  // 1. Setup the Transition hook for background work
  const [isPending, startTransition] = useTransition()

  // 2. Get Real Data (Source of Truth) from Database
  const { data: dbTasks = [] } = useLiveQuery(...)

  // 3. Setup Optimistic State
  //    - First arg: The "Source of Truth" (dbTasks)
  //    - Second arg: reducer function to merge optimistic updates
  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    dbTasks,
    (currentTasks, updatedTask: any) => {
      // Logic: Find the task and update it, otherwise return as is
      return currentTasks.map((task: any) => 
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    }
  )

  const toggleTask = (task: any) => {
    const isCompleted = !task.completed
    const now = new Date().toISOString()
    
    // 4. Wrap everything in startTransition
    startTransition(async () => {
      // 5. ACT NOW: Update UI instantly via optimistic state
      addOptimisticTask({
        id: task.id,
        completed: isCompleted,
        completedAt: isCompleted ? now : null,
      })
      
      // 6. SYNC LATER: Perform actual DB operation
      try {
        await collections.tasks.update(task.id, (draft: any) => {
          draft.completed = isCompleted
          draft.completed_at = isCompleted ? now : null
          draft.updated_at = now
        })
      } catch (e) {
        console.error('Failed to toggle task:', e)
        // If this fails, next render will revert because dbTasks won't have changed
      }
    })
  }

  // 7. RENDER: Always render 'optimisticTasks', NOT 'dbTasks'
  return (
    <FlatList
      data={optimisticTasks} 
      // ...
    />
  )
}
```

## Why This Rocks
1.  **Zero Lag:** Users feel 0ms latency.
2.  **No Loading Spinners:** For small actions like toggles/deletes, spinners are annoying.
3.  **Automatic Cleanup:** You don't need `useEffect` to clean up local state. Once `dbTasks` updates, `optimisticTasks` automatically re-aligns to it.

## Where We Used It
- **Mobile Habits:** Toggling checkmarks.
- **Mobile Tasks:** Completing todo items.
- **Mobile Workouts/Weights:** Deleting logs effectively instantly.
- **Desktop Habits:** Dashboard widget and main page.
