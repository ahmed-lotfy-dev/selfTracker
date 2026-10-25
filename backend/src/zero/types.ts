import type { schema } from "./schema"
import type { zqlDb } from "./db-provider"

/**
 * Context handed to queries and mutators. The server-side Zero endpoints build
 * it from the Better Auth session (`userID`)); the mobile client MUST pass the
 * same shape via the `context` option of `new Zero({ context })` (it becomes
 * required once registered here).
 *
 * NOTE: mutators must NEVER trust `args` for ownership — always use `ctx.userID`.
 */
export type ZeroContext = { readonly userID: string }

/**
 * Register the app's Zero types via declaration merging so that
 * `defineQuery`, `defineMutator`, `createBuilder` etc. are schema/ctx/tx aware
 * without passing generics everywhere.
 */
declare module "@rocicorp/zero" {
  interface DefaultTypes {
    schema: typeof schema;
    context: ZeroContext;
    dbProvider: typeof zqlDb;
  }
}
