import { zeroDrizzle } from "@rocicorp/zero/server/adapters/drizzle"
import { db } from "../db"
import { schema } from "./schema"

/**
 * Zero "dbProvider" — wraps the existing Drizzle pg pool so that:
 *  - `handleMutateRequest` can run authoritative mutator transactions,
 *  - named queries run against the same Postgres upstream (via ZQL AST→SQL).
 *
 * Reuses the ONE `db` instance from src/db — no second pool.
 */
export const zqlDb = zeroDrizzle(schema, db)

export type ZqlDbFn = typeof zqlDb
