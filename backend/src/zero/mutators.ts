import { defineMutators, defineMutator, type Transaction } from "@rocicorp/zero"
import { z } from "zod"
import "./types"

/**
 * Custom mutators — the ONLY write path allowed over the Zero wire
 * (zero-cache runs with ZERO_ENABLE_CRUD_MUTATIONS=false).
 *
 * These definitions are mirrored 1:1 in the mobile app so optimistic writes
 * apply locally and the server applies them authoritatively (the server
 * endpoint injects the Better Auth userID — never trust args for ownership).
 */

/** pg error codes worth retrying the mutator run for (serialization/deadlock/etc). */
function isSerializationError(error: unknown): boolean {
  const code =
    typeof error === "object" && error !== null
      ? (error as { code?: unknown }).code
      : undefined
  return (
    typeof code === "string" &&
    (code === "40001" || code === "40P01" || code.startsWith("23") || code.startsWith("40"))
  )
}

/** Registers the retry predicate; no-op on the client (client tx has no retryOn). */
function retryOnSerialization(tx: Transaction): void {
  if ("retryOn" in tx) {
    tx.retryOn(isSerializationError)
  }
}

const taskArgs = z.object({
  id: z.string().min(1),
  userId: z.string().min(1).optional(), // allowed but ignored server-side (ctx wins)
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  completed: z.boolean().optional(),
  dueDate: z.number().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).nullable().optional(),
  order: z.number().nullable().optional(),
  category: z.string().nullable().optional(),
})

const habitArgs = z.object({
  id: z.string().min(1),
  userId: z.string().min(1).optional(), // allowed but ignored server-side (ctx wins)
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  streak: z.number().optional(),
  color: z.string().nullable().optional(),
  completedToday: z.boolean().optional(),
  completionDates: z.array(z.string()).optional(),
  lastCompletedAt: z.number().nullable().optional(),
})

/** Remove undefined properties in-place so ZQL insert()/update() doesn't choke on them. */
function compact<T extends object>(input: T): T {
  for (const key of Object.keys(input) as (keyof T)[]) {
    if (input[key] === undefined) delete input[key]
  }
  return input
}

export const mutators = defineMutators({
  task: {
    insert: defineMutator(taskArgs, async ({ tx, args, ctx }) => {
      retryOnSerialization(tx)
      const now = Date.now()
      await tx.mutate.task.insert(compact({
        id: args.id,
        userId: ctx.userID, // server-authoritative ownership
        title: args.title,
        description: args.description,
        completed: args.completed ?? false,
        dueDate: args.dueDate,
        priority: args.priority ?? "medium",
        order: args.order,
        category: args.category,
        createdAt: now,
        updatedAt: now,
      }))
    }),
    update: defineMutator(taskArgs, async ({ tx, args }) => {
      retryOnSerialization(tx)
      const { id, userId: _ignored, ...fields } = args
      await tx.mutate.task.update(compact({
        ...fields,
        id,
        updatedAt: Date.now(),
      }))
    }),
    /**
     * Soft delete (mirrors the REST routes' deletedAt semantics): the row stays
     * in PG but vanishes from every client query, which filter `deletedAt IS null`.
     */
    delete: defineMutator(z.object({ id: z.string().min(1) }), async ({ tx, args }) => {
      retryOnSerialization(tx)
      const now = Date.now()
      await tx.mutate.task.update({ id: args.id, deletedAt: now, updatedAt: now })
    }),
  },

  habit: {
    insert: defineMutator(habitArgs, async ({ tx, args, ctx }) => {
      retryOnSerialization(tx)
      const now = Date.now()
      await tx.mutate.habit.insert(compact({
        id: args.id,
        userId: ctx.userID,
        name: args.name,
        description: args.description,
        streak: args.streak ?? 0,
        color: args.color,
        completedToday: args.completedToday ?? false,
        completionDates: args.completionDates ?? [],
        lastCompletedAt: args.lastCompletedAt,
        createdAt: now,
        updatedAt: now,
      }))
    }),
    update: defineMutator(habitArgs, async ({ tx, args }) => {
      retryOnSerialization(tx)
      const { id, userId: _ignored, ...fields } = args
      await tx.mutate.habit.update(compact({
        ...fields,
        id,
        updatedAt: Date.now(),
      }))
    }),
    delete: defineMutator(z.object({ id: z.string().min(1) }), async ({ tx, args }) => {
      retryOnSerialization(tx)
      const now = Date.now()
      await tx.mutate.habit.update({ id: args.id, deletedAt: now, updatedAt: now })
    }),
  },
})
