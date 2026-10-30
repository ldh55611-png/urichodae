CREATE TABLE `guestbook` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation` text NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`pw_hash` text NOT NULL,
	`created` text NOT NULL
);
