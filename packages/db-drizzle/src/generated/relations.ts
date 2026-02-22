import { relations } from "drizzle-orm/relations";
import { delivery_notes, delivery_note_items, user, session, account, passkey } from "./schema";

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	passkeys: many(passkey),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const passkeyRelations = relations(passkey, ({one}) => ({
	user: one(user, {
		fields: [passkey.userId],
		references: [user.id]
	}),
}));

export const delivery_note_itemsRelations = relations(delivery_note_items, ({one}) => ({
	delivery_note: one(delivery_notes, {
		fields: [delivery_note_items.delivery_note_id],
		references: [delivery_notes.id]
	}),
}));

export const delivery_notesRelations = relations(delivery_notes, ({many}) => ({
	delivery_note_items: many(delivery_note_items),
}));