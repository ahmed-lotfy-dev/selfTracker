import { Zero } from "@rocicorp/zero"
import { expoSQLiteStoreProvider } from "@rocicorp/zero/expo-sqlite"
import { schema } from "./schema"
import { mutators } from "./mutators"
import { startZeroSync } from "./sync"

/**
 * Single Zero client instance for the app.
 *
 * Zero replaces the old PowerSync connection: it keeps a local SQLite replica
 * (`expo-sqlite`), applies optimistic mutations, and pushes/pulls through
 * zero-cache at https://zero.alotfy.site. Auth is the Better Auth bearer token
 * stored by `useAuthStore`; zero-cache forwards it as `Authorization: Bearer …`
 * to /api/zero/query and /api/zero/mutate.
 */

export const ZERO_CACHE_URL =
  process.env.EXPO_PUBLIC_ZERO_URL || "https://zero.alotfy.site"

export type AppZero = ReturnType<typeof createAppZero>

/** One SQLite store provider shared by every Zero instance (and by logout purge). */
const storeProvider = expoSQLiteStoreProvider()

/**
 * `new Zero` infers its mutator-registry generic from the options, so the
 * instance type is derived here instead of spelled out (the class constraint in
 * 1.11.3 still points at the legacy `CustomMutatorDefs` shape, which the
 * `defineMutators` registry intentionally does not extend).
 */
function createAppZero(userID: string, token: string) {
  return new Zero({
    cacheURL: ZERO_CACHE_URL,
    userID,
    auth: token,
    context: { userID },
    schema,
    mutators,
    kvStore: storeProvider,
    logLevel: __DEV__ ? "info" : "error",
    // RN has no `location.reload`; a schema/version break just needs a fresh
    // instance once the next app update lands.
    onUpdateNeeded: (reason) => {
      console.warn("[Zero] app update needed:", reason.type, reason.message ?? "")
    },
    onClientStateNotFound: () => {
      console.warn("[Zero] client state not found — rebuilding local replica")
      // Defer: we are inside Zero's own error handler, closing the instance
      // synchronously here would re-enter it.
      setTimeout(() => {
        if (!lastAuth) return
        teardownZero(true)
        ensureZero(lastAuth.userID, lastAuth.token)
      }, 500)
    },
    onStorageFailure: (failure) => {
      console.warn("[Zero] local storage failure:", failure.kind, failure.message)
    },
  })
}

let instance: AppZero | null = null
let instanceUserID: string | null = null
let detachSync: (() => void) | null = null
let lastAuth: { userID: string; token: string } | null = null

export function getZero(): AppZero | null {
  return instance
}

export function getZeroUserID(): string | null {
  return instanceUserID
}

/**
 * Creates (or reuses) the Zero client for `userID` and starts the store
 * subscriptions. Safe to call repeatedly, e.g. when the token is refreshed:
 * same user → just updates auth, different user → tears the old client down.
 */
export function ensureZero(userID: string, token: string): AppZero {
  if (instance && instanceUserID === userID) {
    void instance.connection.connect({ auth: token }).catch((err) => {
      console.warn("[Zero] auth refresh failed:", err)
    })
    return instance
  }

  teardownZero()

  lastAuth = { userID, token }
  instance = createAppZero(userID, token)
  instanceUserID = userID
  detachSync = startZeroSync(instance)
  console.log(`[Zero] connected as ${userID} → ${ZERO_CACHE_URL}`)
  return instance
}

/**
 * Stops subscriptions and closes the client. Pass `true` to also drop the
 * local SQLite replica (used after a fatal state reset; logout calls
 * `purgeZeroStorage` for full cleanup).
 */
export function teardownZero(dropStorage = false): void {
  const name = instance?.idbName
  detachSync?.()
  detachSync = null
  try {
    instance?.close()
  } catch (err) {
    console.warn("[Zero] close failed:", err)
  }
  instance = null
  instanceUserID = null
  if (dropStorage && name) {
    void storeProvider.drop(name).catch((err) => {
      console.warn("[Zero] dropping local replica failed:", err)
    })
  }
}

/** Closes Zero and deletes the local replica — call on logout. */
export async function purgeZeroStorage(): Promise<void> {
  const name = instance?.idbName
  lastAuth = null
  teardownZero()
  if (!name) return
  try {
    await storeProvider.drop(name)
    console.log("[Zero] local replica dropped")
  } catch (err) {
    console.warn("[Zero] failed to drop local replica:", err)
  }
}
