// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const invitations=sqliteTable('invitations',{id:text('id').primaryKey(),owner:text('owner').notNull(),data:text('data').notNull(),entitlement:text('entitlement').notNull().default('free_beta'),published:integer('published').notNull().default(0),updated:text('updated').notNull()});
export const assets=sqliteTable('assets',{id:text('id').primaryKey(),invitation:text('invitation').notNull(),kind:text('kind').notNull(),mime:text('mime').notNull(),size:integer('size').notNull()});

export const guestSessions=sqliteTable('guest_sessions',{tokenHash:text('token_hash').primaryKey(),owner:text('owner').notNull().unique(),created:text('created').notNull()});
