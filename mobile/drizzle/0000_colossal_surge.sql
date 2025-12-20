CREATE TABLE IF NOT EXISTS `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`table_name` text NOT NULL,
	`row_id` text NOT NULL,
	`data` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`due_date` text,
	`category` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`goal_type` text NOT NULL,
	`target_value` integer NOT NULL,
	`deadline` integer,
	`achieved` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `weight_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`weight` integer NOT NULL,
	`mood` text,
	`energy` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `workout_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workout_id` text NOT NULL,
	`workout_name` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`sync_status` text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`training_split_id` text,
	`created_at` text,
	`updated_at` text
);
