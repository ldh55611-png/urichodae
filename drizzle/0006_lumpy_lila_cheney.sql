ALTER TABLE `invitations` ADD `keep` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `invitations` ADD `purged` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `product` text DEFAULT 'publish' NOT NULL;