-- Migration: Add pgvector extension and embeddings table
-- Run this on Neon PostgreSQL before deploying the AI assistant feature

-- 1. Enable pgvector extension (Neon supports this natively)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  content text NOT NULL,
  embedding vector(1024) NOT NULL,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_embeddings_user_resource
  ON embeddings (user_id, resource_type);

CREATE INDEX IF NOT EXISTS idx_embeddings_vector
  ON embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Unique constraint for upsert operations (resource_type + resource_id)
-- This ensures one embedding per resource record
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
