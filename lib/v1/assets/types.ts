// lib/v1/assets/types.ts
// Shared types for the email assets feature.

// ---------------------------------------------------------------------------
// Asset types
// ---------------------------------------------------------------------------

export type AssetType = 'attachment' | 'link' | 'inline_image';

export type MimeCategory =
  | 'pdf'
  | 'image'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'archive'
  | 'video'
  | 'audio'
  | 'code'
  | 'other';

export type Asset = {
  id: string;
  tenantId: string;
  emailId: string;
  assetType: AssetType;
  filename: string | null;
  url: string | null;
  mimeType: string | null;
  size: number | null;
  attachmentId: string | null;
  domain: string | null;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  receivedAt: string;
  createdAt: string;
  // Computed on the fly
  mimeCategory: MimeCategory;
};

// ---------------------------------------------------------------------------
// Filter params for the API
// ---------------------------------------------------------------------------

export type AssetFilters = {
  assetType?: AssetType;
  mimeCategory?: MimeCategory;
  fromEmail?: string;
  domain?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minSize?: number;
  maxSize?: number;
  limit: number;
  offset: number;
};

// ---------------------------------------------------------------------------
// API response
// ---------------------------------------------------------------------------

export type AssetsApiResponse = {
  assets: Asset[];
  total: number;
  filters: {
    senders: string[];
    domains: string[];
    mimeCategories: MimeCategory[];
  };
};

// ---------------------------------------------------------------------------
// MIME category mapping
// ---------------------------------------------------------------------------

const MIME_CATEGORY_MAP: Record<string, MimeCategory> = {
  'application/pdf': 'pdf',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'image/bmp': 'image',
  'image/tiff': 'image',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/rtf': 'document',
  'text/plain': 'document',
  'text/markdown': 'document',
  'application/vnd.ms-excel': 'spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'text/csv': 'spreadsheet',
  'application/vnd.ms-powerpoint': 'presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/gzip': 'archive',
  'application/x-tar': 'archive',
  'application/x-7z-compressed': 'archive',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/webm': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'application/json': 'code',
  'application/javascript': 'code',
  'text/html': 'code',
  'text/css': 'code',
  'application/xml': 'code',
  'text/xml': 'code',
};

export function getMimeCategory(mimeType: string | null): MimeCategory {
  if (!mimeType) return 'other';
  const lower = mimeType.toLowerCase();

  // Exact match
  if (MIME_CATEGORY_MAP[lower]) return MIME_CATEGORY_MAP[lower];

  // Prefix match
  if (lower.startsWith('image/')) return 'image';
  if (lower.startsWith('video/')) return 'video';
  if (lower.startsWith('audio/')) return 'audio';
  if (lower.startsWith('text/')) return 'document';

  return 'other';
}

// ---------------------------------------------------------------------------
// Known link domains → friendly labels
// ---------------------------------------------------------------------------

export const KNOWN_DOMAINS: Record<string, string> = {
  'drive.google.com': 'Google Drive',
  'docs.google.com': 'Google Docs',
  'sheets.google.com': 'Google Sheets',
  'slides.google.com': 'Google Slides',
  'figma.com': 'Figma',
  'www.figma.com': 'Figma',
  'notion.so': 'Notion',
  'www.notion.so': 'Notion',
  'dropbox.com': 'Dropbox',
  'www.dropbox.com': 'Dropbox',
  'github.com': 'GitHub',
  'www.github.com': 'GitHub',
  'gitlab.com': 'GitLab',
  'www.gitlab.com': 'GitLab',
  'linear.app': 'Linear',
  'trello.com': 'Trello',
  'www.trello.com': 'Trello',
  'miro.com': 'Miro',
  'www.miro.com': 'Miro',
  'canva.com': 'Canva',
  'www.canva.com': 'Canva',
  'loom.com': 'Loom',
  'www.loom.com': 'Loom',
  'youtube.com': 'YouTube',
  'www.youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'airtable.com': 'Airtable',
  'www.airtable.com': 'Airtable',
};

export function getDomainLabel(domain: string | null): string | null {
  if (!domain) return null;
  return KNOWN_DOMAINS[domain.toLowerCase()] ?? null;
}
