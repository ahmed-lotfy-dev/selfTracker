import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TimerState {
  isRunning: boolean;
  elapsedSeconds: number;
  startTime: number | null;
  taskId: string | null;
  type: 'focus' | 'short_break' | 'long_break';
}

interface TimerContextType {
  timerState: TimerState;
  isVisible: boolean;
  isMinimized: boolean;
  startTimer: (taskId?: string, type?: 'focus' | 'short_break' | 'long_break') => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  toggleMinimize: () => void;
  showTimer: () => void;
  hideTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const STORAGE_KEY = 'timer_state';

const initialState: TimerState = {
  isRunning: false,
  elapsedSeconds: 0,
  startTime: null,
  taskId: null,
  type: 'focus',
};

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>(initialState);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Load persisted timer state on mount
  useEffect(() => {
    loadTimerState();
  }, []);

  // Persist timer state whenever it changes
  useEffect(() => {
    if (timerState.isRunning || timerState.elapsedSeconds > 0) {
      saveTimerState();
    }
  }, [timerState]);

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState.isRunning && timerState.startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - timerState.startTime!) / 1000);

        setTimerState(prev => ({
          ...prev,
          elapsedSeconds: elapsed,
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.startTime]);

  const loadTimerState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved) as TimerState;

        // If timer was running, calculate elapsed time
        if (state.isRunning && state.startTime) {
          const now = Date.now();
          const elapsed = Math.floor((now - state.startTime) / 1000);
          setTimerState({ ...state, elapsedSeconds: elapsed });
          setIsVisible(true);
        } else if (state.elapsedSeconds > 0) {
          setTimerState(state);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
    }
  };

  const saveTimerState = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timerState));
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  };

  const startTimer = (taskId?: string, type: 'focus' | 'short_break' | 'long_break' = 'focus') => {
    const now = Date.now();
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      startTime: now - (prev.elapsedSeconds * 1000),
      taskId: taskId || prev.taskId,
      type,
    }));
    setIsVisible(true);
  };

  const pauseTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
    }));
  };

  const stopTimer = () => {
    // TODO: Save session to backend
    localStorage.removeItem(STORAGE_KEY);

    setTimerState(initialState);
    setIsVisible(false);
    setIsMinimized(false);
  };

  const resetTimer = () => {
    setTimerState(prev => ({
      ...prev,
      elapsedSeconds: 0,
      startTime: prev.isRunning ? Date.now() : null,
    }));
  };

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  const showTimer = () => setIsVisible(true);
  const hideTimer = () => setIsVisible(false);

  return (
    <TimerContext.Provider
      value={{
        timerState,
        isVisible,
        isMinimized,
        startTimer,
        pauseTimer,
        stopTimer,
        resetTimer,
        toggleMinimize,
        showTimer,
        hideTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
}
