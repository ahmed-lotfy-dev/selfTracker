import { Pool } from 'pg'
import 'dotenv/config'

const url = process.env.DATABASE_URL!
const directUrl = url.replace('-pooler', '')

async function main() {
  console.log('Using direct endpoint:', new URL(directUrl).hostname)

  const pool = new Pool({ connectionString: directUrl, ssl: { rejectUnauthorized: false } })
  const client = await pool.connect()

  try {
    // Check current type
    const before = await client.query(`
      SELECT a.attname, a.atttypmod, format_type(a.atttypid, a.atttypmod) as formatted
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
      WHERE c.relname = 'embeddings' AND a.attname = 'embedding'
        AND a.attnum > 0 AND NOT a.attisdropped
    `)
    console.log('Before:', JSON.stringify(before.rows))

    // Drop old vector index first (it's tied to the old column)
    await client.query('DROP INDEX IF EXISTS idx_embeddings_vector')

    // Replace column with vector(1024)
    await client.query('ALTER TABLE embeddings DROP COLUMN IF EXISTS embedding')
    await client.query('ALTER TABLE embeddings ADD COLUMN embedding vector(1024) NOT NULL')

    // Recreate vector index (1024 dims is fine for ivfflat limit of 2000)
    await client.query('CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)')

    // Verify
    const after = await client.query(`
      SELECT a.attname, a.atttypmod, format_type(a.atttypid, a.atttypmod) as formatted
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
      WHERE c.relname = 'embeddings' AND a.attname = 'embedding'
        AND a.attnum > 0 AND NOT a.attisdropped
    `)
    console.log('After:', JSON.stringify(after.rows))

    // Test insert
    await client.query("INSERT INTO embeddings (user_id, resource_type, resource_id, content, embedding) VALUES ('debug', 'verify', 'v', 'test', array_fill(0.0, ARRAY[1024])::vector)")
    const test = await client.query("SELECT vector_dims(embedding)::text as dims FROM embeddings WHERE resource_type = 'verify'")
    console.log('Test vector dims:', test.rows[0].dims)
    await client.query("DELETE FROM embeddings WHERE resource_type = 'verify'")
    console.log('All good!')
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
