CREATE TABLE `guest_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation` text NOT NULL,
	`uploader` text DEFAULT '' NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation` text NOT NULL,
	`name` text NOT NULL,
	`side` text NOT NULL,
	`attending` integer NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`meal` text DEFAULT '' NOT NULL,
	`bus` integer DEFAULT 0 NOT NULL,
	`bus_count` integer DEFAULT 0 NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created` text NOT NULL
);
