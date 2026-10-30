CREATE TABLE `guest_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guest_sessions_owner_unique` ON `guest_sessions` (`owner`);--> statement-breakpoint
ALTER TABLE `invitations` ADD `entitlement` text DEFAULT 'free_beta' NOT NULL;