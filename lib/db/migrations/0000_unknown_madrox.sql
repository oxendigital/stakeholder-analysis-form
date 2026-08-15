CREATE TABLE `evaluations` (
	`id` text PRIMARY KEY NOT NULL,
	`venture_name` text NOT NULL,
	`entrepreneur_name` text NOT NULL,
	`industry` text NOT NULL,
	`date` text NOT NULL,
	`notes` text,
	`status` text DEFAULT 'completed' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stakeholder_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`evaluation_id` text NOT NULL,
	`stakeholder_key` text NOT NULL,
	`stakeholder_name` text NOT NULL,
	`category` text DEFAULT 'General',
	`triple_impact_dimension` text DEFAULT 'Transversal',
	`is_custom` integer DEFAULT false NOT NULL,
	`is_related` integer NOT NULL,
	`importance` text,
	`impact_on_venture` text,
	`impact_of_venture` text,
	`priority` text,
	`priority_score` integer DEFAULT 0,
	`strategic_action` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations`(`id`) ON UPDATE no action ON DELETE cascade
);
