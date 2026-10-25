import { Hono } from "hono"
import { auth } from "../../lib/auth"
import { mustGetQuery, type AnyQuery } from "@rocicorp/zero"
import { handleQueryRequest } from "@rocicorp/zero/server"
import {
  handleMutateRequest,
  type MutateRequestHandler,
} from "@rocicorp/zero/server"
import { mustGetMutator } from "@rocicorp/zero"
import { schema } from "../zero/schema"
import { zqlDb } from "../zero/db-provider"
import { queries } from "../zero/queries"
import { mutators } from "../zero/mutators"
import type { ZeroContext } from "../zero/types"

/**
 * Zero sync-engine endpoints. zero-cache (https://zero.alotfy.site) forwards
 * the client's token in `Authorization: Bearer …` to these URLs; Better Auth's
 * bearer() plugin resolves it to a session below.
 *
 * Registered in src/index.ts BEFORE the /api/* authMiddleware because
 * zero-cache cannot pre-login — we do our own session check and the
 * 401/403 here is what drives the client into Zero's `needs-auth` state.
 */

/**
 * Builds the authenticated context used by every named query and mutator.
 * Returns null when unauthenticated (→ caller responds 401 so Zero transitions
 * the client to needs-auth instead of silently failing).
 */
async function getZeroContextOr401(
  headers: Headers,
): Promise<{ userID: string } | null> {
  const session = await auth.api.getSession({ headers })
  if (!session?.user?.id) return null
  return { userID: session.user.id }
}

export const zeroRouter = new Hono()

zeroRouter.post("/query", async (c) => {
  const ctxOr401 = await getZeroContextOr401(c.req.raw.headers)
  if (!ctxOr401) {
    return c.json({ error: "Unauthorized", message: "Invalid or expired session" }, 401)
  }
  const ctx: ZeroContext = { userID: ctxOr401.userID }

  const response = await handleQueryRequest({
    schema,
    request: c.req.raw,
    userID: ctx.userID,
    handler: (name, args) =>
      // Cast: `Query<typeof schema…>` → `AnyQuery`. 1.11 has a structural-variance
      // quirk between typed query returns and the handler's AnyQuery return;
      // value-level shape is unchanged.
      mustGetQuery(queries, name)({ args, ctx }) as unknown as AnyQuery,
  })

  // QueryResponse is a plain JSON object (see zero-protocol/query-server).
  return c.json(response)
})

zeroRouter.post("/mutate", async (c) => {
  const ctxOr401 = await getZeroContextOr401(c.req.raw.headers)
  if (!ctxOr401) {
    return c.json({ error: "Unauthorized", message: "Invalid or expired session" }, 401)
  }
  const ctx: ZeroContext = { userID: ctxOr401.userID }

  const handler: MutateRequestHandler<typeof zqlDb> = (transact, _mutation) =>
    transact(async (tx, name, args) =>
      mustGetMutator(mutators, name).fn({ tx, args, ctx }),
    )

  const response = await handleMutateRequest({
    dbProvider: zqlDb,
    request: c.req.raw,
    userID: ctx.userID,
    handler,
  })

  // MutateResponse is a plain JSON object (see zero-protocol/mutate-server).
  return c.json(response)
})

export default zeroRouter
