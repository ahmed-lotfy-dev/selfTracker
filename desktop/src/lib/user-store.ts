import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  userId: string | null;
  isGuest: boolean;

  // Actions
  setGuest: () => void;
  setAuthenticated: (userId: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      isGuest: true, // Default to guest until logged in

      setGuest: () => set({ userId: "local", isGuest: true }),

      setAuthenticated: (userId: string) =>
        set({ userId, isGuest: false }),

      logout: () =>
        set({ userId: "local", isGuest: true }),
    }),
    {
      name: "user-storage", // name of the item in the storage (must be unique)
    }
  )
);
