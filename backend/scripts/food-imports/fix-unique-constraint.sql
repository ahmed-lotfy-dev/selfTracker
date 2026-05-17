DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_foods_source_source_id'
  ) THEN
    ALTER TABLE foods
      ADD CONSTRAINT uq_foods_source_source_id
      UNIQUE (source, source_id);
  END IF;
END $$;
