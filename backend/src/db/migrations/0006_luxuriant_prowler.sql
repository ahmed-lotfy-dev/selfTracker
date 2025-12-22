ALTER TABLE "livestore_events" ADD COLUMN "seq_num" bigint;--> statement-breakpoint

DO $$
BEGIN
    -- Populate seq_num for existing events strictly sequentially per store
    WITH sequential_events AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY timestamp, id) as calculated_seq_num
      FROM livestore_events
    )
    UPDATE livestore_events
    SET seq_num = sequential_events.calculated_seq_num
    FROM sequential_events
    WHERE livestore_events.id = sequential_events.id;
END $$;--> statement-breakpoint

ALTER TABLE "livestore_events" ALTER COLUMN "seq_num" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_livestore_store_seq_num" ON "livestore_events" USING btree ("store_id","seq_num");