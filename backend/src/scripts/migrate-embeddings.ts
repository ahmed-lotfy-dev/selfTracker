import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  console.log('Connecting to Neon...')

  try {
    // Check pgvector
    const ext = await sql`SELECT extname FROM pg_extension WHERE extname = 'vector'`
    console.log('pgvector extension:', ext.length > 0 ? 'EXISTS' : 'NOT FOUND')

    // Check embeddings table
    const table = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'embeddings'
    `
    console.log('embeddings table:', table.length > 0 ? 'EXISTS' : 'NOT FOUND')

    if (ext.length === 0) {
      console.log('\nCreating pgvector extension...')
      await sql`CREATE EXTENSION IF NOT EXISTS vector`
      console.log('pgvector extension created!')
    }

    if (table.length === 0) {
      console.log('\nCreating embeddings table...')
      await sql`
        CREATE TABLE IF NOT EXISTS embeddings (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id text NOT NULL,
          resource_type text NOT NULL,
          resource_id text NOT NULL,
          content text NOT NULL,
          embedding vector(1024) NOT NULL,
          created_at timestamp DEFAULT NOW(),
          updated_at timestamp DEFAULT NOW()
        )
      `
      console.log('embeddings table created!')

      console.log('Creating indexes...')
      await sql`CREATE INDEX IF NOT EXISTS idx_embeddings_user_resource ON embeddings (user_id, resource_type)`
      await sql`CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`
      console.log('Indexes created!')

      console.log('Adding unique constraint...')
      await sql`
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
      `
      console.log('Unique constraint added!')
    }

    console.log('\n=== Migration complete! ===')
  } catch (err: any) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
