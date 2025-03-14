ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_exercise_id_exercises_id_fk";
--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP COLUMN "revoked";--> statement-breakpoint
ALTER TABLE "workout_logs" DROP COLUMN "exercise_id";