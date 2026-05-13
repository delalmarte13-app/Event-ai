CREATE TABLE `album_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`albumId` int NOT NULL,
	`mediaId` int NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`aiCaption` text,
	CONSTRAINT `album_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `albums` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`createdById` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`coverUrl` text,
	`aiSummary` text,
	`status` enum('generating','ready','failed') NOT NULL DEFAULT 'generating',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `albums_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` text NOT NULL,
	`messageType` enum('text','image','system') NOT NULL DEFAULT 'text',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('photography','music','food','travel','sports','technology','arts','business','other') NOT NULL DEFAULT 'other',
	`coverImageUrl` text,
	`isPrivate` boolean NOT NULL DEFAULT false,
	`isPaid` boolean NOT NULL DEFAULT false,
	`memberCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('admin','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `community_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('organizer','participant') NOT NULL DEFAULT 'participant',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`eventType` enum('wedding','birthday','reunion','concert','trip','corporate','life','other') NOT NULL DEFAULT 'other',
	`location` varchar(500),
	`startDate` timestamp,
	`endDate` timestamp,
	`coverImageUrl` text,
	`inviteCode` varchar(16),
	`status` enum('draft','active','ended') NOT NULL DEFAULT 'active',
	`isPublic` boolean NOT NULL DEFAULT false,
	`maxAttendees` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_inviteCode_unique` UNIQUE(`inviteCode`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`uploaderId` int NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`url` text NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`mediaType` enum('photo','video') NOT NULL,
	`isPrivate` boolean NOT NULL DEFAULT false,
	`caption` text,
	`takenAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professionals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`category` enum('photographer','videographer','catering','florist','music','decoration','venue','other') NOT NULL,
	`description` text,
	`portfolioUrls` text,
	`location` varchar(500),
	`priceRange` varchar(100),
	`contactEmail` varchar(320),
	`contactPhone` varchar(50),
	`website` varchar(500),
	`rating` int DEFAULT 0,
	`reviewCount` int DEFAULT 0,
	`isVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professionals_id` PRIMARY KEY(`id`),
	CONSTRAINT `professionals_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `interests` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isProfessional` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','premium') DEFAULT 'free' NOT NULL;