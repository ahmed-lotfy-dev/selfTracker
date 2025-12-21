# Pomodoro Timer Implementation Plan & Educational Guide (Pure Expo)

## 1. The Challenge: "Time" in Mobile Apps
Implementing a timer that runs while the app is in the background (or "closed") is one of the classic challenges in mobile development.

### How Operating Systems Think
Mobile OSs (Android/iOS) are aggressive about saving battery. When you press the "Home" button:
1.  **Background State**: The app gets a few seconds to finish tasks.
2.  **Suspended State**: The CPU stops executing your Javascript code.
3.  **Terminated**: If memory is low, the OS kills the app entirely.

**The Problem**: If your app is suspended, your `setInterval(() => count--, 1000)` **stops running**. When you open the app again, the timer hasn't moved.

---

## 2. The Solution: The "Timestamp" Method
Since we are **not** using foreground services (Notifee), we will use the most robust and battery-friendly method: **Timestamps**.

Instead of "counting down" every second in the background, we just remember *when* the timer will end.

### How it works:
1.  **Start**: User starts 25min timer at 12:00 PM. We save `endTime = 12:25 PM` in our state (and persistance).
2.  **Background**: 
    *   We immediately schedule a **local notification** to fire at `12:25 PM`.
    *   The OS handles this. Our app can completely die/sleep, and the notification will still fire.
3.  **Resume**: 
    *   App wakes up at 12:10 PM. 
    *   We compare `now` vs `endTime`. `12:25 - 12:10 = 15 mins`.
    *   We update the UI to show 15 mins remaining.
    *   We cancel the pending notification (since the user is back in the app).

**Pros**: 
*   **Zero Battery Drain**: No code runs in background.
*   **Simple**: Uses standard `expo-notifications`.
*   **Cross-Platform**: Works exactly the same on iOS and Android.

**Cons**: 
*   **Static Notification**: The notification in the tray won't count down ("14:59", "14:58"...). It will be a static message like "Focus Timer ends at 12:25 PM".

---

## 3. Tech Stack

*   **State Management**: `zustand` (already installed)
    *   Stores `endTime`, `duration`, `status` (IDLE, RUNNING, PAUSED).
*   **Notifications**: `expo-notifications` (already installed)
    *   Used to alert the user when the timer completes.
*   **Persistence**: `zustand` persist middleware
    *   Ensures if the app is killed by OS, we recall the timer state when reopened.

---

## 4. Implementation Steps

### Step 1: Create the Timer Store (`useTimerStore.ts`)
We need a store that persists data so we don't lose the timer if the app restarts.

```typescript
type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED';

interface TimerState {
  status: TimerStatus;
  endTime: number | null; // ISO Timestamp
  duration: number; // in seconds (e.g. 25 * 60)
  remainingWhenPaused: number; // store remaining time if paused
  
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
}
```

### Step 2: Create the Notification Hook (`useTimerNotification.ts`)
A custom hook that handles the logic of "App is going to background -> Schedule Notification".

*   Listens to `AppState` changes (active vs background).
*   When backgrounding: Schedule notification.
*   When foregrounding: Cancel notification.

### Step 3: The UI Component (Live Counting)
**Yes!** We absolutely show the seconds counting down inside the app.

Since we know the `endTime`, the UI logic is simple and precise:
1.  **Mount**: Component starts a local timer (`setInterval` every 1000ms).
2.  **Tick**: Every second, it calculates: `Time Left = endTime - Current Time`.
3.  **Render**: Updates the text `24:59` -> `24:58` -> `24:57`.

This means:
*   **App Open**: You see the numbers moving live.
*   **App Closed**: The numbers stop "rendering" (saving battery), but the *concept* of the timer keeps moving forward because time itself is moving forward.
*   **Re-Open**: The numbers immediately jump to the correct new time (e.g. you closed at 20:00, opened 5 mins later, it shows 15:00 instantly).

---

## 5. Feasibility Summary
| Feature | Implementation | UI Result |
| :--- | :--- | :--- |
| **App Open** | `setInterval` updates state | Seconds tick down (25:00 -> 24:59) |
| **App Backgrounded** | `expo-notifications` | Notification scheduled for end time |
| **Notification Tray** | Static Message | "Time's up!" or "Focus Session Complete" |
| **App Killed** | State Persisted | Value restored on relaunch |

## 6. Action Plan
1.  **Create Store**: Implement `src/store/useTimerStore.ts` with persistence.
2.  **Create Logic**: Implement `src/hooks/useTimerSystem.ts` to connect AppState and Notifications.
3.  **UI**: Build the Timer Screen.
