CREATE TABLE IF NOT EXISTS "app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_key" text NOT NULL,
	"setting_value" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_setting_key_key" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "delivery_note_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_note_id" uuid NOT NULL,
	"article_name" text NOT NULL,
	"quantity_35" integer DEFAULT 0 NOT NULL,
	"quantity_65" integer DEFAULT 0 NOT NULL,
	"quantity_85" integer DEFAULT 0 NOT NULL,
	"unit_price_cents" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "delivery_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lieferschein_nr" text,
	"delivery_date" date DEFAULT CURRENT_DATE NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP VIEW "public"."active_customer_membership";--> statement-breakpoint
DROP VIEW "public"."organization_billing_view";--> statement-breakpoint
DROP VIEW "public"."store_credit_balance";--> statement-breakpoint
DROP TABLE "job_run_status" CASCADE;--> statement-breakpoint
DROP TABLE "mb_type" CASCADE;--> statement-breakpoint
DROP TABLE "migration_import_data" CASCADE;--> statement-breakpoint
DROP TABLE "store_credit_usage_type" CASCADE;--> statement-breakpoint
DROP TABLE "customer_membership" CASCADE;--> statement-breakpoint
DROP TABLE "airdrop_campaign" CASCADE;--> statement-breakpoint
DROP TABLE "birthday_reward_program" CASCADE;--> statement-breakpoint
DROP TABLE "branding_settings" CASCADE;--> statement-breakpoint
DROP TABLE "cashback_program" CASCADE;--> statement-breakpoint
DROP TABLE "job_run" CASCADE;--> statement-breakpoint
DROP TABLE "mb_cashback_override" CASCADE;--> statement-breakpoint
DROP TABLE "mb_free_products" CASCADE;--> statement-breakpoint
DROP TABLE "mb_free_shipping" CASCADE;--> statement-breakpoint
DROP TABLE "mb_referral_override" CASCADE;--> statement-breakpoint
DROP TABLE "mb_tier_reached_bonus" CASCADE;--> statement-breakpoint
DROP TABLE "membership" CASCADE;--> statement-breakpoint
DROP TABLE "migration_import" CASCADE;--> statement-breakpoint
DROP TABLE "referral" CASCADE;--> statement-breakpoint
DROP TABLE "review_reward_program" CASCADE;--> statement-breakpoint
DROP TABLE "shop_customer" CASCADE;--> statement-breakpoint
DROP TABLE "shop_order" CASCADE;--> statement-breakpoint
DROP TABLE "store_credit" CASCADE;--> statement-breakpoint
DROP TABLE "store_credit_transaction" CASCADE;--> statement-breakpoint
DROP TABLE "bulk_operation_job" CASCADE;--> statement-breakpoint
DROP TABLE "integration" CASCADE;--> statement-breakpoint
DROP TABLE "job_run_task" CASCADE;--> statement-breakpoint
DROP TABLE "organization_subscription" CASCADE;--> statement-breakpoint
DROP TABLE "referral_page_view" CASCADE;--> statement-breakpoint
DROP TABLE "subscription_plan" CASCADE;--> statement-breakpoint
DROP TABLE "referred_customer_gets_type" CASCADE;--> statement-breakpoint
DROP TABLE "referring_customer_gets_type" CASCADE;--> statement-breakpoint
DROP TABLE "store_credit_source_type" CASCADE;--> statement-breakpoint
DROP TABLE "usage_record" CASCADE;--> statement-breakpoint
DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
DROP TABLE "organization_member" CASCADE;--> statement-breakpoint
DROP TABLE "organization_member_invite" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
DROP TABLE "apikey" CASCADE;--> statement-breakpoint
DROP TABLE "store_credit_setting" CASCADE;--> statement-breakpoint
DROP TABLE "referral_program" CASCADE;--> statement-breakpoint
DROP TABLE "shopify_flow_action" CASCADE;--> statement-breakpoint
DROP TABLE "organization" CASCADE;--> statement-breakpoint
DROP TABLE "customer_card_design" CASCADE;--> statement-breakpoint
DROP TABLE "organization_integration" CASCADE;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "delivery_note_items" ADD CONSTRAINT "delivery_note_items_delivery_note_id_fkey" FOREIGN KEY ("delivery_note_id") REFERENCES "public"."delivery_notes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_delivery_note_items_note_id" ON "delivery_note_items" USING btree ("delivery_note_id" uuid_ops);