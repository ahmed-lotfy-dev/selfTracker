import { create } from "zustand";

export const MODES = {
  pomodoro: { label: "Focus", minutes: 25 },
  shortBreak: { label: "Short Break", minutes: 5 },
  longBreak: { label: "Long Break", minutes: 15 },
} as const;

export type OverlayPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  mode: keyof typeof MODES;
  overlayPosition: OverlayPosition;

  setTimeLeft: (time: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  toggleTimer: () => void;
  resetTimer: (mode?: TimerState["mode"]) => void;
  setMode: (mode: TimerState["mode"]) => void;
  togglePosition: () => void;
  tick: () => void;
}

// BroadcastChannel for syncing state between windows
const bc = new BroadcastChannel("timer_channel");

export const useTimerStore = create<TimerState>((set, get) => {
  bc.onmessage = (event) => {
    const { type, payload } = event.data;
    if (type === "SYNC_STATE") {
      set((state) => ({ ...state, ...payload }));
    }
  };

  const syncState = (state: Partial<TimerState>) => {
    bc.postMessage({ type: "SYNC_STATE", payload: state });
  };

  return {
    timeLeft: 25 * 60,
    isRunning: false,
    mode: "pomodoro",
    overlayPosition: "top-right",

    setTimeLeft: (timeLeft) => {
      set({ timeLeft });
      // Depending on preference, we might not broadcast every tick to avoid noise,
      // but for overlay sync, we usually need it.
      // syncState({ timeLeft });
    },

    startTimer: () => {
      set({ isRunning: true });
      syncState({ isRunning: true });
    },

    pauseTimer: () => {
      set({ isRunning: false });
      syncState({ isRunning: false });
    },

    stopTimer: () => {
      set({ isRunning: false });
      syncState({ isRunning: false });
    },

    toggleTimer: () => {
      const isRunning = get().isRunning;
      set({ isRunning: !isRunning });
      syncState({ isRunning: !isRunning });
    },

    resetTimer: (mode) => {
      const newTime =
        mode === "shortBreak" ? 5 * 60 : mode === "longBreak" ? 15 * 60 : 25 * 60;
      const finalMode = mode || "pomodoro";
      set({ isRunning: false, timeLeft: newTime, mode: finalMode });
      syncState({ isRunning: false, timeLeft: newTime, mode: finalMode });
    },

    setMode: (mode) => {
      set({ mode });
      syncState({ mode });
    },

    togglePosition: () =>
      set((state) => {
        const positions: OverlayPosition[] = [
          "top-left",
          "top-center",
          "top-right",
          "bottom-right",
          "bottom-center",
          "bottom-left",
        ];
        const currentIndex = positions.indexOf(state.overlayPosition);
        const nextIndex = (currentIndex + 1) % positions.length;
        return { overlayPosition: positions[nextIndex] };
      }),

    tick: () => {
      const { timeLeft, isRunning } = get();
      if (isRunning && timeLeft > 0) {
        set({ timeLeft: timeLeft - 1 });
      } else if (timeLeft <= 0) {
        set({ isRunning: false });
      }
    }
  };
});
