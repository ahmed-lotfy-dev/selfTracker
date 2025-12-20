CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`training_split_id` text,
	`created_at` text,
	`updated_at` text
);
