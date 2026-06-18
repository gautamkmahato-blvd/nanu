// db/schema.ts
// UPDATED — adds tenant_id to emails + contacts for multi-tenant isolation.
// Run `node scripts/run-multi-tenant.mjs` to apply the DB migration,
// then restart the dev server.

import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

export type EmailAttachment = {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
};

export const corsairIntegrations = pgTable('corsair_integrations', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  name: text('name').notNull(),
  config: jsonb('config').notNull().default({}),
  dek: text('dek'),
});

export const corsairAccounts = pgTable('corsair_accounts', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  tenantId: text('tenant_id').notNull(),
  integrationId: text('integration_id')
    .notNull()
    .references(() => corsairIntegrations.id),
  config: jsonb('config').notNull().default({}),
  dek: text('dek'),
});

export const corsairEntities = pgTable('corsair_entities', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  accountId: text('account_id')
    .notNull()
    .references(() => corsairAccounts.id),
  entityId: text('entity_id').notNull(),
  entityType: text('entity_type').notNull(),
  version: text('version').notNull(),
  data: jsonb('data').notNull().default({}),
});

export const gmailMessageBodies = pgTable(
  'gmail_message_bodies',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull().default('default'),
    messageId: text('message_id').notNull(),
    bodyText: text('body_text').notNull(),
    bodyHtml: text('body_html'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('gmail_message_bodies_tenant_message_unique').on(
      table.tenantId,
      table.messageId,
    ),
  ],
);

export const gmailSyncState = pgTable(
  'gmail_sync_state',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    lastHistoryId: text('last_history_id'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique('gmail_sync_state_tenant_unique').on(table.tenantId)],
);

export const gmailLabelSyncState = pgTable(
  'gmail_label_sync_state',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    labelId: text('label_id').notNull(),
    threadCount: integer('thread_count').notNull().default(0),
    syncedAt: timestamp('synced_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('gmail_label_sync_state_tenant_label_unique').on(
      table.tenantId,
      table.labelId,
    ),
  ],
);

export const emails = pgTable(
  'emails',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull().default('default'), // ← NEW
    threadId: text('thread_id').notNull(),

    labelIds: jsonb('label_ids').$type<string[]>().default([]),
    isSent: boolean('is_sent').default(false),
    isRead: boolean('is_read').default(false),
    isStarred: boolean('is_starred').default(false),
    isArchived: boolean('is_archived').default(false),

    fromEmail: varchar('from_email', { length: 320 }).notNull(),
    fromName: text('from_name'),
    toEmails: jsonb('to_emails').$type<string[]>().notNull(),
    ccEmails: jsonb('cc_emails').$type<string[]>().default([]),
    bccEmails: jsonb('bcc_emails').$type<string[]>().default([]),

    subject: text('subject'),
    snippet: text('snippet'),
    bodyText: text('body_text'),
    bodyHtml: text('body_html'),
    hasAttachments: boolean('has_attachments').default(false),
    attachments: jsonb('attachments')
      .$type<EmailAttachment[]>()
      .default([]),

    messageIdHeader: text('message_id_header'),
    inReplyTo: text('in_reply_to'),
    referencesHeader: text('references_header'),

    receivedAt: timestamp('received_at', { withTimezone: true }).notNull(),
    historyId: text('history_id'),
    sizeEstimate: integer('size_estimate'),

    priorityLevel: varchar('priority_level', { length: 16 }),
    priorityScore: real('priority_score'),
    aiSummary: text('ai_summary'),
    aiAnalysis: jsonb('ai_analysis').$type<Record<string, unknown>>(),
    aiRawResponse: text('ai_raw_response'),
    aiProcessedAt: timestamp('ai_processed_at', { withTimezone: true }),
    actionTaken: boolean("action_taken").notNull().default(false),
    actionTakenAt: timestamp('action_taken_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('emails_thread_idx').on(table.threadId),
    index('emails_from_idx').on(table.fromEmail),
    index('emails_received_idx').on(table.receivedAt.desc()),
    index('emails_priority_idx').on(table.priorityScore.desc()),
    index('emails_ai_pending_idx').on(table.aiProcessedAt),
    index('emails_tenant_idx').on(table.tenantId),                         // ← NEW
    index('emails_tenant_received_idx').on(table.tenantId, table.receivedAt.desc()), // ← NEW
    index('emails_tenant_thread_idx').on(table.tenantId, table.threadId),  // ← NEW
  ],
);

export const contacts = pgTable(
  'contacts',
  {
    tenantId: text('tenant_id').notNull().default('default'), // ← NEW
    email: varchar('email', { length: 320 }).notNull(),       // ← was .primaryKey()
    name: text('name'),
    interactionCount: integer('interaction_count').default(0).notNull(),
    relationshipScore: real('relationship_score').default(0).notNull(),
    lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }),
    aiBrief: jsonb('ai_brief').$type<Record<string, unknown>>(),
    aiBriefAt: timestamp('ai_brief_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.email] }),                      // ← NEW composite PK
    index('contacts_tenant_score_idx').on(table.tenantId, table.relationshipScore.desc()), // ← NEW
  ],
);

export const corsairEvents = pgTable('corsair_events', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  accountId: text('account_id')
    .notNull()
    .references(() => corsairAccounts.id),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload').notNull().default({}),
  status: text('status'),
});
