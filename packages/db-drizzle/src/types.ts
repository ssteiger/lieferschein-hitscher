import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import * as schema from "./generated/schema";

export { schema };

export { eq, and, or, like, not, desc, asc } from "drizzle-orm";

export type DeliveryNote = InferSelectModel<typeof schema.delivery_notes>;
export type NewDeliveryNote = InferInsertModel<typeof schema.delivery_notes>;
export type DeliveryNoteItem = InferSelectModel<typeof schema.delivery_note_items>;
export type NewDeliveryNoteItem = InferInsertModel<typeof schema.delivery_note_items>;
export type AppSetting = InferSelectModel<typeof schema.app_settings>;

export type User = InferSelectModel<typeof schema.user>;
export type NewUser = InferInsertModel<typeof schema.user>;
export type Session = InferSelectModel<typeof schema.session>;
export type NewSession = InferInsertModel<typeof schema.session>;
export type Account = InferSelectModel<typeof schema.account>;
export type NewAccount = InferInsertModel<typeof schema.account>;
export type Verification = InferSelectModel<typeof schema.verification>;
export type NewVerification = InferInsertModel<typeof schema.verification>;
export type Passkey = InferSelectModel<typeof schema.passkey>;
export type NewPasskey = InferInsertModel<typeof schema.passkey>;
