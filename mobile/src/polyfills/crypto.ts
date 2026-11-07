import * as Crypto from 'expo-crypto'

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = {}
}

if (!(globalThis as any).crypto.getRandomValues) {
  (globalThis as any).crypto.getRandomValues = (array: Uint8Array) => {
    const randomBytes = Crypto.getRandomBytes(array.length)
    array.set(randomBytes)
    return array
  }
}

if (!(globalThis as any).crypto.randomUUID) {
  (globalThis as any).crypto.randomUUID = () => Crypto.randomUUID()
}

