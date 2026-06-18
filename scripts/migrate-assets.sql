-- scripts/migrate-assets.sql
-- Creates the email_assets table for the assets management feature.
-- Run once: psql $DATABASE_URL < scripts/migrate-assets.sql

CREATE TABLE IF NOT EXISTS email_assets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL,
  email_id TEXT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,

  -- 'attachment' | 'link' | 'inline_image'
  asset_type TEXT NOT NULL CHECK (asset_type IN ('attachment', 'link', 'inline_image')),

  -- For attachments: original filename. For links: link text or URL as display name.
  filename TEXT,

  -- For links: the full URL. NULL for attachments.
  url TEXT,

  -- MIME type (e.g. 'application/pdf', 'image/png'). NULL for links.
  mime_type TEXT,

  -- File size in bytes. NULL for links.
  size INTEGER,

  -- Gmail attachment ID — needed to download the file via API. NULL for links.
  attachment_id TEXT,

  -- Extracted domain for links (e.g. 'drive.google.com', 'figma.com'). NULL for attachments.
  domain TEXT,

  -- Denormalized from parent email for fast filtering without JOINs
  from_email VARCHAR(320) NOT NULL,
  from_name TEXT,
  subject TEXT,
  received_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant-scoped queries (most common access pattern)
CREATE INDEX idx_email_assets_tenant_received ON email_assets(tenant_id, received_at DESC);
CREATE INDEX idx_email_assets_tenant_type ON email_assets(tenant_id, asset_type);
CREATE INDEX idx_email_assets_tenant_mime ON email_assets(tenant_id, mime_type);
CREATE INDEX idx_email_assets_tenant_domain ON email_assets(tenant_id, domain);

-- Parent email lookup (cascade deletes, detail page)
CREATE INDEX idx_email_assets_email ON email_assets(email_id);

-- Text search on filenames
CREATE INDEX idx_email_assets_filename ON email_assets USING gin(to_tsvector('simple', COALESCE(filename, '')));

-- Prevent duplicate assets per email (same attachment_id or same URL)
CREATE UNIQUE INDEX idx_email_assets_unique_attachment
  ON email_assets(tenant_id, email_id, attachment_id)
  WHERE attachment_id IS NOT NULL;

CREATE UNIQUE INDEX idx_email_assets_unique_url
  ON email_assets(tenant_id, email_id, url)
  WHERE url IS NOT NULL;
