ALTER TABLE "delivery_note_items" ADD COLUMN "quantities" jsonb DEFAULT '[0,0,0,0,0,0]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_notes" ADD COLUMN "bestellnummer" varchar(12);--> statement-breakpoint
ALTER TABLE "delivery_note_items" DROP COLUMN IF EXISTS "quantity_35";--> statement-breakpoint
ALTER TABLE "delivery_note_items" DROP COLUMN IF EXISTS "quantity_65";--> statement-breakpoint
ALTER TABLE "delivery_note_items" DROP COLUMN IF EXISTS "quantity_85";