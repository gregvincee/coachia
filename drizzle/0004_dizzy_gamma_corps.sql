CREATE TABLE `betaCohortFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `betaCohortFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `betaCohortMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`latestActivityAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `betaCohortMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `betaCohortMembers_userId_unique` UNIQUE(`userId`)
);
