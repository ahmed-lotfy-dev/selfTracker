import { pgTable, varchar, timestamp, bigint, jsonb, serial, index } from "drizzle-orm/pg-core"

export const livestoreEvents = pgTable(
  "livestore_events",
  {
    id: serial("id").primaryKey(),
    storeId: varchar("store_id", { length: 255 }).notNull(),
    eventId: varchar("event_id", { length: 255 }).notNull().unique(),
    eventType: varchar("event_type", { length: 255 }).notNull(),
    eventData: jsonb("event_data").notNull(),
    timestamp: bigint("timestamp", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    seqNum: bigint("seq_num", { mode: "number" }),
  },
  (table) => ({
    storeTimestampIdx: index("idx_livestore_store_timestamp").on(table.storeId, table.timestamp),
    eventIdIdx: index("idx_livestore_event_id").on(table.eventId),
    storeSeqNumIdx: index("idx_livestore_store_seq_num").on(table.storeId, table.seqNum),
  })
)
