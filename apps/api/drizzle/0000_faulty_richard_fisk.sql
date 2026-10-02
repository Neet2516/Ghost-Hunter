CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`recruiter_name` text NOT NULL,
	`recruiter_contact` text,
	`outreach_channel` text NOT NULL,
	`outreach_context` text NOT NULL,
	`outreach_sent_at` text NOT NULL,
	`delay_ms` integer NOT NULL,
	`max_follow_ups` integer NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`sub_status` text,
	`next_action_at` text,
	`workflow_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_workflow_id_unique` ON `applications` (`workflow_id`);--> statement-breakpoint
CREATE INDEX `applications_status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`at` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `events_application_at_idx` ON `events` (`application_id`,`at`);--> statement-breakpoint
CREATE TABLE `followups` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`stage` integer NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`source` text NOT NULL,
	`status` text DEFAULT 'GENERATING' NOT NULL,
	`edited_body` text,
	`created_at` text NOT NULL,
	`decided_at` text,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `followups_application_id_idx` ON `followups` (`application_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`kind` text NOT NULL,
	`message` text NOT NULL,
	`read_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_application_created_idx` ON `notifications` (`application_id`,`created_at`);