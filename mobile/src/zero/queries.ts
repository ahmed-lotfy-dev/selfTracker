import { defineQueries, defineQuery, createBuilder } from "@rocicorp/zero"
import { z } from "zod"
import { schema } from "./schema"
import "./types"

const builder = createBuilder(schema)

/**
 * Named queries the mobile app reads via `useQuery(...)` on the client and
 * which are resolved server-side by /api/zero/query via mustGetQuery.
 *
 * All queries are hard-scoped to the authenticated user through ctx.userID —
 * the endpoint builds ctx from the Better Auth session, so the client cannot
 * widen the filter.
 */
export const queries = defineQueries({
  tasks: defineQuery(({ ctx }) =>
    builder.task
      .where("userId", ctx.userID)
      .where("deletedAt", "IS", null)
      .orderBy("createdAt", "desc"),
  ),

  taskById: defineQuery(
    z.object({ id: z.string() }),
    ({ ctx, args }) =>
      builder.task
        .where("id", args.id)
        .where("userId", ctx.userID)
        .one(),
  ),

  habits: defineQuery(({ ctx }) =>
    builder.habit
      .where("userId", ctx.userID)
      .where("deletedAt", "IS", null)
      .orderBy("createdAt", "desc"),
  ),

  habitById: defineQuery(
    z.object({ id: z.string() }),
    ({ ctx, args }) =>
      builder.habit
        .where("id", args.id)
        .where("userId", ctx.userID)
        .one(),
  ),
})
