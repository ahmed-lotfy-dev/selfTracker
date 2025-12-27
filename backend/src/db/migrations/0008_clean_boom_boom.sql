ALTER TABLE "workouts" ALTER COLUMN "training_split_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "is_public" boolean DEFAULT false;