import * as Crypto from 'expo-crypto'

if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {
    getRandomValues: (array: Uint8Array) => {
      const randomBytes = Crypto.getRandomBytes(array.length)
      array.set(randomBytes)
      return array
    },
  }
}
