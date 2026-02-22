import { pgTable, uuid, text, date, timestamp, index, foreignKey, integer, unique, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const delivery_notes = pgTable("delivery_notes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	lieferschein_nr: text(),
	delivery_date: date().default(sql`CURRENT_DATE`).notNull(),
	notes: text(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const delivery_note_items = pgTable("delivery_note_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	delivery_note_id: uuid().notNull(),
	article_name: text().notNull(),
	quantity_35: integer().default(0).notNull(),
	quantity_65: integer().default(0).notNull(),
	quantity_85: integer().default(0).notNull(),
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
