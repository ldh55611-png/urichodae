ALTER TABLE `invitations` ADD `published_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `invitations` SET `published_at`=`updated` WHERE `published`=1;