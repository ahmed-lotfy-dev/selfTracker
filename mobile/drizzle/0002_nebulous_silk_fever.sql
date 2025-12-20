CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`table_name` text NOT NULL,
	`row_id` text NOT NULL,
	`data` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `tasks` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `sync_status` text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `weight_logs` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `weight_logs` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `weight_logs` ADD `sync_status` text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `workout_logs` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `workout_logs` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `workout_logs` ADD `sync_status` text DEFAULT 'pending';