CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category` text NOT NULL,
	`amount` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE `project_columns` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`type` text DEFAULT 'todo',
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#000000',
	`is_archived` integer DEFAULT false,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE `timer_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task_id` text,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`duration` integer,
	`type` text DEFAULT 'focus',
	`completed` integer DEFAULT false,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE `training_splits` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_by` text,
	`is_public` integer DEFAULT true,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `workout_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`sets` integer NOT NULL,
	`reps` integer NOT NULL,
	`weight` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`project_id` text,
	`column_id` text,
	`title` text NOT NULL,
	`description` text,
	`completed` integer DEFAULT false NOT NULL,
	`due_date` integer,
	`priority` text DEFAULT 'medium',
	`order` integer DEFAULT 0,
	`category` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "user_id", "project_id", "column_id", "title", "description", "completed", "due_date", "priority", "order", "category", "created_at", "updated_at", "deleted_at", "sync_status") SELECT "id", "user_id", "project_id", "column_id", "title", "description", "completed", "due_date", "priority", "order", "category", "created_at", "updated_at", "deleted_at", "sync_status" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_user_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`goal_type` text NOT NULL,
	`target_value` text NOT NULL,
	`deadline` integer,
	`achieved` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
INSERT INTO `__new_user_goals`("id", "user_id", "goal_type", "target_value", "deadline", "achieved", "created_at", "updated_at", "deleted_at", "sync_status") SELECT "id", "user_id", "goal_type", "target_value", "deadline", "achieved", "created_at", "updated_at", "deleted_at", "sync_status" FROM `user_goals`;--> statement-breakpoint
DROP TABLE `user_goals`;--> statement-breakpoint
ALTER TABLE `__new_user_goals` RENAME TO `user_goals`;--> statement-breakpoint
CREATE TABLE `__new_weight_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`weight` text NOT NULL,
	`mood` text,
	`energy` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
INSERT INTO `__new_weight_logs`("id", "user_id", "weight", "mood", "energy", "notes", "created_at", "updated_at", "deleted_at", "sync_status") SELECT "id", "user_id", "weight", "mood", "energy", "notes", "created_at", "updated_at", "deleted_at", "sync_status" FROM `weight_logs`;--> statement-breakpoint
DROP TABLE `weight_logs`;--> statement-breakpoint
ALTER TABLE `__new_weight_logs` RENAME TO `weight_logs`;--> statement-breakpoint
CREATE TABLE `__new_workout_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workout_id` text NOT NULL,
	`workout_name` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
INSERT INTO `__new_workout_logs`("id", "user_id", "workout_id", "workout_name", "notes", "created_at", "updated_at", "deleted_at", "sync_status") SELECT "id", "user_id", "workout_id", "workout_name", "notes", "created_at", "updated_at", "deleted_at", "sync_status" FROM `workout_logs`;--> statement-breakpoint
DROP TABLE `workout_logs`;--> statement-breakpoint
ALTER TABLE `__new_workout_logs` RENAME TO `workout_logs`;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`training_split_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
INSERT INTO `__new_workouts`("id", "user_id", "name", "training_split_id", "created_at", "updated_at", "deleted_at", "sync_status") SELECT "id", "user_id", "name", "training_split_id", "created_at", "updated_at", "deleted_at", "sync_status" FROM `workouts`;--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;