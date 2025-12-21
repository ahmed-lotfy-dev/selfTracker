CREATE TABLE "livestore_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" varchar(255) NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"event_type" varchar(255) NOT NULL,
	"event_data" jsonb NOT NULL,
	"timestamp" bigint NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "livestore_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
ALTER TABLE "weight_logs" ALTER COLUMN "energy" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "weight_logs" ALTER COLUMN "mood" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "training_splits" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_goals" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "project_columns" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "idx_livestore_store_timestamp" ON "livestore_events" USING btree ("store_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_livestore_event_id" ON "livestore_events" USING btree ("event_id");--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;