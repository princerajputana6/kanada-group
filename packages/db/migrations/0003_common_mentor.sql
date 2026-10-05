ALTER TABLE `enrollments` ADD `payment_status` text DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
ALTER TABLE `enrollments` ADD `amount` integer;--> statement-breakpoint
ALTER TABLE `enrollments` ADD `payment_screenshot_key` text;--> statement-breakpoint
ALTER TABLE `enrollments` ADD `paid_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `whatsapp` text;--> statement-breakpoint
ALTER TABLE `users` ADD `qualification` text;--> statement-breakpoint
ALTER TABLE `users` ADD `branch` text;--> statement-breakpoint
ALTER TABLE `users` ADD `completion_year` text;--> statement-breakpoint
ALTER TABLE `users` ADD `affiliation` text;--> statement-breakpoint
ALTER TABLE `users` ADD `work_experience` text;--> statement-breakpoint
ALTER TABLE `users` ADD `prior_tools` text;--> statement-breakpoint
ALTER TABLE `users` ADD `interest_field` text;--> statement-breakpoint
ALTER TABLE `users` ADD `resume_key` text;