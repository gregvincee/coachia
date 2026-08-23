CREATE TABLE `betaWaitlistApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`consentedAt` timestamp NOT NULL DEFAULT (now()),
	`source` varchar(40) NOT NULL DEFAULT 'launch',
	`status` enum('waiting','invited','declined') NOT NULL DEFAULT 'waiting',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `betaWaitlistApplications_id` PRIMARY KEY(`id`),
	CONSTRAINT `betaWaitlistApplications_email_unique` UNIQUE(`email`)
);
