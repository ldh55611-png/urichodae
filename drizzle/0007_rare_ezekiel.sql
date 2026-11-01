CREATE TABLE `visits` (
	`day` text NOT NULL,
	`kind` text NOT NULL,
	`visitor` text NOT NULL,
	`views` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`day`, `kind`, `visitor`)
);
