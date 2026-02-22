import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import * as schema from "./generated/schema";

export { schema };

export { eq, and, or, like, not, desc, asc } from "drizzle-orm";

export type DeliveryNote = InferSelectModel<typeof schema.delivery_notes>;
export type NewDeliveryNote = InferInsertModel<typeof schema.delivery_notes>;
export type DeliveryNoteItem = InferSelectModel<typeof schema.delivery_note_items>;
export type NewDeliveryNoteItem = InferInsertModel<typeof schema.delivery_note_items>;
export type AppSetting = InferSelectModel<typeof schema.app_settings>;
