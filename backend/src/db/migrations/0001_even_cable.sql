CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."column_type" AS ENUM('todo', 'doing', 'done');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('focus', 'short_break', 'long_break');--> statement-breakpoint
CREATE TABLE "project_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"type" "column_type" DEFAULT 'todo',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#000000',
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timer_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"task_id" uuid,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" integer,
	"type" "session_type" DEFAULT 'focus',
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "expenses" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "task_items" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "user_goals" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "weight_logs" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "workout_logs" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "task_items" DROP CONSTRAINT "task_items_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_goals" DROP CONSTRAINT "user_goals_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "weight_logs" DROP CONSTRAINT "weight_logs_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "task_items" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "task_items" ADD COLUMN "column_id" uuid;--> statement-breakpoint
ALTER TABLE "task_items" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "task_items" ADD COLUMN "priority" "task_priority" DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "task_items" ADD COLUMN "order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "task_items" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dateOfBirth" date;--> statement-breakpoint
ALTER TABLE "weight_logs" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "workout_logs" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "project_columns" ADD CONSTRAINT "project_columns_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_task_id_task_items_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_items" ADD CONSTRAINT "task_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_items" ADD CONSTRAINT "task_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_items" ADD CONSTRAINT "task_items_column_id_project_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."project_columns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_logs" ADD CONSTRAINT "weight_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;