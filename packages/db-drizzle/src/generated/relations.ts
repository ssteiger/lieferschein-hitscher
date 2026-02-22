import { relations } from "drizzle-orm/relations";
import { delivery_notes, delivery_note_items } from "./schema";

export const delivery_note_itemsRelations = relations(delivery_note_items, ({one}) => ({
	delivery_note: one(delivery_notes, {
		fields: [delivery_note_items.delivery_note_id],
		references: [delivery_notes.id]
	}),
}));

export const delivery_notesRelations = relations(delivery_notes, ({many}) => ({
	delivery_note_items: many(delivery_note_items),
}));