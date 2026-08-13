CREATE TABLE `commerceEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('store_view','product_selected','checkout_started','payment_confirmed','payment_failed') NOT NULL,
	`productId` varchar(80),
	`paymentIntentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commerceEvents_id` PRIMARY KEY(`id`)
);
