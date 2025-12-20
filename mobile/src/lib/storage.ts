import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';

// --- Token Management ---

export const getAccessToken = async () => {
  return await SecureStore.getItemAsync("accessToken")
}

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync("refreshToken")
}

export const setAccessToken = async (token: string) => {
  await SecureStore.setItemAsync("accessToken", token)
}

export const setRefreshToken = async (token: string) => {
  await SecureStore.setItemAsync("refreshToken", token)
}

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync("accessToken")
  await SecureStore.deleteItemAsync("refreshToken")
}

// --- General Data ---

export const clearAllUserData = async () => {
  await SecureStore.deleteItemAsync("accessToken")
  await SecureStore.deleteItemAsync("refreshToken")
  await SecureStore.deleteItemAsync("auth-storage")
  // React Query cache is usually handled separately or via MMKV/SQLite in future
  // For now, we can't delete async storage keys via SecureStore, so we leave legacy cleanup
}

// --- Zustand Adapter ---

export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name)
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name)
  },
}
