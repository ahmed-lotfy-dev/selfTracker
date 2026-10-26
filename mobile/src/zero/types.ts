import type { schema } from "./schema"

/**
 * Context handed to every Zero query/mutator on the client. Must match the
 * server-side `ZeroContext` in `backend/src/zero/types.ts` — the client uses it
 * to build the local ZQL AST for optimistic reads/writes, the server rebuilds
 * it from the Better Auth session.
 *
 * NOTE: mutators must NEVER trust `args` for ownership — always use `ctx.userID`.
 */
export type ZeroContext = { readonly userID: string }

/**
 * Register the mobile app's Zero types (schema + context). The server registers
 * the same schema/context plus its Drizzle `dbProvider`; `dbProvider` has no
 * meaning on the device and is intentionally omitted here.
 */
declare module "@rocicorp/zero" {
  interface DefaultTypes {
    schema: typeof schema;
    context: ZeroContext;
  }
}
