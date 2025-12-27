import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV({ id: 'selftracker-cache' })

export const mmkvStorage = {
  getItem: <T>(key: string): T | null => {
    const value = storage.getString(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },

  setItem: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value))
  },

  removeItem: (key: string): void => {
    storage.remove(key)
  },

  clearAll: (): void => {
    storage.clearAll()
  }
}

export const zustandMMKVStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name)
    return value ?? null
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value)
  },
  removeItem: (name: string) => {
    storage.remove(name)
  },
}
