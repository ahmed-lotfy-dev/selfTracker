/**
 * PowerSync has been retired in favour of Zero (see `src/zero/`).
 *
 * Tasks and habits now sync through Zero; the remaining tables (workouts,
 * weight logs, food logs) never had a working PowerSync upload and are still
 * local-only. This module is kept as a no-op shim so those stores keep
 * type-checking without dragging `@powersync/*` native modules into the bundle
 * or hammering the dead `powersync.ahmedlotfy.site` endpoint.
 *
 * New code should use `getZero()` from `@/src/zero/client`.
 */

type NoopDatabase = {
  execute: (sql: string, params?: unknown[]) => Promise<void>
}

const noopDatabase: NoopDatabase = {
  execute: async () => {},
}

let warned = false

export async function getPowerSyncDB(): Promise<NoopDatabase> {
  if (!warned) {
    warned = true
    console.warn('[PowerSync] disabled — Zero is the sync engine now (writes are local-only)')
  }
  return noopDatabase
}

export async function disconnectPowerSync(): Promise<void> {
  // Nothing to disconnect.
}

export function getPowerSyncInstance(): null {
  return null
}
