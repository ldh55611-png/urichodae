CREATE TABLE `payments` (
	`order_id` text PRIMARY KEY NOT NULL,
	`invitation` text NOT NULL,
	`owner` text NOT NULL,
	`amount` integer NOT NULL,
	`mode` text NOT NULL,
	`status` text DEFAULT 'ready' NOT NULL,
	`payment_key` text DEFAULT '' NOT NULL,
	`method` text DEFAULT '' NOT NULL,
	`created` text NOT NULL,
	`approved` text DEFAULT '' NOT NULL
);
