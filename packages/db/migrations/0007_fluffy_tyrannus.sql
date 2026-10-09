CREATE TABLE `coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`discount_type` text NOT NULL,
	`discount_value` integer NOT NULL,
	`course_id` text,
	`max_redemptions` integer,
	`valid_from` integer,
	`valid_until` integer,
	`active` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `support_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`author_id` text,
	`body` text NOT NULL,
	`from_staff` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`number` integer NOT NULL,
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`category` text DEFAULT 'GENERAL' NOT NULL,
	`priority` text DEFAULT 'NORMAL' NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`course_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`last_activity_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `support_tickets_number_unique` ON `support_tickets` (`number`);--> statement-breakpoint
ALTER TABLE `enrollments` ADD `payment_note` text;--> statement-breakpoint
ALTER TABLE `enrollments` ADD `coupon_id` text REFERENCES coupons(id);--> statement-breakpoint
ALTER TABLE `enrollments` ADD `coupon_code` text;--> statement-breakpoint
ALTER TABLE `enrollments` ADD `discount` integer;