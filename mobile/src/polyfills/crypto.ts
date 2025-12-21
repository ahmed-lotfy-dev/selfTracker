import * as Crypto from 'expo-crypto'

if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {}
}

if (!(global as any).crypto.getRandomValues) {
  (global as any).crypto.getRandomValues = (array: Uint8Array) => {
    const randomBytes = Crypto.getRandomBytes(array.length)
    array.set(randomBytes)
    return array
  }
}

if (!(global as any).crypto.randomUUID) {
  (global as any).crypto.randomUUID = () => Crypto.randomUUID()
}

