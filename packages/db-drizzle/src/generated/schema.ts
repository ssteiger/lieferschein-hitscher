import { pgTable, uuid, text, varchar, date, timestamp, index, foreignKey, integer, unique, jsonb, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: boolean().notNull().default(false),
	image: text(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp().notNull(),
	token: text().notNull().unique(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
}, (table) => ({
	idx_session_userId: index("idx_session_userId").on(table.userId),
	session_userId_fkey: foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "session_userId_fkey"
	}).onDelete("cascade"),
}));

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp(),
	refreshTokenExpiresAt: timestamp(),
	scope: text(),
	password: text(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (table) => ({
	idx_account_userId: index("idx_account_userId").on(table.userId),
	account_userId_fkey: foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "account_userId_fkey"
	}).onDelete("cascade"),
}));

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (table) => ({
	idx_verification_identifier: index("idx_verification_identifier").on(table.identifier),
}));

export const passkey = pgTable("passkey", {
	id: text().primaryKey().notNull(),
	name: text(),
	publicKey: text().notNull(),
	userId: text().notNull(),
	credentialID: text().notNull(),
	counter: integer().notNull(),
	deviceType: text().notNull(),
	backedUp: boolean().notNull(),
	transports: text(),
	createdAt: timestamp(),
	aaguid: text(),
}, (table) => ({
	idx_passkey_userId: index("idx_passkey_userId").on(table.userId),
	idx_passkey_credentialID: index("idx_passkey_credentialID").on(table.credentialID),
	passkey_userId_fkey: foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "passkey_userId_fkey"
	}).onDelete("cascade"),
}));

export const delivery_notes = pgTable("delivery_notes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	lieferschein_nr: text(),
	bestellnummer: varchar({ length: 12 }),
	delivery_date: date().default(sql`CURRENT_DATE`).notNull(),
	notes: text(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const delivery_note_items = pgTable("delivery_note_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	delivery_note_id: uuid().notNull(),
	article_name: text().notNull(),
	quantities: jsonb().$type<string[]>().default(['','','','','','']).notNull(),
	unit_price_cents: integer().default(0).notNull(),
	sort_order: integer().default(0).notNull(),
}, (table) => {
	return {
		idx_delivery_note_items_note_id: index("idx_delivery_note_items_note_id").using("btree", table.delivery_note_id.asc().nullsLast().op("uuid_ops")),
		delivery_note_items_delivery_note_id_fkey: foreignKey({
			columns: [table.delivery_note_id],
			foreignColumns: [delivery_notes.id],
			name: "delivery_note_items_delivery_note_id_fkey"
		}).onDelete("cascade"),
	}
});

export const app_settings = pgTable("app_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	setting_key: text().notNull(),
	setting_value: jsonb().default({}).notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		app_settings_setting_key_key: unique("app_settings_setting_key_key").on(table.setting_key),
	}
});
