CREATE TABLE `generated_letters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`letterType` enum('cancellation','complaint','reimbursement','admin_request') NOT NULL,
	`title` varchar(255),
	`content` text,
	`formData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_letters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_procedures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`procedureKey` varchar(128) NOT NULL,
	`completedSteps` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_procedures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`deadlineAt` int,
	`status` enum('todo','in_progress','done') NOT NULL DEFAULT 'todo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `ageGroup` enum('junior','teen','adult','senior');--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(128);