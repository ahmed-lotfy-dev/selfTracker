import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core"
import { vector } from "./pgvector"

export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_embeddings_user_resource").on(table.userId, table.resourceType),
    index("idx_embeddings_vector").using(
      "ivfflat",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
)
