CREATE TABLE IF NOT EXISTS `weight_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`weight` integer NOT NULL,
	`mood` text,
	`energy` text,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `workout_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workout_id` text NOT NULL,
	`workout_name` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);
