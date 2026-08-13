CREATE TABLE `microPurchaseTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` varchar(80) NOT NULL,
	`paymentIntentId` varchar(255) NOT NULL,
	`status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`amountCents` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'usd',
	`metadata` text,
	`fulfilledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `microPurchaseTransactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `microPurchaseTransactions_paymentIntentId_unique` UNIQUE(`paymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `userWallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionCredits` int NOT NULL DEFAULT 0,
	`hintCredits` int NOT NULL DEFAULT 0,
	`streakSavers` int NOT NULL DEFAULT 0,
	`challengePasses` int NOT NULL DEFAULT 0,
	`premiumContentPasses` int NOT NULL DEFAULT 0,
	`masterclassPasses` int NOT NULL DEFAULT 0,
	`coachingMinutes` int NOT NULL DEFAULT 0,
	`xpBoostExpiresAt` timestamp,
	`monthlyBundleExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userWallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `userWallets_userId_unique` UNIQUE(`userId`)
);
