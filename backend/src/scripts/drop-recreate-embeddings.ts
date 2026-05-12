import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  console.log('Dropping old embeddings table...')
  await sql.unsafe('DROP TABLE IF EXISTS embeddings CASCADE')

  console.log('Creating embeddings table with vector(4096)...')
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS embeddings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id text NOT NULL,
      resource_type text NOT NULL,
      resource_id text NOT NULL,
      content text NOT NULL,
      embedding vector(4096) NOT NULL,
      created_at timestamp DEFAULT NOW(),
      updated_at timestamp DEFAULT NOW()
    )
  `)

  console.log('Creating indexes...')
  await sql.unsafe('CREATE INDEX IF NOT EXISTS idx_embeddings_user_resource ON embeddings (user_id, resource_type)')
  await sql.unsafe('CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)')

  console.log('Adding unique constraint...')
  await sql.unsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_embeddings_resource'
      ) THEN
        ALTER TABLE embeddings
          ADD CONSTRAINT uq_embeddings_resource
          UNIQUE (resource_type, resource_id);
      END IF;
    END $$;
  `)

  console.log('\n=== Done! Table recreated with vector(4096) ===')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
