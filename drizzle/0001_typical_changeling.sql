CREATE TABLE `cms_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `cms_admin` ADD `username` text;