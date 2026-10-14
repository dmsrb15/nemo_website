CREATE TABLE `cms_gc` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cms_views` (
	`key` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`stamp` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `cms_admin` ADD `role` text DEFAULT 'editor' NOT NULL;--> statement-breakpoint
ALTER TABLE `cms_admin` ADD `active` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `cms_admin` ADD `created` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `cms_admin` ADD `last_login` integer;--> statement-breakpoint
ALTER TABLE `cms_posts` ADD `author_id` text;--> statement-breakpoint
ALTER TABLE `cms_posts` ADD `editor_id` text;--> statement-breakpoint
ALTER TABLE `cms_posts` ADD `archived_at` integer;--> statement-breakpoint
ALTER TABLE `cms_posts` ADD `sort_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `cms_posts` ADD `views` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `cms_sessions` ADD `admin_id` text DEFAULT 'owner' NOT NULL;
--> statement-breakpoint
UPDATE cms_posts SET archived_at=updated WHERE status='archived' AND archived_at IS NULL;
--> statement-breakpoint
UPDATE cms_admin SET role='master' WHERE id='owner';
