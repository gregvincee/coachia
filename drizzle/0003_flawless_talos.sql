CREATE TABLE `aiDailyUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day` varchar(10) NOT NULL,
	`requestCount` int NOT NULL DEFAULT 0,
	`promptTokens` int NOT NULL DEFAULT 0,
	`completionTokens` int NOT NULL DEFAULT 0,
	`estimatedCostMilliCents` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiDailyUsage_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiDailyUsage_day_unique` UNIQUE(`day`)
);
--> statement-breakpoint
CREATE TABLE `redisCacheDailyMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day` varchar(10) NOT NULL,
	`cacheHits` int NOT NULL DEFAULT 0,
	`cacheMisses` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `redisCacheDailyMetrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `redisCacheDailyMetrics_day_unique` UNIQUE(`day`)
);
--> statement-breakpoint
CREATE TABLE `userDailyAiUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`day` varchar(10) NOT NULL,
	`promptRequests` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userDailyAiUsage_id` PRIMARY KEY(`id`),
	CONSTRAINT `userDailyAiUsage_user_day_unique` UNIQUE(`userId`,`day`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('free','pro','elite') DEFAULT 'free' NOT NULL;