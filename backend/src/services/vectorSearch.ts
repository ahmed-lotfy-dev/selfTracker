import { sql } from "drizzle-orm"
import { db } from "../db"
import { embeddings } from "../db/schema/embeddings"
import { generateEmbedding } from "./embedding"

export interface SearchResult {
  resourceType: string
  resourceId: string
  content: string
  similarity: number
}

export async function searchUserData(
  userId: string,
  query: string,
  limit: number = 10,
  resourceTypes?: string[]
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query, "query")

  const embeddingStr = `[${queryEmbedding.join(",")}]`

  const results = await db.execute(sql`
    SELECT
      e.resource_type,
      e.resource_id,
      e.content,
      1 - (e.embedding <=> ${embeddingStr}::vector) AS similarity
    FROM ${embeddings} e
    WHERE e.user_id = ${userId}
      ${resourceTypes ? sql`AND e.resource_type = ANY(${resourceTypes})` : sql``}
    ORDER BY e.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `)

  return (results.rows || []).map((row: any) => ({
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    content: row.content,
    similarity: parseFloat(row.similarity),
  }))
}

export async function getUserDataCounts(
  userId: string
): Promise<Record<string, number>> {
  const results = await db.execute(sql`
    SELECT resource_type, COUNT(*) as count
    FROM ${embeddings}
    WHERE user_id = ${userId}
    GROUP BY resource_type
  `)

  const counts: Record<string, number> = {}
  for (const row of results.rows || []) {
    counts[(row as any).resource_type] = parseInt((row as any).count)
  }
  return counts
}
