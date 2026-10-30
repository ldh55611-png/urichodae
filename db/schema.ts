// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const invitations=sqliteTable('invitations',{id:text('id').primaryKey(),owner:text('owner').notNull(),data:text('data').notNull(),entitlement:text('entitlement').notNull().default('free_beta'),published:integer('published').notNull().default(0),updated:text('updated').notNull()});
export const assets=sqliteTable('assets',{id:text('id').primaryKey(),invitation:text('invitation').notNull(),kind:text('kind').notNull(),mime:text('mime').notNull(),size:integer('size').notNull()});

export const guestSessions=sqliteTable('guest_sessions',{tokenHash:text('token_hash').primaryKey(),owner:text('owner').notNull().unique(),created:text('created').notNull()});

export const rsvps=sqliteTable('rsvps',{id:text('id').primaryKey(),invitation:text('invitation').notNull(),name:text('name').notNull(),side:text('side').notNull(),attending:integer('attending').notNull(),count:integer('count').notNull().default(1),meal:text('meal').notNull().default(''),bus:integer('bus').notNull().default(0),busCount:integer('bus_count').notNull().default(0),phone:text('phone').notNull().default(''),note:text('note').notNull().default(''),created:text('created').notNull()});
export const guestPhotos=sqliteTable('guest_photos',{id:text('id').primaryKey(),invitation:text('invitation').notNull(),uploader:text('uploader').notNull().default(''),mime:text('mime').notNull(),size:integer('size').notNull(),created:text('created').notNull()});
export const guestbook=sqliteTable('guestbook',{id:text('id').primaryKey(),invitation:text('invitation').notNull(),name:text('name').notNull(),message:text('message').notNull(),pwHash:text('pw_hash').notNull(),created:text('created').notNull()});
