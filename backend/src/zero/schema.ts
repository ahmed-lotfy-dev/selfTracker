import {
  createSchema,
  table,
  string,
  number,
  boolean,
  json,
  enumeration,
} from "@rocicorp/zero"

/**
 * Zero (ZQL) schema — hand-written mirror of backend/src/db/schema.
 *
 * Rules kept in sync with the Drizzle tables:
 *  - ZQL column names are camelCase; `.from("snake_case")` maps to the PG column.
 *  - PG `timestamptz` → ZQL `number` (epoch milliseconds).
 *  - PG `text[]` (`completion_dates`) → ZQL `json` (array of strings).
 *  - PG enum `task_priority` → ZQL `enumeration<"low" | "medium" | "high">`.
 *  - Nullable PG columns → `.optional()`; NOT NULL columns must not be optional.
 *
 * First sync slice: `task_items` + `habits` only. Add more tables here as the
 * app grows (keep 1:1 with the tables listed in the `zero_data` publication).
 */

const task = table("task")
  .from("task_items")
  .columns({
    id: string().from("id"),
    userId: string().from("user_id"),
    projectId: string().from("project_id").optional(),
    columnId: string().from("column_id").optional(),
    title: string().from("title"),
    description: string().from("description").optional(),
    completed: boolean().from("completed").optional(),
    dueDate: number().from("due_date").optional(),
    priority: enumeration<"low" | "medium" | "high">().from("priority").optional(),
    order: number().from("order").optional(),
    category: string().from("category").optional(),
    createdAt: number().from("created_at").optional(),
    updatedAt: number().from("updated_at").optional(),
    completedAt: number().from("completed_at").optional(),
    deletedAt: number().from("deleted_at").optional(),
  })
  .primaryKey("id")

const habit = table("habit")
  .from("habits")
  .columns({
    id: string().from("id"),
    userId: string().from("user_id"),
    name: string().from("name"),
    description: string().from("description").optional(),
    streak: number().from("streak").optional(),
    color: string().from("color").optional(),
    completedToday: boolean().from("completed_today").optional(),
    completionDates: json<string[]>().from("completion_dates").optional(),
    lastCompletedAt: number().from("last_completed_at").optional(),
    createdAt: number().from("created_at").optional(),
    updatedAt: number().from("updated_at").optional(),
    deletedAt: number().from("deleted_at").optional(),
  })
  .primaryKey("id")

export const schema = createSchema({
  tables: [task, habit],
})
