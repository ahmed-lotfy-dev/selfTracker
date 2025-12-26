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
  duration: number;
  isRunning: boolean;
  isOverlayVisible: boolean;
  mode: keyof typeof MODES;
  overlayPosition: OverlayPosition;

  setTimeLeft: (time: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  toggleTimer: () => void;
  resetTimer: (mode?: TimerState["mode"]) => void;
  setMode: (mode: TimerState["mode"]) => void;
  setCustomTime: (minutes: number) => void;
  setOverlayVisible: (visible: boolean) => void;
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
    duration: 25 * 60,
    isRunning: false,
    isOverlayVisible: false,
    mode: "pomodoro",
    overlayPosition: "top-center",

    setTimeLeft: (timeLeft) => {
      set({ timeLeft });
    },

    startTimer: () => {
      const { timeLeft, duration } = get();
      if (timeLeft <= 0) {
        set({ timeLeft: duration });
        syncState({ timeLeft: duration });
      }
      set({ isRunning: true, isOverlayVisible: true });
      syncState({ isRunning: true, isOverlayVisible: true });
    },

    pauseTimer: () => {
      set({ isRunning: false });
      syncState({ isRunning: false });
    },

    stopTimer: () => {
      set({ isRunning: false, isOverlayVisible: false });
      syncState({ isRunning: false, isOverlayVisible: false });
    },

    toggleTimer: () => {
      const { isRunning, isOverlayVisible } = get();
      const nextRunning = !isRunning;
      // If starting, show overlay. If stopping, we might want to keep it or hide it.
      // User said "when stopped it stop the timer it doesnt [hide]" -> so hide on stop.
      // But toggle usually implies pause/resume. 
      // Let's make it smarter: if starting, show.
      set({ isRunning: nextRunning, isOverlayVisible: nextRunning ? true : isOverlayVisible });
      syncState({ isRunning: nextRunning, isOverlayVisible: nextRunning ? true : isOverlayVisible });
    },

    resetTimer: (mode) => {
      const targetMode = mode || get().mode;
      const newTime = MODES[targetMode].minutes * 60;
      set({ isRunning: false, timeLeft: newTime, duration: newTime, mode: targetMode });
      syncState({ isRunning: false, timeLeft: newTime, duration: newTime, mode: targetMode });
    },

    setMode: (mode) => {
      const newTime = MODES[mode].minutes * 60;
      set({ mode, timeLeft: newTime, duration: newTime, isRunning: false });
      syncState({ mode, timeLeft: newTime, duration: newTime, isRunning: false });
    },

    setCustomTime: (minutes) => {
      const seconds = minutes * 60;
      set({ timeLeft: seconds, duration: seconds, isRunning: false });
      syncState({ timeLeft: seconds, duration: seconds, isRunning: false });
    },

    setOverlayVisible: (isOverlayVisible) => {
      set({ isOverlayVisible });
      syncState({ isOverlayVisible });
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
      } else if (timeLeft <= 0 && isRunning) {
        set({ isRunning: false });

        // Play sound
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
          gain.gain.setValueAtTime(0.5, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
          console.error("Failed to play sound", e);
        }

        // Flash the taskbar/dock icon to get attention
        try {
          import("@tauri-apps/api/window").then(async ({ getCurrentWindow, UserAttentionType }) => {
            const win = getCurrentWindow();
            // Flash the icon (Critical = continuous flash until focused, Informational = flash few times)
            await win.requestUserAttention(UserAttentionType.Critical);
          });
        } catch (e) {
          console.error("Failed to request attention", e);
        }

        // Show notification
        try {
          import("@tauri-apps/plugin-notification").then(({ sendNotification }) => {
            sendNotification({
              title: "Time to Break!",
              body: "Your focus session is finished. Take a moment to breathe.",
              sound: "default",
            });
          });
        } catch (e) {
          console.error("Failed to show notification", e);
        }
      } else if (timeLeft <= 0) {
        set({ isRunning: false });
      }
    }
  };
});
