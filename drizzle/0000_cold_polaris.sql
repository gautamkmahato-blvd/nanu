CREATE TABLE "contacts" (
	"email" varchar(320) PRIMARY KEY NOT NULL,
	"name" text,
	"interaction_count" integer DEFAULT 0 NOT NULL,
	"relationship_score" real DEFAULT 0 NOT NULL,
	"last_interaction_at" timestamp with time zone,
	"ai_brief" jsonb,
	"ai_brief_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corsair_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" text NOT NULL,
	"integration_id" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dek" text
);
--> statement-breakpoint
CREATE TABLE "corsair_entities" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" text NOT NULL,
	"entity_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"version" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corsair_events" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "corsair_integrations" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dek" text
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"label_ids" jsonb DEFAULT '[]'::jsonb,
	"is_sent" boolean DEFAULT false,
	"is_read" boolean DEFAULT false,
	"is_starred" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"from_email" varchar(320) NOT NULL,
	"from_name" text,
	"to_emails" jsonb NOT NULL,
	"cc_emails" jsonb DEFAULT '[]'::jsonb,
	"bcc_emails" jsonb DEFAULT '[]'::jsonb,
	"subject" text,
	"snippet" text,
	"body_text" text,
	"body_html" text,
	"has_attachments" boolean DEFAULT false,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"message_id_header" text,
	"in_reply_to" text,
	"references_header" text,
	"received_at" timestamp with time zone NOT NULL,
	"history_id" text,
	"size_estimate" integer,
	"priority_level" varchar(16),
	"priority_score" real,
	"ai_summary" text,
	"ai_processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gmail_label_sync_state" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"label_id" text NOT NULL,
	"thread_count" integer DEFAULT 0 NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gmail_label_sync_state_tenant_label_unique" UNIQUE("tenant_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "gmail_message_bodies" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"message_id" text NOT NULL,
	"body_text" text NOT NULL,
	"body_html" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gmail_message_bodies_tenant_message_unique" UNIQUE("tenant_id","message_id")
);
--> statement-breakpoint
CREATE TABLE "gmail_sync_state" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"last_history_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gmail_sync_state_tenant_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
ALTER TABLE "corsair_accounts" ADD CONSTRAINT "corsair_accounts_integration_id_corsair_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."corsair_integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corsair_entities" ADD CONSTRAINT "corsair_entities_account_id_corsair_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."corsair_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corsair_events" ADD CONSTRAINT "corsair_events_account_id_corsair_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."corsair_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contacts_score_idx" ON "contacts" USING btree ("relationship_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "emails_thread_idx" ON "emails" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "emails_from_idx" ON "emails" USING btree ("from_email");--> statement-breakpoint
CREATE INDEX "emails_received_idx" ON "emails" USING btree ("received_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "emails_priority_idx" ON "emails" USING btree ("priority_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "emails_ai_pending_idx" ON "emails" USING btree ("ai_processed_at");