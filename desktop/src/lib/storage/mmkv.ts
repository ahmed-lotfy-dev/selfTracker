export const mmkvStorage = {
  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('[Storage] Failed to set item:', e)
    }
  },
  getItem: <T>(key: string): T | null => {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (e) {
      console.error('[Storage] Failed to get item:', e)
      return null
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key)
  },
  clearAll: () => {
    localStorage.clear()
  }
}
