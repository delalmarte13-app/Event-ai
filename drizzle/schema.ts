import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  interests: text("interests"), // JSON array stored as text
  isProfessional: boolean("isProfessional").default(false).notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "premium"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Events ───────────────────────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: mysqlEnum("eventType", [
    "wedding", "birthday", "reunion", "concert", "trip",
    "corporate", "life", "other",
  ]).default("other").notNull(),
  location: varchar("location", { length: 500 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  coverImageUrl: text("coverImageUrl"),
  inviteCode: varchar("inviteCode", { length: 16 }).unique(),
  status: mysqlEnum("status", ["draft", "active", "ended"]).default("active").notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  maxAttendees: int("maxAttendees"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Event Participants ───────────────────────────────────────────────────────
export const eventParticipants = mysqlTable("event_participants", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["organizer", "participant"]).default("participant").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type EventParticipant = typeof eventParticipants.$inferSelect;

// ─── Media ────────────────────────────────────────────────────────────────────
export const media = mysqlTable("media", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  uploaderId: int("uploaderId").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  mediaType: mysqlEnum("mediaType", ["photo", "video"]).notNull(),
  isPrivate: boolean("isPrivate").default(false).notNull(),
  caption: text("caption"),
  takenAt: timestamp("takenAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

// ─── Chat Messages ────────────────────────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  messageType: mysqlEnum("messageType", ["text", "image", "system"]).default("text").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─── Albums ───────────────────────────────────────────────────────────────────
export const albums = mysqlTable("albums", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  createdById: int("createdById").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  coverUrl: text("coverUrl"),
  aiSummary: text("aiSummary"),
  status: mysqlEnum("status", ["generating", "ready", "failed"]).default("generating").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Album = typeof albums.$inferSelect;
export type InsertAlbum = typeof albums.$inferInsert;

// ─── Album Items ──────────────────────────────────────────────────────────────
export const albumItems = mysqlTable("album_items", {
  id: int("id").autoincrement().primaryKey(),
  albumId: int("albumId").notNull(),
  mediaId: int("mediaId").notNull(),
  order: int("order").default(0).notNull(),
  aiCaption: text("aiCaption"),
});

export type AlbumItem = typeof albumItems.$inferSelect;

// ─── Communities ──────────────────────────────────────────────────────────────
export const communities = mysqlTable("communities", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "photography", "music", "food", "travel", "sports",
    "technology", "arts", "business", "other",
  ]).default("other").notNull(),
  coverImageUrl: text("coverImageUrl"),
  isPrivate: boolean("isPrivate").default(false).notNull(),
  isPaid: boolean("isPaid").default(false).notNull(),
  memberCount: int("memberCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Community = typeof communities.$inferSelect;
export type InsertCommunity = typeof communities.$inferInsert;

// ─── Community Members ────────────────────────────────────────────────────────
export const communityMembers = mysqlTable("community_members", {
  id: int("id").autoincrement().primaryKey(),
  communityId: int("communityId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["admin", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type CommunityMember = typeof communityMembers.$inferSelect;

// ─── Professionals ────────────────────────────────────────────────────────────
export const professionals = mysqlTable("professionals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  category: mysqlEnum("category", [
    "photographer", "videographer", "catering", "florist",
    "music", "decoration", "venue", "other",
  ]).notNull(),
  description: text("description"),
  portfolioUrls: text("portfolioUrls"), // JSON array
  location: varchar("location", { length: 500 }),
  priceRange: varchar("priceRange", { length: 100 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  website: varchar("website", { length: 500 }),
  rating: int("rating").default(0),
  reviewCount: int("reviewCount").default(0),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = typeof professionals.$inferInsert;
